import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as tokenService from '../token';

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
    localStorageMock.setItem(TOKEN_KEY, 'test-token');
    localStorageMock.setItem(EXP_KEY, (now + 120).toString());
    const token = await tokenService.getFreshToken();
    expect(token).toBe('test-token');
  });

  it('refreshes token if expired', async () => {
    localStorageMock.setItem(TOKEN_KEY, 'old-token');
    localStorageMock.setItem(EXP_KEY, (Math.floor(Date.now() / 1000) - 10).toString());
    vi.stubGlobal('fetchAuthSession', vi.fn(async () => ({
      accessToken: {
        toString: () => 'new-token',
        payload: { exp: Math.floor(Date.now() / 1000) + 300 },
      },
      idToken: {
        toString: () => 'id-token',
        payload: { exp: Math.floor(Date.now() / 1000) + 300 },
      },
    })));
    const token = await tokenService.getFreshToken();
    expect(token).toBe('new-token');
    expect(localStorageMock.setItem).toHaveBeenCalledWith(TOKEN_KEY, 'new-token');
  });

  it('handles refresh failure', async () => {
    localStorageMock.setItem(TOKEN_KEY, 'old-token');
    localStorageMock.setItem(EXP_KEY, (Math.floor(Date.now() / 1000) - 10).toString());
    vi.stubGlobal('fetchAuthSession', vi.fn(async () => { throw new Error('fail'); }));
    const token = await tokenService.getFreshToken();
    expect(token).toBeNull();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith(TOKEN_KEY);
    expect(localStorageMock.removeItem).toHaveBeenCalledWith(EXP_KEY);
  });

  it('clears token', () => {
    localStorageMock.setItem(TOKEN_KEY, 'token');
    localStorageMock.setItem(EXP_KEY, '123');
    tokenService.clearToken();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith(TOKEN_KEY);
    expect(localStorageMock.removeItem).toHaveBeenCalledWith(EXP_KEY);
  });
});
