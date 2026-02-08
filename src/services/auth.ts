import * as authApi from '../api/auth';
import { apiFetch } from '../api/client';
import type { User } from '../api/types';
import { mapUserRecordResponse, unwrapData, type ApiResponse, type ApiUserResponse } from '../api/mappers';

const getStoredTenantId = () => localStorage.getItem('am_tenant_id');

const ensureUserIds = (user: User): User => ({
    ...user,
    organizationId: user.organizationId ?? null,
    tenantId: user.tenantId ?? getStoredTenantId() ?? null,
});

export async function syncUser(currentUser?: User): Promise<User | null> {
    const token = localStorage.getItem('am_auth_token');
    if (!token) return null;
    const response = await apiFetch<ApiResponse<ApiUserResponse>>('/user/sync', { method: 'POST' });
    const data = unwrapData(response);
    const mapped = mapUserRecordResponse(data, currentUser);
    return ensureUserIds(mapped);
}

export async function login(email: string, password: string): Promise<User> {
    const { user, token } = await authApi.login(email, password);
    if (token && user) {
        const baseUser = ensureUserIds(user);
        localStorage.setItem('am_auth_token', token);
        localStorage.setItem('am_user', JSON.stringify(baseUser));
        try {
            const syncedUser = await syncUser(baseUser);
            if (syncedUser) {
                localStorage.setItem('am_user', JSON.stringify(syncedUser));
                return syncedUser;
            }
        } catch (error) {
            console.warn('User sync failed:', error);
        }
        return baseUser;
    }
    throw new Error('Authentication failed: Missing token or user data');
}

export async function logout(): Promise<void> {
    await authApi.logout();
    localStorage.removeItem('am_auth_token');
    localStorage.removeItem('am_user');
    localStorage.removeItem('am_tenant_id'); // Clear organization selection on logout
}

export async function getCurrentUser(): Promise<User | null> {
    const user = await authApi.getSessionUser();
    if (user) {
        const baseUser = ensureUserIds(user);
        localStorage.setItem('am_user', JSON.stringify(baseUser));
        try {
            const syncedUser = await syncUser(baseUser);
            if (syncedUser) {
                localStorage.setItem('am_user', JSON.stringify(syncedUser));
                return syncedUser;
            }
        } catch (error) {
            console.warn('User sync failed:', error);
        }
        return baseUser;
    }

    // Fallback to local storage if offline or session check fails but we have a user
    const userStr = localStorage.getItem('am_user');
    if (userStr) {
        try {
            const parsed = JSON.parse(userStr) as User;
            return ensureUserIds(parsed);
        } catch {
            return null;
        }
    }
    return null;
}
