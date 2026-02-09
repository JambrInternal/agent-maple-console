vi.mock('../token', () => ({
    getFreshToken: vi.fn(),
    clearToken: vi.fn(),
}));
import { getFreshToken } from '../token';
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
            organizationId: null,
            tenantId: null,
            mfaEnabled: false,
            createdAt: '2026-02-04T00:00:00Z',
        };

        vi.mocked(authApi.login).mockResolvedValue({ user, token: 'token-123' });
        vi.mocked(apiFetch).mockResolvedValue({
            data: {
                id: 'u1',
                email: 'test@example.com',
                created_at: '2026-02-04T00:00:00Z',
            },
        });

        const result = await authService.login('test@example.com', 'password');

        expect(result.organizationId).toBeNull();
        expect(localStorage.getItem('am_auth_token')).toBe('token-123');
        expect(localStorage.getItem('am_user')).toBe(JSON.stringify(result));
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
            organizationId: null,
            tenantId: null,
            mfaEnabled: false,
            createdAt: '2026-02-04T00:00:00Z',
        };

        vi.mocked(authApi.getSessionUser).mockImplementation(async () => {
            localStorage.setItem('am_auth_token', 'token-restore');
            return user;
        });
        vi.mocked(apiFetch).mockResolvedValue({
            data: {
                id: 'u2',
                email: 'restore@example.com',
                created_at: '2026-02-04T00:00:00Z',
            },
        });

        vi.mocked(getFreshToken).mockResolvedValue('id-token');
        const result = await authService.getCurrentUser();
        expect(result).not.toBeNull();
        expect(result!.organizationId).toBeNull();
        expect(localStorage.getItem('am_user')).toBe(JSON.stringify(result));
        expect(apiFetch).toHaveBeenCalledWith('/user/sync', { method: 'POST' });
    });



        it('returns null when session is missing', async () => {
            vi.mocked(authApi.getSessionUser).mockResolvedValue(null);
            const result = await authService.getCurrentUser();
            expect(result).toBeNull();
            expect(apiFetch).not.toHaveBeenCalled();
        });

        it('returns null if sync fails during session restore', async () => {
            const user: User = {
                id: 'u4',
                email: 'warn@example.com',
                name: 'Warn User',
                role: 'admin',
                organizationId: null,
                tenantId: null,
                mfaEnabled: false,
                createdAt: '2026-02-04T00:00:00Z',
            };
            vi.mocked(authApi.getSessionUser).mockImplementation(async () => {
                localStorage.setItem('am_auth_token', 'token-warn');
                return user;
            });
            vi.mocked(apiFetch).mockRejectedValue(new Error('sync failed'));
            const result = await authService.getCurrentUser();
            expect(result).toBeNull();
        });
});
