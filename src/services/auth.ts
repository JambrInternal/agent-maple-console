import * as authApi from '../api/auth';
import { getErrorStatus } from '../api/client';
import { apiFetch } from '../api/client';
import type { User } from '../api/types';
import { mapUserRecordResponse, unwrapData, type ApiResponse, type ApiUserResponse } from '../api/mappers';
import { clearAdminMode } from '../utils/admin';
import { clearTheme } from '../utils/theme';
import logger from '../utils/verboseLogger';

const getStoredTenantId = () => localStorage.getItem('am_tenant_id');

const ensureUserIds = (user: User): User => ({
    ...user,
    organizationId: user.organizationId ?? null,
    tenantId: user.tenantId ?? getStoredTenantId() ?? null,
});

export async function syncUser(currentUser?: User): Promise<User | null> {
    const token = localStorage.getItem('am_auth_token');
    if (!token) {
        logger.warn('syncUser called with no auth token');
        return null;
    }
    logger.info('Syncing user with API', { currentUser });
        try {
            const response = await apiFetch<ApiResponse<ApiUserResponse>>('/user/sync', { method: 'POST' });
            logger.debug('Raw /user/sync response', response);
            const data = unwrapData(response);
            const mapped = mapUserRecordResponse(data, currentUser);
            logger.info('User sync successful', { userId: mapped?.id });
            return ensureUserIds(mapped);
        } catch (error) {
            const status = getErrorStatus(error);
            if (status === 401) {
                // session is invalid; caller should treat as logged out
                localStorage.removeItem('am_auth_token');
                localStorage.removeItem('am_user');
                return null;
            }
            logger.error('User sync failed', error);
            throw error;
    }
}

export async function login(email: string, password: string): Promise<User> {
    logger.info('Attempting login', { email });
    const { user, token } = await authApi.login(email, password);
    if (token && user) {
        const baseUser = ensureUserIds(user);
        localStorage.setItem('am_auth_token', token);
        localStorage.setItem('am_user', JSON.stringify(baseUser));
        try {
            const syncedUser = await syncUser(baseUser);
            if (syncedUser) {
                localStorage.setItem('am_user', JSON.stringify(syncedUser));
                logger.info('Login and user sync successful', { userId: syncedUser.id });
                return syncedUser;
            }
        } catch (error) {
            logger.error('User sync failed after login', error);
        }
        logger.info('Login successful, user sync skipped or failed', { userId: baseUser.id });
        return baseUser;
    }
    logger.error('Authentication failed: Missing token or user data', { email });
    throw new Error('Authentication failed: Missing token or user data');
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
        return null;
    }
    const token = await getFreshToken();
    if (!token) {
        logger.warn('Token hydration failed, treating as logged out');
        clearToken();
        return null;
    }
    const baseUser = ensureUserIds(user);
    localStorage.setItem('am_user', JSON.stringify(baseUser));
    try {
        const syncedUser = await syncUser(baseUser);
        if (syncedUser) {
            localStorage.setItem('am_user', JSON.stringify(syncedUser));
            logger.info('Current user sync successful', { userId: syncedUser.id });
            return syncedUser;
        }
        // If /user/sync returns 401, treat as logged out
        logger.warn('User sync failed or unauthorized, treating as logged out');
        clearToken();
        return null;
    } catch (error) {
        logger.error('User sync failed in getCurrentUser', error);
        clearToken();
        return null;
    }
    const userStr = localStorage.getItem('am_user');
    if (userStr) {
        try {
            const parsed = JSON.parse(userStr) as User;
            logger.info('Returning user from localStorage', { userId: parsed.id });
            return ensureUserIds(parsed);
        } catch (err) {
            logger.error('Failed to parse user from localStorage', err);
            return null;
        }
    }
    return null;
}
