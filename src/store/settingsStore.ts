import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SettingsState {
  language: 'vi' | 'en';
  timezone: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  practiceReminders: boolean;
  feedbackSounds: boolean;
  
  updateSettings: (updates: Partial<Omit<SettingsState, 'updateSettings' | 'reset'>>) => void;
  reset: () => void;
}

const defaultSettings = {
  language: 'vi' as const,
  timezone: 'Asia/Ho_Chi_Minh',
  emailNotifications: true,
  pushNotifications: true,
  practiceReminders: true,
  feedbackSounds: true,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,
      
      updateSettings: (updates) => set((state) => ({ ...state, ...updates })),
      reset: () => set(defaultSettings),
    }),
    {
      name: 'goodviet_settings',
    }
  )
);
