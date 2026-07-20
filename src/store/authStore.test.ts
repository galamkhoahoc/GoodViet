import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { User } from '../data/mockUsers';

const mocks = vi.hoisted(() => ({
  post: vi.fn(),
  patch: vi.fn(),
  clearTemporaryAccountData: vi.fn(),
  hasDataToMigrate: vi.fn(),
  migrate: vi.fn(),
}));

vi.mock('../services/api/apiClient', () => ({
  apiClient: {
    post: mocks.post,
    patch: mocks.patch,
  },
}));
vi.mock('../services/auth/temporaryAccountCleanup', () => ({
  clearTemporaryAccountData: mocks.clearTemporaryAccountData,
}));
vi.mock('../services/storage/migrator', () => ({
  MigrationService: {
    hasDataToMigrate: mocks.hasDataToMigrate,
    migrate: mocks.migrate,
  },
}));

import { useAuthStore } from './authStore';

describe('authStore temporary sessions', () => {
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
    vi.stubGlobal('window', {
      location: { origin: 'http://localhost', href: '' },
    });
    useAuthStore.setState({ user: null, isAuthenticated: false });
    mocks.clearTemporaryAccountData.mockResolvedValue(undefined);
    mocks.hasDataToMigrate.mockReturnValue(true);
    mocks.migrate.mockResolvedValue(undefined);
  });

  it('clears stale browser data before persisting a temporary login', async () => {
    mocks.post.mockResolvedValue({
      token: 'guest-token',
      user: {
        id: 'guest-user-id',
        email: 'guest@goodviet.glkh.vn',
        fullName: 'Guest',
        role: 'user',
        accountType: 'temporary',
      },
    });
    mocks.clearTemporaryAccountData.mockImplementation(async () => {
      expect(storage.has('goodviet_token')).toBe(false);
    });

    await expect(
      useAuthStore.getState().login('guest@goodviet.glkh.vn', 'SyntheticTest123!')
    ).resolves.toBe(true);

    expect(mocks.clearTemporaryAccountData).toHaveBeenCalledWith('guest-user-id');
    expect(storage.get('goodviet_token')).toBe('guest-token');
    expect(useAuthStore.getState().user?.accountType).toBe('temporary');
    expect(mocks.migrate).not.toHaveBeenCalled();
  });

  it('does not let a late profile response overwrite a newer login', async () => {
    let resolvePatch!: (value: unknown) => void;
    mocks.patch.mockReturnValue(new Promise(resolve => { resolvePatch = resolve; }));
    mocks.post.mockResolvedValue({
      token: 'new-token',
      user: {
        id: 'new-user',
        email: 'new@example.com',
        fullName: 'New User',
        role: 'user',
        accountType: 'standard',
      },
    });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({
        token: 'new-token',
        user: {
          id: 'new-user',
          email: 'new@example.com',
          fullName: 'New User',
          role: 'user',
          accountType: 'standard',
        },
      }),
    }));
    useAuthStore.setState({
      user: {
        userId: 'standard-user',
        email: 'user@example.com',
        fullName: 'User',
        role: 'user',
        accountType: 'standard',
      } as User,
      isAuthenticated: true,
    });

    const updating = useAuthStore.getState().updateUser({ fullName: 'Late update' });
    await useAuthStore.getState().login('new@example.com', 'Password123');
    resolvePatch({ user: { id: 'standard-user', fullName: 'Late update' } });
    await updating;

    expect(useAuthStore.getState().user?.userId).toBe('new-user');
    expect(JSON.parse(storage.get('goodviet_user') || '{}').userId).toBe('new-user');
  });
});
