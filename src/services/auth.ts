import * as authApi from '../api/auth';
import { apiFetch, API_CONFIG } from '../api/client';
import type { User } from '../api/types';

export async function syncUser(): Promise<void> {
    if (API_CONFIG.useMocks) return;
    const token = localStorage.getItem('am_auth_token');
    if (!token) return;
    await apiFetch('/user/sync', { method: 'POST' });
}

export async function login(email: string, password: string): Promise<User> {
    const { user, token } = await authApi.login(email, password);
    if (token && user) {
        localStorage.setItem('am_auth_token', token);
        localStorage.setItem('am_user', JSON.stringify(user));
        try {
            await syncUser();
        } catch (error) {
            console.warn('User sync failed:', error);
        }
        return user;
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
        localStorage.setItem('am_user', JSON.stringify(user));
        try {
            await syncUser();
        } catch (error) {
            console.warn('User sync failed:', error);
        }
        return user;
    }

    // Fallback to local storage if offline or session check fails but we have a user
    const userStr = localStorage.getItem('am_user');
    if (userStr) {
        try {
            return JSON.parse(userStr);
        } catch {
            return null;
        }
    }
    return null;
}
