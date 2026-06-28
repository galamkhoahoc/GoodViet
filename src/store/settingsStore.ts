import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SettingsState {
  language: 'vi' | 'en';
  timezone: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  
  updateSettings: (updates: Partial<Omit<SettingsState, 'updateSettings'>>) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: 'vi',
      timezone: 'Asia/Ho_Chi_Minh',
      emailNotifications: true,
      pushNotifications: true,
      
      updateSettings: (updates) => set((state) => ({ ...state, ...updates })),
    }),
    {
      name: 'goodviet_settings',
    }
  )
);
