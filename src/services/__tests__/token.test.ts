
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { fetchAuthSession } from 'aws-amplify/auth';
import * as tokenService from '../token';

vi.mock('aws-amplify/auth', () => ({
  fetchAuthSession: vi.fn(),
}));

const TOKEN_KEY = 'am_auth_token';
const EXP_KEY = 'am_auth_token_exp';

function mockLocalStorage() {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => { store[key] = value; }),
    removeItem: vi.fn((key) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    _store: store,
  };
}

describe('tokenService', () => {
  let localStorageMock: any;
  let originalLocalStorage: any;

  beforeEach(() => {
    localStorageMock = mockLocalStorage();
    originalLocalStorage = globalThis.localStorage;
    globalThis.localStorage = localStorageMock;
  });

  afterEach(() => {
    globalThis.localStorage = originalLocalStorage;
    vi.restoreAllMocks();
  });

  it('returns valid token from localStorage', async () => {
    const now = Math.floor(Date.now() / 1000);
      localStorageMock.setItem(TOKEN_KEY, 'id-token');
    localStorageMock.setItem(EXP_KEY, (now + 120).toString());
      const token = await tokenService.getFreshToken();
      expect(token).toBe('id-token');
  });

    it('refreshes token if expired', async () => {
      localStorageMock.setItem(TOKEN_KEY, 'old-token');
      localStorageMock.setItem(EXP_KEY, (Math.floor(Date.now() / 1000) - 10).toString());
      const { fetchAuthSession } = await import('aws-amplify/auth');
      vi.mocked(fetchAuthSession).mockResolvedValue({
        tokens: {
          idToken: {
            toString: () => 'id-token',
            payload: { exp: Math.floor(Date.now() / 1000) + 300 },
          },
        },
      } as any);
      const token = await tokenService.getFreshToken();
      expect(token).toBe('id-token');
      expect(localStorageMock.setItem).toHaveBeenCalledWith(TOKEN_KEY, 'id-token');
    });

  it('handles refresh failure with no existing token', async () => {
    const { fetchAuthSession } = await import('aws-amplify/auth');
    vi.mocked(fetchAuthSession).mockRejectedValue(new Error('fail'));
    const token = await tokenService.getFreshToken();
    expect(token).toBeNull();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith(TOKEN_KEY);
    expect(localStorageMock.removeItem).toHaveBeenCalledWith(EXP_KEY);
  });

  it('preserves existing token when refresh fails', async () => {
    localStorageMock.setItem(TOKEN_KEY, 'old-token');
    localStorageMock.setItem(EXP_KEY, (Math.floor(Date.now() / 1000) - 10).toString());
    const { fetchAuthSession } = await import('aws-amplify/auth');
    vi.mocked(fetchAuthSession).mockRejectedValue(new Error('fail'));

    const token = await tokenService.getFreshToken();

    expect(token).toBe('old-token');
    expect(localStorageMock.removeItem).not.toHaveBeenCalledWith(TOKEN_KEY);
    expect(localStorageMock.removeItem).not.toHaveBeenCalledWith(EXP_KEY);
  });

  it('clears token', () => {
    localStorageMock.setItem(TOKEN_KEY, 'token');
    localStorageMock.setItem(EXP_KEY, '123');
    tokenService.clearToken();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith(TOKEN_KEY);
    expect(localStorageMock.removeItem).toHaveBeenCalledWith(EXP_KEY);
  });

  it('uses stored JWT and derives exp when exp cache is missing', async () => {
    const futureExp = Math.floor(Date.now() / 1000) + 3600;
    const payload = btoa(JSON.stringify({ exp: futureExp }))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '');
    const token = `header.${payload}.signature`;

    localStorageMock.setItem(TOKEN_KEY, token);

    const fresh = await tokenService.getFreshToken();
    expect(fresh).toBe(token);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(EXP_KEY, String(futureExp));
    expect(fetchAuthSession).not.toHaveBeenCalled();
  });
});
