import { create } from 'zustand';
import { indexedDBService } from './indexedDB';
import { config } from '../../config/env';
import { useAuthStore } from '../../store/authStore';

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncAt: string | null;
  lastError: string | null;
}

interface SyncState extends SyncStatus {
  isSuspended: boolean;
  init: () => void;
  destroy: () => void;
  cancel: () => void;
  syncNow: () => Promise<{ uploaded: number; failed: number }>;
  updatePendingCount: () => Promise<void>;
}

let onlineHandler: (() => void) | null = null;
let offlineHandler: (() => void) | null = null;
let syncGeneration = 0;
let activeSyncController: AbortController | null = null;

const waitForRetry = (milliseconds: number, signal: AbortSignal) =>
  new Promise<void>((resolve) => {
    if (signal.aborted) {
      resolve();
      return;
    }
    const timeout = setTimeout(resolve, milliseconds);
    signal.addEventListener('abort', () => {
      clearTimeout(timeout);
      resolve();
    }, { once: true });
  });

export const useSyncStore = create<SyncState>((set, get) => ({
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  isSyncing: false,
  pendingCount: 0,
  lastSyncAt: null,
  lastError: null,
  isSuspended: true,

  init: () => {
    set({ isSuspended: false, isSyncing: false });

    // Listen for online/offline events
    onlineHandler = () => {
      set({ isOnline: true });
      // Auto-sync when coming back online
      get().syncNow();
    };
    offlineHandler = () => {
      set({ isOnline: false });
    };

    window.addEventListener('online', onlineHandler);
    window.addEventListener('offline', offlineHandler);

    // Initial count check
    get().updatePendingCount();

    // Auto-sync on init if online
    if (navigator.onLine) {
      get().syncNow();
    }
  },

  destroy: () => {
    syncGeneration += 1;
    activeSyncController?.abort();
    activeSyncController = null;
    if (onlineHandler) window.removeEventListener('online', onlineHandler);
    if (offlineHandler) window.removeEventListener('offline', offlineHandler);
    onlineHandler = null;
    offlineHandler = null;
    set({ isSuspended: true, isSyncing: false, pendingCount: 0, lastError: null });
  },

  cancel: () => {
    syncGeneration += 1;
    activeSyncController?.abort();
    activeSyncController = null;
    set({ isSuspended: true, isSyncing: false, pendingCount: 0, lastError: null });
  },

  updatePendingCount: async () => {
    try {
      if (get().isSuspended) {
        set({ pendingCount: 0 });
        return;
      }
      const userId = useAuthStore.getState().user?.userId;
      if (!userId) {
        set({ pendingCount: 0 });
        return;
      }
      const pending = await indexedDBService.getPendingUploads(userId);
      if (
        get().isSuspended
        || useAuthStore.getState().user?.userId !== userId
      ) return;
      set({ pendingCount: pending.length });
    } catch {
      // IndexedDB not available
    }
  },

  syncNow: async () => {
    const { isSyncing, isOnline, isSuspended } = get();
    if (isSuspended || isSyncing || !isOnline) return { uploaded: 0, failed: 0 };

    const userId = useAuthStore.getState().user?.userId;
    if (!userId) return { uploaded: 0, failed: 0 };

    const runGeneration = syncGeneration;
    const controller = new AbortController();
    activeSyncController?.abort();
    activeSyncController = controller;
    const isCurrentRun = () =>
      runGeneration === syncGeneration
      && !controller.signal.aborted
      && !get().isSuspended
      && useAuthStore.getState().user?.userId === userId;
    set({ isSyncing: true, lastError: null });

    let uploaded = 0;
    let failed = 0;

    try {
      const pending = await indexedDBService.getPendingUploads(userId);

      for (const record of pending) {
        if (!isCurrentRun()) break;
        // Skip if exceeded max retries
        if (record.metadata.retryCount >= config.indexedDB.maxRetries) {
          failed++;
          continue;
        }

        try {
          await indexedDBService.markAsUploading(record.id);
          if (!isCurrentRun()) break;

          // In mock mode, simulate upload with a delay
          if (config.useMockApi) {
            await waitForRetry(500, controller.signal);
            if (!isCurrentRun()) break;
            await indexedDBService.markAsUploaded(record.id);
            uploaded++;
          } else {
            // Real upload via apiClient
            const { apiClient } = await import('../api/apiClient');
            await apiClient.upload(
              '/api/audio/upload',
              record.blob,
              'audio',
              {
                assessmentId: record.metadata.assessmentId || '',
                sentenceId: record.metadata.sentenceId || '',
                phase: record.metadata.phase || '',
                metadata: JSON.stringify({
                  duration: record.metadata.duration,
                  format: record.metadata.format,
                }),
              },
              { signal: controller.signal },
            );
            if (!isCurrentRun()) break;
            await indexedDBService.markAsUploaded(record.id);
            uploaded++;
          }
        } catch {
          if (!isCurrentRun()) break;
          const delay = config.sync.retryDelays[record.metadata.retryCount] || 45000;
          await indexedDBService.markAsFailed(record.id);
          failed++;

          // Wait before next retry
          await waitForRetry(delay, controller.signal);
        }
      }

      // Cleanup old uploaded recordings
      if (isCurrentRun()) {
        await indexedDBService.cleanupOldRecordings();
        await indexedDBService.enforceQuota();
      }

      if (isCurrentRun()) {
        set({
          lastSyncAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      if (isCurrentRun()) {
        set({
          lastError: err instanceof Error ? err.message : 'Sync failed',
        });
      }
    } finally {
      if (isCurrentRun()) {
        await get().updatePendingCount();
        set({ isSyncing: false });
      }
      if (activeSyncController === controller) {
        activeSyncController = null;
      }
    }

    return { uploaded, failed };
  },
}));
