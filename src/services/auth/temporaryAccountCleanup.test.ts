import { beforeEach, describe, expect, it, vi } from 'vitest';
import { assessmentApi } from '../api/assessmentApi';
import { practiceApi } from '../api/practiceApi';
import { indexedDBService } from '../storage/indexedDB';
import { clearTemporaryAccountData, TEMPORARY_ACCOUNT_STORAGE_KEYS } from './temporaryAccountCleanup';

const actions = vi.hoisted(() => ({
  cancel: vi.fn(),
  resetAssessment: vi.fn(),
  resetChat: vi.fn(),
  resetNotifications: vi.fn(),
  resetSettings: vi.fn(),
}));

vi.mock('../storage/indexedDB', () => ({
  indexedDBService: { deleteRecordingsForUser: vi.fn() },
}));
vi.mock('../storage/syncManager', () => ({
  useSyncStore: { getState: () => ({ cancel: actions.cancel }) },
}));
vi.mock('../../store/assessmentStore', () => ({
  useAssessmentStore: { getState: () => ({ reset: actions.resetAssessment }) },
}));
vi.mock('../../store/chatStore', () => ({
  useChatStore: { getState: () => ({ reset: actions.resetChat }) },
}));
vi.mock('../../store/notificationStore', () => ({
  useNotificationStore: { getState: () => ({ reset: actions.resetNotifications }) },
}));
vi.mock('../../store/settingsStore', () => ({
  useSettingsStore: { getState: () => ({ reset: actions.resetSettings }) },
}));
vi.mock('../api/assessmentApi', () => ({
  assessmentApi: { resetMockState: vi.fn() },
}));
vi.mock('../api/practiceApi', () => ({
  practiceApi: { resetMockState: vi.fn() },
}));

describe('clearTemporaryAccountData', () => {
  const storage = new Map<string, string>();

  beforeEach(() => {
    vi.clearAllMocks();
    storage.clear();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
      clear: () => storage.clear(),
    });
    for (const key of TEMPORARY_ACCOUNT_STORAGE_KEYS) storage.set(key, 'guest-data');
    vi.mocked(indexedDBService.deleteRecordingsForUser).mockResolvedValue(3);
  });

  it('cancels sync and clears every browser data source for the guest user', async () => {
    await clearTemporaryAccountData('guest-user-id');

    expect(actions.cancel).toHaveBeenCalledTimes(1);
    expect(indexedDBService.deleteRecordingsForUser).toHaveBeenNthCalledWith(1, 'guest-user-id');
    expect(indexedDBService.deleteRecordingsForUser).toHaveBeenNthCalledWith(2, 'anonymous');
    for (const key of TEMPORARY_ACCOUNT_STORAGE_KEYS) {
      expect(storage.has(key)).toBe(false);
    }
    expect(actions.resetAssessment).toHaveBeenCalledTimes(1);
    expect(actions.resetChat).toHaveBeenCalledTimes(1);
    expect(actions.resetNotifications).toHaveBeenCalledTimes(1);
    expect(actions.resetSettings).toHaveBeenCalledTimes(1);
    expect(assessmentApi.resetMockState).toHaveBeenCalledTimes(1);
    expect(practiceApi.resetMockState).toHaveBeenCalledTimes(1);
  });

  it('still resets local stores when IndexedDB is unavailable', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.mocked(indexedDBService.deleteRecordingsForUser).mockRejectedValue(new Error('IndexedDB unavailable'));

    await expect(clearTemporaryAccountData('guest-user-id')).resolves.toBeUndefined();
    expect(actions.resetChat).toHaveBeenCalledTimes(1);
    expect(actions.resetAssessment).toHaveBeenCalledTimes(1);
  });
});
