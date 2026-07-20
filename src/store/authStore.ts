import { create } from 'zustand';
import type { User } from '../data/mockUsers';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: Partial<User> & { password: string }) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  loadFromStorage: () => Promise<void>;
}

const STORAGE_KEY = 'goodviet_user';
const TOKEN_KEY = 'goodviet_token';
let authGeneration = 0;

function mapBackendUser(value: any, fallback?: User): User {
  const now = new Date().toISOString();
  return {
    userId: value?.userId ?? value?.id ?? fallback?.userId ?? '',
    email: value?.email ?? fallback?.email ?? '',
    fullName: value?.fullName ?? fallback?.fullName ?? '',
    role: value?.role ?? fallback?.role ?? 'user',
    accountType: value?.accountType ?? fallback?.accountType ?? 'standard',
    age: value?.age ?? fallback?.age ?? 0,
    phoneNumber: value?.phoneNumber ?? fallback?.phoneNumber,
    targetGoals: value?.targetGoals ?? fallback?.targetGoals,
    assessmentCompleted: value?.assessmentCompleted ?? fallback?.assessmentCompleted ?? false,
    currentPathwayId: value?.currentPathwayId ?? fallback?.currentPathwayId,
    totalRecordings: value?.totalRecordings ?? fallback?.totalRecordings ?? 0,
    totalPracticeTime: value?.totalPracticeTime ?? fallback?.totalPracticeTime ?? 0,
    currentStreak: value?.currentStreak ?? fallback?.currentStreak ?? 0,
    longestStreak: value?.longestStreak ?? fallback?.longestStreak ?? 0,
    createdAt: value?.createdAt ?? fallback?.createdAt ?? now,
    lastLoginAt: value?.lastLoginAt ?? fallback?.lastLoginAt ?? now,
    isActive: value?.isActive ?? fallback?.isActive ?? true,
    verifiedEmail: value?.verifiedEmail ?? fallback?.verifiedEmail ?? false,
  };
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,

  loadFromStorage: async () => {
    const loadGeneration = authGeneration;
    try {
      const savedUser = localStorage.getItem(STORAGE_KEY);
      const token = localStorage.getItem(TOKEN_KEY);
      
      if (savedUser && token) {
        const user = mapBackendUser(JSON.parse(savedUser));
        set({ user, isAuthenticated: true });

        // Check if migration is needed
        import('../services/storage/migrator').then(async ({ MigrationService }) => {
          if (
            loadGeneration === authGeneration
            && user.accountType !== 'temporary'
            && MigrationService.hasDataToMigrate()
          ) {
             await MigrationService.migrate();
          }
        });
        
        // Optionally fetch latest profile here
        import('../services/api/apiClient').then(async ({ apiClient }) => {
           try {
             const data: any = await apiClient.get('/api/users/profile');
             if (data && data.user) {
               const latestUser = mapBackendUser(data.user, user);
               if (loadGeneration !== authGeneration || get().user?.userId !== user.userId) return;
               set({ user: latestUser });
               localStorage.setItem(STORAGE_KEY, JSON.stringify(latestUser));
             }
           } catch (e) {
             console.error('Failed to fetch profile', e);
           }
        });
      }
    } catch { /* ignore */ }
  },

  login: async (email: string, password: string): Promise<boolean> => {
    const loginGeneration = ++authGeneration;
    try {
      const { apiClient } = await import('../services/api/apiClient');
      const response: any = await apiClient.post('/api/users/login', { email, password });
      
      if (response && response.token && response.user) {
        // Map backend response to frontend User interface
        const mappedUser = mapBackendUser(response.user);
        if (loginGeneration !== authGeneration) return false;

        if (mappedUser.accountType === 'temporary') {
          const { clearTemporaryAccountData } = await import('../services/auth/temporaryAccountCleanup');
          await clearTemporaryAccountData(mappedUser.userId);
          if (loginGeneration !== authGeneration) return false;
        }
        
        localStorage.setItem(TOKEN_KEY, response.token);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mappedUser));
        set({ user: mappedUser, isAuthenticated: true });
        
        // Trigger migration if needed
        const { MigrationService } = await import('../services/storage/migrator');
        if (
          mappedUser.accountType !== 'temporary'
          && MigrationService.hasDataToMigrate()
        ) {
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
    const registerGeneration = ++authGeneration;
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
        const mappedUser = mapBackendUser(response.user);
        if (registerGeneration !== authGeneration) return false;
        
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

  logout: async () => {
    const logoutGeneration = ++authGeneration;
    const currentUser = get().user;

    if (currentUser?.accountType === 'temporary') {
      try {
        const { clearTemporaryAccountData } = await import('../services/auth/temporaryAccountCleanup');
        await clearTemporaryAccountData(currentUser.userId);
      } catch (error) {
        console.warn('Temporary browser data cleanup was incomplete', error);
      }
    }

    try {
      const { apiClient } = await import('../services/api/apiClient');
      await apiClient.post('/api/users/logout');
    } catch (error) {
      // Local logout must still complete. Temporary accounts are reset again
      // before their next login if this request could not reach the server.
      console.warn('Server logout failed', error);
    } finally {
      if (logoutGeneration === authGeneration) {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(TOKEN_KEY);
        set({ user: null, isAuthenticated: false });
      }
    }
  },

  updateUser: async (updates) => {
    const { user } = get();
    if (!user) return;
    const updateGeneration = authGeneration;
    const updatingUserId = user.userId;
    
    // Optimistic update
    const updated = { ...user, ...updates };
    set({ user: updated });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Backend update
    try {
      const { apiClient } = await import('../services/api/apiClient');
      const response: any = await apiClient.patch('/api/users/profile', updates);
      if (response && response.user) {
        if (
          updateGeneration !== authGeneration
          || get().user?.userId !== updatingUserId
        ) return;
        const latestUser = mapBackendUser(response.user, updated);
        set({ user: latestUser });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(latestUser));
      }
    } catch (err) {
      console.error('Failed to update user profile', err);
      // Revert optimistic update on failure could be implemented here
    }
  },
}));
