import { create } from 'zustand';
import type { User } from '../data/mockUsers';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: Partial<User> & { password: string }) => Promise<boolean>;
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
        // Map backend response to frontend User interface
        const mappedUser: User = {
          userId: response.user.id,
          email: response.user.email,
          fullName: response.user.fullName,
          age: response.user.age || 0,
          phoneNumber: response.user.phoneNumber,
          targetGoals: response.user.targetGoals,
          assessmentCompleted: response.user.assessmentCompleted || false,
          currentPathwayId: response.user.currentPathwayId,
          totalRecordings: response.user.totalRecordings || 0,
          totalPracticeTime: response.user.totalPracticeTime || 0,
          currentStreak: response.user.currentStreak || 0,
          longestStreak: response.user.longestStreak || 0,
          createdAt: response.user.createdAt || new Date().toISOString(),
          lastLoginAt: response.user.lastLoginAt || new Date().toISOString(),
          isActive: response.user.isActive !== undefined ? response.user.isActive : true,
          verifiedEmail: response.user.verifiedEmail !== undefined ? response.user.verifiedEmail : false,
        };
        
        localStorage.setItem(TOKEN_KEY, response.token);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mappedUser));
        set({ user: mappedUser, isAuthenticated: true });
        
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
      
      // Map frontend data to backend expected format
      const backendData = {
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        age: data.age,
        targetGoals: data.targetGoals,
      };
      
      const response: any = await apiClient.post('/api/users/register', backendData);
      
      if (response && response.token && response.user) {
        // Map backend response to frontend User interface
        const mappedUser: User = {
          userId: response.user.id,
          email: response.user.email,
          fullName: response.user.fullName,
          age: response.user.age || 0,
          phoneNumber: response.user.phoneNumber,
          targetGoals: response.user.targetGoals,
          assessmentCompleted: false,
          totalRecordings: response.user.totalRecordings || 0,
          totalPracticeTime: response.user.totalPracticeTime || 0,
          currentStreak: response.user.currentStreak || 0,
          longestStreak: response.user.longestStreak || 0,
          createdAt: response.user.createdAt || new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          isActive: true,
          verifiedEmail: true,
        };
        
        localStorage.setItem(TOKEN_KEY, response.token);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mappedUser));
        set({ user: mappedUser, isAuthenticated: true });
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
