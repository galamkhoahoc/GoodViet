import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({
  user: { userId: 'guest-user' } as { userId: string } | null,
  getPendingUploads: vi.fn(),
  markAsUploading: vi.fn(),
  markAsUploaded: vi.fn(),
  markAsFailed: vi.fn(),
  cleanupOldRecordings: vi.fn(),
  enforceQuota: vi.fn(),
  upload: vi.fn(),
}));

vi.mock('../../store/authStore', () => ({
  useAuthStore: { getState: () => ({ user: state.user }) },
}));
vi.mock('./indexedDB', () => ({
  indexedDBService: {
    getPendingUploads: state.getPendingUploads,
    markAsUploading: state.markAsUploading,
    markAsUploaded: state.markAsUploaded,
    markAsFailed: state.markAsFailed,
    cleanupOldRecordings: state.cleanupOldRecordings,
    enforceQuota: state.enforceQuota,
  },
}));
vi.mock('../api/apiClient', () => ({
  apiClient: { upload: state.upload },
}));
vi.mock('../../config/env', () => ({
  config: {
    useMockApi: false,
    indexedDB: { maxRetries: 3 },
    sync: { retryDelays: [1] },
  },
}));

import { useSyncStore } from './syncManager';

describe('syncManager account isolation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('window', {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    vi.stubGlobal('navigator', { onLine: false });
    state.user = { userId: 'guest-user' };
    state.getPendingUploads.mockResolvedValue([{
      id: 'recording-1',
      blob: new Blob(['audio']),
      metadata: {
        userId: 'guest-user',
        retryCount: 0,
        duration: 1,
        format: 'webm',
      },
    }]);
    state.markAsUploading.mockResolvedValue(undefined);
    state.markAsUploaded.mockResolvedValue(undefined);
    state.markAsFailed.mockResolvedValue(undefined);
    state.cleanupOldRecordings.mockResolvedValue(0);
    state.enforceQuota.mockResolvedValue(0);
    state.upload.mockResolvedValue({ id: 'uploaded' });
    useSyncStore.setState({
      isOnline: true,
      isSyncing: false,
      isSuspended: false,
      pendingCount: 0,
      lastError: null,
    });
  });

  afterEach(() => {
    useSyncStore.getState().destroy();
    vi.unstubAllGlobals();
  });

  it('queries and uploads only recordings owned by the authenticated user', async () => {
    state.upload.mockResolvedValue({ id: 'uploaded' });

    await useSyncStore.getState().syncNow();

    expect(state.getPendingUploads).toHaveBeenCalledWith('guest-user');
    expect(state.markAsUploaded).toHaveBeenCalledWith('recording-1');
  });

  it('aborts an in-flight HTTP upload when temporary cleanup cancels sync', async () => {
    let uploadSignal: AbortSignal | undefined;
    state.upload.mockImplementation((...args: unknown[]) => {
      uploadSignal = (args[4] as { signal?: AbortSignal } | undefined)?.signal;
      return new Promise((_resolve, reject) => {
        uploadSignal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
      });
    });

    const syncing = useSyncStore.getState().syncNow();
    await vi.waitFor(() => expect(state.upload).toHaveBeenCalledTimes(1));
    useSyncStore.getState().cancel();
    await syncing;

    expect(uploadSignal?.aborted).toBe(true);
    expect(state.markAsUploaded).not.toHaveBeenCalled();
    expect(useSyncStore.getState().isSyncing).toBe(false);
    expect(useSyncStore.getState().isSuspended).toBe(true);
  });

  it('does not restart after cancel until init opens the next session', async () => {
    useSyncStore.getState().cancel();

    await useSyncStore.getState().syncNow();

    expect(useSyncStore.getState().isSuspended).toBe(true);
    expect(state.getPendingUploads).not.toHaveBeenCalled();
    expect(state.upload).not.toHaveBeenCalled();

    useSyncStore.getState().init();
    expect(useSyncStore.getState().isSuspended).toBe(false);
    await vi.waitFor(() => expect(state.getPendingUploads).toHaveBeenCalled());
    state.getPendingUploads.mockClear();
    state.upload.mockClear();

    await useSyncStore.getState().syncNow();

    expect(state.getPendingUploads).toHaveBeenCalledWith('guest-user');
    expect(state.upload).toHaveBeenCalledTimes(1);
  });

  it('destroy clears an in-flight flag so init can sync the next session', async () => {
    let uploadSignal: AbortSignal | undefined;
    state.upload.mockImplementation((...args: unknown[]) => {
      uploadSignal = (args[4] as { signal?: AbortSignal } | undefined)?.signal;
      return new Promise((_resolve, reject) => {
        uploadSignal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
      });
    });

    const syncing = useSyncStore.getState().syncNow();
    await vi.waitFor(() => expect(state.upload).toHaveBeenCalledTimes(1));
    useSyncStore.getState().destroy();
    await syncing;

    expect(uploadSignal?.aborted).toBe(true);
    expect(useSyncStore.getState().isSyncing).toBe(false);
    expect(useSyncStore.getState().isSuspended).toBe(true);

    const uploadCallsBeforeSuspendedAttempt = state.upload.mock.calls.length;
    await useSyncStore.getState().syncNow();
    expect(state.upload).toHaveBeenCalledTimes(uploadCallsBeforeSuspendedAttempt);

    state.upload.mockResolvedValue({ id: 'uploaded-next-session' });
    useSyncStore.getState().init();
    await vi.waitFor(() => expect(state.getPendingUploads).toHaveBeenCalled());
    state.getPendingUploads.mockClear();
    state.upload.mockClear();

    await useSyncStore.getState().syncNow();

    expect(useSyncStore.getState().isSuspended).toBe(false);
    expect(state.upload).toHaveBeenCalledTimes(1);
  });
});
