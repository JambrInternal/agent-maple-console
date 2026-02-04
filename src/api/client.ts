// Mock API Client
// Simulates network delay and provides a consistent interface for all API calls.
// Replace with real fetch calls when connecting to backend.

const MOCK_DELAY_MS = 300;

export const API_CONFIG = {
    baseUrl: import.meta.env.VITE_API_URL || 'https://api.stage.certly.jambr.ca/stage',
    useMocks: import.meta.env.VITE_USE_MOCKS !== 'false',
};

/**
 * Gets the current auth token from storage
 */
const getAuthToken = () => localStorage.getItem('am_auth_token');

/**
 * Gets the selected tenant ID
 */
const getTenantId = () => localStorage.getItem('am_tenant_id');

export async function mockFetch<T>(data: T, delayMs = MOCK_DELAY_MS): Promise<T> {
    return new Promise((resolve) => {
        setTimeout(() => resolve(data), delayMs);
    });
}

export async function mockError(message: string, delayMs = MOCK_DELAY_MS): Promise<never> {
    return new Promise((_, reject) => {
        setTimeout(() => reject(new Error(message)), delayMs);
    });
}

export async function apiFetch<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token = getAuthToken();
    const tenantId = getTenantId();

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(tenantId ? { 'x-tenant-id': tenantId } : {}),
        ...(options.headers as Record<string, string> || {}),
    };

    const response = await fetch(`${API_CONFIG.baseUrl}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
}
