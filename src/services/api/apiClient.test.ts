import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, apiClient } from './apiClient';

describe('apiClient 401 session fencing', () => {
  const storage = new Map<string, string>();
  const location = {
    href: '/dashboard',
    origin: 'https://app.example.test',
  };

  beforeEach(() => {
    storage.clear();
    location.href = '/dashboard';
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
      clear: () => storage.clear(),
    });
    vi.stubGlobal('window', { location });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('preserves a newer login when an older request returns 401', async () => {
    storage.set('goodviet_token', 'old-session-token');
    storage.set('goodviet_user', JSON.stringify({ userId: 'old-user' }));

    let resolveFetch!: (response: Response) => void;
    vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>((resolve) => {
      resolveFetch = resolve;
    })));

    const request = apiClient.get('/protected');
    expect(fetch).toHaveBeenCalledOnce();

    storage.set('goodviet_token', 'new-session-token');
    storage.set('goodviet_user', JSON.stringify({ userId: 'new-user' }));
    resolveFetch(new Response(null, { status: 401, statusText: 'Unauthorized' }));

    await expect(request).rejects.toBeInstanceOf(ApiError);
    expect(storage.get('goodviet_token')).toBe('new-session-token');
    expect(JSON.parse(storage.get('goodviet_user') || '{}').userId).toBe('new-user');
    expect(location.href).toBe('/dashboard');
  });

  it('clears and redirects when the rejected token is still current', async () => {
    storage.set('goodviet_token', 'current-session-token');
    storage.set('goodviet_user', JSON.stringify({ userId: 'current-user' }));
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response(null, { status: 401, statusText: 'Unauthorized' })
    ));

    await expect(apiClient.get('/protected')).rejects.toMatchObject({ status: 401 });
    expect(storage.has('goodviet_token')).toBe(false);
    expect(storage.has('goodviet_user')).toBe(false);
    expect(location.href).toBe('/login');
  });
});
