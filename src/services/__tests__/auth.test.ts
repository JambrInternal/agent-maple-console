vi.mock('../token', () => ({
    getFreshToken: vi.fn(),
    clearToken: vi.fn(),
}));
import { getFreshToken } from '../token';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../api/auth', () => ({
    login: vi.fn(),
    register: vi.fn(),
    confirmRegistration: vi.fn(),
    forgotPassword: vi.fn(),
    confirmForgotPassword: vi.fn(),
    resendConfirmationCode: vi.fn(),
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

    it('stores token and user on login (no sync)', async () => {
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
        const result = await authService.login('test@example.com', 'password');

        expect(result.organizationId).toBeNull();
        expect(localStorage.getItem('am_auth_token')).toBe('token-123');
        expect(localStorage.getItem('am_user')).toBe(JSON.stringify(result));
        expect(apiFetch).not.toHaveBeenCalledWith('/user/sync', { method: 'POST' });
    });

    it('hydrates user on session restore (no sync)', async () => {
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
        vi.mocked(getFreshToken).mockResolvedValue('id-token');
        const result = await authService.getCurrentUser();
        expect(result).not.toBeNull();
        expect(result!.organizationId).toBeNull();
        expect(localStorage.getItem('am_user')).toBe(JSON.stringify(result));
        expect(apiFetch).not.toHaveBeenCalledWith('/user/sync', { method: 'POST' });
    });

    it('registers a new invited user account', async () => {
        vi.mocked(authApi.register).mockResolvedValue({
            isComplete: false,
            nextStep: 'CONFIRM_SIGN_UP',
            codeDeliveryDestination: 'invitee@example.com',
            codeDeliveryMedium: 'EMAIL',
        });

        const result = await authService.register('invitee@example.com', 'Temporary123!');

        expect(authApi.register).toHaveBeenCalledWith('invitee@example.com', 'Temporary123!');
        expect(result.isComplete).toBe(false);
        expect(result.nextStep).toBe('CONFIRM_SIGN_UP');
    });

    it('passes invited user profile fields to api register when provided', async () => {
        vi.mocked(authApi.register).mockResolvedValue({
            isComplete: true,
            nextStep: 'DONE',
            codeDeliveryDestination: null,
            codeDeliveryMedium: null,
        });

        await authService.register('invitee@example.com', 'Temporary123!', {
            givenName: 'Jamie',
            familyName: 'Ng',
        });

        expect(authApi.register).toHaveBeenCalledWith('invitee@example.com', 'Temporary123!', {
            givenName: 'Jamie',
            familyName: 'Ng',
        });
    });

    it('confirms invited user registration code', async () => {
        vi.mocked(authApi.confirmRegistration).mockResolvedValue();

        await authService.confirmRegistration('invitee@example.com', '123456');

        expect(authApi.confirmRegistration).toHaveBeenCalledWith('invitee@example.com', '123456');
    });

    it('starts forgot-password flow', async () => {
        vi.mocked(authApi.forgotPassword).mockResolvedValue({
            nextStep: 'CONFIRM_RESET_PASSWORD_WITH_CODE',
            codeDeliveryDestination: 'j***@example.com',
            codeDeliveryMedium: 'EMAIL',
        });

        const result = await authService.forgotPassword('reset.user@example.com');

        expect(authApi.forgotPassword).toHaveBeenCalledWith('reset.user@example.com');
        expect(result.nextStep).toBe('CONFIRM_RESET_PASSWORD_WITH_CODE');
    });

    it('resends confirmation code', async () => {
        vi.mocked(authApi.resendConfirmationCode).mockResolvedValue({
            codeDeliveryDestination: 'j***@example.com',
            codeDeliveryMedium: 'EMAIL',
        });

        const result = await authService.resendConfirmationCode('invitee@example.com');

        expect(authApi.resendConfirmationCode).toHaveBeenCalledWith('invitee@example.com');
        expect(result.codeDeliveryDestination).toBe('j***@example.com');
        expect(result.codeDeliveryMedium).toBe('EMAIL');
    });

    it('confirms forgot-password reset', async () => {
        vi.mocked(authApi.confirmForgotPassword).mockResolvedValue();

        await authService.confirmForgotPassword('reset.user@example.com', '123456', 'NewPass123!');

        expect(authApi.confirmForgotPassword).toHaveBeenCalledWith(
            'reset.user@example.com',
            '123456',
            'NewPass123!'
        );
    });

    it('returns null when session is missing', async () => {
        vi.mocked(authApi.getSessionUser).mockResolvedValue(null);
        const result = await authService.getCurrentUser();
        expect(result).toBeNull();
        expect(apiFetch).not.toHaveBeenCalled();
        expect(authApi.logout).not.toHaveBeenCalled();
    });

    it('clears auth, admin mode, and theme on logout', async () => {
        localStorage.setItem('am_auth_token', 'token-1');
        localStorage.setItem('am_user', JSON.stringify({ id: 'u1' }));
        localStorage.setItem('am_tenant_id', 'org_1');
        localStorage.setItem('am_admin_mode', 'true');
        localStorage.setItem('am_theme', 'light');
        document.documentElement.dataset.theme = 'light';

        await authService.logout();

        expect(authApi.logout).toHaveBeenCalledTimes(1);
        expect(localStorage.getItem('am_auth_token')).toBeNull();
        expect(localStorage.getItem('am_user')).toBeNull();
        expect(localStorage.getItem('am_tenant_id')).toBeNull();
        expect(localStorage.getItem('am_admin_mode')).toBeNull();
        expect(localStorage.getItem('am_theme')).toBeNull();
        expect(document.documentElement.dataset.theme).toBe('dark');
    });
});
