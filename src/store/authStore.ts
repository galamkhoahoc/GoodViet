import { create } from 'zustand';
import type { User } from '../data/mockUsers';
import { defaultUser } from '../data/mockUsers';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  register: (data: Partial<User> & { password: string }) => boolean;
  logout: () => void;
  updateUser: (updates: Partial<User>) => Promise<void>;
  loadFromStorage: () => Promise<void>;
}

const STORAGE_KEY = 'goodviet_user';
const TOKEN_KEY = 'goodviet_token';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,

  loadFromStorage: async () => {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEY);
      const token = localStorage.getItem(TOKEN_KEY);
      
      if (savedUser && token) {
        const user = JSON.parse(savedUser) as User;
        set({ user, isAuthenticated: true });

        // Check if migration is needed
        import('../services/storage/migrator').then(async ({ MigrationService }) => {
          if (MigrationService.hasDataToMigrate()) {
             await MigrationService.migrate();
          }
        });
        
        // Optionally fetch latest profile here
        import('../services/api/apiClient').then(async ({ apiClient }) => {
           try {
             const data: any = await apiClient.get('/api/users/profile');
             if (data && data.user) {
               set({ user: data.user });
               localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user));
             }
           } catch (e) {
             console.error('Failed to fetch profile', e);
           }
        });
      }
    } catch { /* ignore */ }
  },

  login: async (email: string, password: string): Promise<boolean> => {
    try {
      const { apiClient } = await import('../services/api/apiClient');
      const response: any = await apiClient.post('/api/users/login', { email, password });
      
      if (response && response.token && response.user) {
        localStorage.setItem(TOKEN_KEY, response.token);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(response.user));
        set({ user: response.user, isAuthenticated: true });
        
        // Trigger migration if needed
        const { MigrationService } = await import('../services/storage/migrator');
        if (MigrationService.hasDataToMigrate()) {
           await MigrationService.migrate();
        }
        
        return true;
      }
      return false;
    } catch (err) {
      console.error('Login failed', err);
      return false;
    }
  },

  register: async (data): Promise<boolean> => {
    try {
      const { apiClient } = await import('../services/api/apiClient');
      const response: any = await apiClient.post('/api/users/register', {
        email: data.email,
        password: data.password,
        fullName: data.fullName || data.email?.split('@')[0]
      });
      
      if (response && response.token && response.user) {
        localStorage.setItem(TOKEN_KEY, response.token);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(response.user));
        set({ user: response.user, isAuthenticated: true });
        return true;
      }
      return false;
    } catch (err) {
      console.error('Register failed', err);
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TOKEN_KEY);
    set({ user: null, isAuthenticated: false });
  },

  updateUser: async (updates) => {
    const { user } = get();
    if (!user) return;
    
    // Optimistic update
    const updated = { ...user, ...updates };
    set({ user: updated });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Backend update
    try {
      const { apiClient } = await import('../services/api/apiClient');
      const response: any = await apiClient.patch('/api/users/profile', updates);
      if (response && response.user) {
        set({ user: response.user });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(response.user));
      }
    } catch (err) {
      console.error('Failed to update user profile', err);
      // Revert optimistic update on failure could be implemented here
    }
  },
}));
