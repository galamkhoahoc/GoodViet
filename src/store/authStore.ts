import { create } from 'zustand';
import type { User } from '../data/mockUsers';
import { defaultUser } from '../data/mockUsers';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  register: (data: Partial<User> & { password: string }) => boolean;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  loadFromStorage: () => void;
}

const STORAGE_KEY = 'goodviet_user';
const USERS_KEY = 'goodviet_users';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,

  loadFromStorage: () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const user = JSON.parse(saved) as User;
        set({ user, isAuthenticated: true });
      }
    } catch { /* ignore */ }
  },

  login: (email: string, _password: string) => {
    try {
      const usersStr = localStorage.getItem(USERS_KEY);
      const users: (User & { password: string })[] = usersStr ? JSON.parse(usersStr) : [];
      const found = users.find(u => u.email === email);
      if (found) {
        const { password: _, ...user } = found;
        const updatedUser = { ...user, lastLoginAt: new Date().toISOString() };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
        set({ user: updatedUser, isAuthenticated: true });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  register: (data) => {
    try {
      const usersStr = localStorage.getItem(USERS_KEY);
      const users: (User & { password: string })[] = usersStr ? JSON.parse(usersStr) : [];

      if (users.find(u => u.email === data.email)) return false;

      const newUser: User & { password: string } = {
        ...defaultUser,
        ...data,
        userId: 'user-' + Date.now(),
        password: data.password || '',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        isActive: true,
        verifiedEmail: true,
      };
      users.push(newUser);
      localStorage.setItem(USERS_KEY, JSON.stringify(users));

      const { password: _, ...user } = newUser;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      set({ user, isAuthenticated: true });
      return true;
    } catch {
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ user: null, isAuthenticated: false });
  },

  updateUser: (updates) => {
    const { user } = get();
    if (!user) return;
    const updated = { ...user, ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Also update in users list
    try {
      const usersStr = localStorage.getItem(USERS_KEY);
      const users: (User & { password: string })[] = usersStr ? JSON.parse(usersStr) : [];
      const idx = users.findIndex(u => u.userId === user.userId);
      if (idx >= 0) {
        users[idx] = { ...users[idx], ...updates };
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
      }
    } catch { /* ignore */ }

    set({ user: updated });
  },
}));
