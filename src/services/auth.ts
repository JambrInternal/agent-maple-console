
import * as authApi from '../api/auth';
import { clearAdminMode } from '../utils/admin';
import { clearTheme } from '../utils/theme';
import logger from '../utils/verboseLogger';

const getStoredTenantId = () => localStorage.getItem('am_tenant_id');

import type { User } from '../api/types';
import type { RegisterResult } from '../api/auth';

const ensureUserIds = (user: User): User => ({
    ...user,
    organizationId: user.organizationId ?? null,
    tenantId: user.tenantId ?? getStoredTenantId() ?? null,
});

export async function login(email: string, password: string): Promise<User> {
    logger.info('Attempting login', { email });
    const { user, token } = await authApi.login(email, password);
    if (token && user) {
        const baseUser = ensureUserIds(user);
        localStorage.setItem('am_auth_token', token);
        localStorage.setItem('am_user', JSON.stringify(baseUser));
        logger.info('Login successful', { userId: baseUser.id });
        return baseUser;
    }
    logger.error('Authentication failed: Missing token or user data', { email });
    throw new Error('Authentication failed: Missing token or user data');
}

export async function register(email: string, password: string): Promise<RegisterResult> {
    logger.info('Attempting register', { email });
    const result = await authApi.register(email, password);
    logger.info('Register result received', {
        email,
        complete: result.isComplete,
        nextStep: result.nextStep,
    });
    return result;
}

export async function confirmRegistration(email: string, confirmationCode: string): Promise<void> {
    logger.info('Attempting registration confirmation', { email });
    await authApi.confirmRegistration(email, confirmationCode);
    logger.info('Registration confirmation complete', { email });
}

export async function logout(): Promise<void> {
    await authApi.logout();
    localStorage.removeItem('am_auth_token');
    localStorage.removeItem('am_user');
    localStorage.removeItem('am_tenant_id'); // Clear organization selection on logout
    clearAdminMode();
    clearTheme();
}

export async function getCurrentUser(): Promise<User | null> {
    logger.info('Fetching current user from session');
    // Hydrate token from Amplify session if missing/expired
    const { getFreshToken, clearToken } = await import('./token');
    const user = await authApi.getSessionUser();
    if (!user) {
        logger.warn('No session user, treating as logged out');
        clearToken();
        try {
            await authApi.logout(); // sign out of Cognito
        } catch {}
        return null;
    }
    const token = await getFreshToken();
    if (!token) {
        logger.warn('Token hydration failed, treating as logged out');
        clearToken();
        try {
            await authApi.logout(); // sign out of Cognito
        } catch {}
        return null;
    }
    const baseUser = ensureUserIds(user);
    localStorage.setItem('am_user', JSON.stringify(baseUser));
    logger.info('Current user hydrated from session', { userId: baseUser.id });
    return baseUser;
}
