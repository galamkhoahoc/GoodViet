import { assessmentApi } from '../api/assessmentApi';
import { practiceApi } from '../api/practiceApi';
import { indexedDBService } from '../storage/indexedDB';
import { useSyncStore } from '../storage/syncManager';
import { useAssessmentStore } from '../../store/assessmentStore';
import { useChatStore } from '../../store/chatStore';
import { useNotificationStore } from '../../store/notificationStore';
import { useSettingsStore } from '../../store/settingsStore';

export const TEMPORARY_ACCOUNT_STORAGE_KEYS = [
  'goodviet:local-gemma-chat:v1',
  'goodviet_notifications',
  'goodviet_settings',
  'assessmentCompleted',
  'currentPathway',
  'practiceHistory',
  'migration_completed',
] as const;

/** Clear browser-only data that belongs to the shared temporary account. */
export async function clearTemporaryAccountData(userId: string): Promise<void> {
  // Stop queued uploads before the server invalidates the temporary session.
  useSyncStore.getState().cancel();

  try {
    await indexedDBService.deleteRecordingsForUser(userId);
    // Older builds could store guest recordings under this fallback ID before
    // backend user IDs were normalized in the auth store.
    await indexedDBService.deleteRecordingsForUser('anonymous');
  } catch (error) {
    console.warn('Unable to clear temporary account recordings from IndexedDB', error);
  }

  for (const key of TEMPORARY_ACCOUNT_STORAGE_KEYS) {
    localStorage.removeItem(key);
  }

  useAssessmentStore.getState().reset();
  useChatStore.getState().reset();
  useNotificationStore.getState().reset();
  useSettingsStore.getState().reset();
  assessmentApi.resetMockState();
  practiceApi.resetMockState();
}
