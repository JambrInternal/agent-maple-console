export const API_CONFIG = {
    baseUrl: import.meta.env.VITE_API_URL || 'https://api.stage.certly.jambr.ca/stage',
};

/**
 * Gets the current auth token from storage
 */
const getAuthToken = () => localStorage.getItem('am_auth_token');

/**
 * Gets the selected tenant ID
 */
const getTenantId = () => localStorage.getItem('am_tenant_id');

export async function apiFetch<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token = getAuthToken();
    const tenantId = getTenantId();
    const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

    const headers: Record<string, string> = {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(tenantId ? { 'x-tenant-id': tenantId } : {}),
        ...(options.headers as Record<string, string> || {}),
    };

    if (!isFormData && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }

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
