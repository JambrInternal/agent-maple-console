import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../api/auth', () => ({
    login: vi.fn(),
    logout: vi.fn(),
    getSessionUser: vi.fn(),
}));

vi.mock('../../api/client', () => ({
    API_CONFIG: { baseUrl: '' },
    apiFetch: vi.fn(),
}));

import * as authService from '../auth';
import * as authApi from '../../api/auth';
import { apiFetch } from '../../api/client';
import type { User } from '../../api/types';

describe('auth service', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    it('stores token and syncs user on login', async () => {
        const user: User = {
            id: 'u1',
            email: 'test@example.com',
            name: 'Test User',
            role: 'admin',
            mfaEnabled: false,
            createdAt: '2026-02-04T00:00:00Z',
        };

        vi.mocked(authApi.login).mockResolvedValue({ user, token: 'token-123' });
        vi.mocked(apiFetch).mockResolvedValue({});

        const result = await authService.login('test@example.com', 'password');

        expect(result).toEqual(user);
        expect(localStorage.getItem('am_auth_token')).toBe('token-123');
        expect(localStorage.getItem('am_user')).toBe(JSON.stringify(user));
        expect(apiFetch).toHaveBeenCalledWith('/user/sync', { method: 'POST' });
    });

    it('skips user sync when no token exists', async () => {
        await authService.syncUser();
        expect(apiFetch).not.toHaveBeenCalled();
    });

    it('syncs and stores user on session restore', async () => {
        const user: User = {
            id: 'u2',
            email: 'restore@example.com',
            name: 'Restore User',
            role: 'member',
            mfaEnabled: false,
            createdAt: '2026-02-04T00:00:00Z',
        };

        vi.mocked(authApi.getSessionUser).mockImplementation(async () => {
            localStorage.setItem('am_auth_token', 'token-restore');
            return user;
        });
        vi.mocked(apiFetch).mockResolvedValue({});

        const result = await authService.getCurrentUser();

        expect(result).toEqual(user);
        expect(localStorage.getItem('am_user')).toBe(JSON.stringify(user));
        expect(apiFetch).toHaveBeenCalledWith('/user/sync', { method: 'POST' });
    });

    it('falls back to cached user when session is missing', async () => {
        const cachedUser: User = {
            id: 'u3',
            email: 'cached@example.com',
            name: 'Cached User',
            role: 'viewer',
            mfaEnabled: false,
            createdAt: '2026-02-04T00:00:00Z',
        };

        localStorage.setItem('am_user', JSON.stringify(cachedUser));
        vi.mocked(authApi.getSessionUser).mockResolvedValue(null);

        const result = await authService.getCurrentUser();

        expect(result).toEqual(cachedUser);
        expect(apiFetch).not.toHaveBeenCalled();
    });

    it('returns user even if sync fails during session restore', async () => {
        const user: User = {
            id: 'u4',
            email: 'warn@example.com',
            name: 'Warn User',
            role: 'admin',
            mfaEnabled: false,
            createdAt: '2026-02-04T00:00:00Z',
        };

        vi.mocked(authApi.getSessionUser).mockImplementation(async () => {
            localStorage.setItem('am_auth_token', 'token-warn');
            return user;
        });
        vi.mocked(apiFetch).mockRejectedValue(new Error('sync failed'));

        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const result = await authService.getCurrentUser();

        expect(result).toEqual(user);
        expect(warnSpy).toHaveBeenCalled();
        warnSpy.mockRestore();
    });
});
