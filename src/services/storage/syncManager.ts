import { create } from 'zustand';
import { indexedDBService } from './indexedDB';
import { config } from '../../config/env';

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncAt: string | null;
  lastError: string | null;
}

interface SyncState extends SyncStatus {
  init: () => void;
  destroy: () => void;
  syncNow: () => Promise<{ uploaded: number; failed: number }>;
  updatePendingCount: () => Promise<void>;
}

let onlineHandler: (() => void) | null = null;
let offlineHandler: (() => void) | null = null;

export const useSyncStore = create<SyncState>((set, get) => ({
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  isSyncing: false,
  pendingCount: 0,
  lastSyncAt: null,
  lastError: null,

  init: () => {
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
    if (onlineHandler) window.removeEventListener('online', onlineHandler);
    if (offlineHandler) window.removeEventListener('offline', offlineHandler);
    onlineHandler = null;
    offlineHandler = null;
  },

  updatePendingCount: async () => {
    try {
      const pending = await indexedDBService.getPendingUploads();
      set({ pendingCount: pending.length });
    } catch {
      // IndexedDB not available
    }
  },

  syncNow: async () => {
    const { isSyncing, isOnline } = get();
    if (isSyncing || !isOnline) return { uploaded: 0, failed: 0 };

    set({ isSyncing: true, lastError: null });

    let uploaded = 0;
    let failed = 0;

    try {
      const pending = await indexedDBService.getPendingUploads();

      for (const record of pending) {
        // Skip if exceeded max retries
        if (record.metadata.retryCount >= config.indexedDB.maxRetries) {
          failed++;
          continue;
        }

        try {
          await indexedDBService.markAsUploading(record.id);

          // In mock mode, simulate upload with a delay
          if (config.useMockApi) {
            await new Promise(resolve => setTimeout(resolve, 500));
            await indexedDBService.markAsUploaded(record.id);
            uploaded++;
          } else {
            // Real upload via apiClient
            const { apiClient } = await import('../api/apiClient');
            await apiClient.upload('/api/audio/upload', record.blob, 'audio', {
              assessmentId: record.metadata.assessmentId || '',
              sentenceId: record.metadata.sentenceId || '',
              phase: record.metadata.phase || '',
              metadata: JSON.stringify({
                duration: record.metadata.duration,
                format: record.metadata.format,
              })
            });
            await indexedDBService.markAsUploaded(record.id);
            uploaded++;
          }
        } catch (err) {
          const delay = config.sync.retryDelays[record.metadata.retryCount] || 45000;
          await indexedDBService.markAsFailed(record.id);
          failed++;

          // Wait before next retry
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }

      // Cleanup old uploaded recordings
      await indexedDBService.cleanupOldRecordings();
      await indexedDBService.enforceQuota();

      set({
        lastSyncAt: new Date().toISOString(),
      });
    } catch (err) {
      set({
        lastError: err instanceof Error ? err.message : 'Sync failed',
      });
    } finally {
      await get().updatePendingCount();
      set({ isSyncing: false });
    }

    return { uploaded, failed };
  },
}));
