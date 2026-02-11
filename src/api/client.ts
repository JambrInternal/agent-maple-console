export const navigation = {
    toLogin: () => window.location.assign('/login'),
};
let redirectingToLogin = false;
export const API_CONFIG = {
    baseUrl: import.meta.env.VITE_API_URL || 'https://api.dev.agentmaple.ca',
};

export class ApiError extends Error {
    status: number;
    statusText: string;
    details?: unknown;

    constructor(status: number, statusText: string, message: string, details?: unknown) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.statusText = statusText;
        this.details = details;
    }
}

export const getErrorStatus = (error: unknown): number | null => {
    if (!error || typeof error !== 'object') return null;
    const status = (error as { status?: unknown }).status;
    if (typeof status === 'number') return status;

    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string') {
        const match = message.match(/(?:Status\s+|API Error:\s+)(\d{3})\b/);
        if (match) {
            const parsed = Number(match[1]);
            if (Number.isFinite(parsed)) return parsed;
        }
    }

    return null;
};

/**
 * Gets the current auth token from storage
 */
const getAuthToken = () => localStorage.getItem('am_auth_token');

/**
 * Gets the selected tenant ID
 */
const getTenantId = () => localStorage.getItem('am_tenant_id');

const TENANT_HEADER_EXEMPT_PATHS = new Set([
    '/user/sync',
    '/user/tenants',
    '/user/accept-invitation',
]);

const shouldAttachTenantHeader = (endpoint: string): boolean => {
    const pathname = new URL(endpoint, API_CONFIG.baseUrl).pathname;
    return !TENANT_HEADER_EXEMPT_PATHS.has(pathname);
};

export async function apiFetch<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    // Use token provider for freshest token
    const { getFreshToken, clearToken } = await import('../services/token');
    const token = await getFreshToken();
    const tenantId = getTenantId();
    const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

    const headers = new Headers(options.headers as HeadersInit);
    if (token && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
    }
    if (tenantId && !headers.has('x-tenant-id') && shouldAttachTenantHeader(endpoint)) {
        headers.set('x-tenant-id', tenantId);
    }
    if (!isFormData && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    const url = new URL(endpoint, API_CONFIG.baseUrl).toString();
    const response = await fetch(url, {
        ...options,
        headers,
    });

    if (!response.ok) {
        if (response.status === 401) {
            clearToken();
            localStorage.removeItem('am_user');
            // Optionally clear tenant selection
            // localStorage.removeItem('am_tenant_id');
            // Only redirect if not already on /login and not already redirecting
            const logger = (await import('../utils/verboseLogger')).default;
            logger.warn('[API] 401 response, user logged out');
            if (!redirectingToLogin && window.location.pathname !== '/login') {
                redirectingToLogin = true;
                navigation.toLogin();
            }
            // Optionally: metrics hook
        }
        // 404 is treated as endpoint error, not auth failure
        const errorData = await response.json().catch(() => ({}));
        const message = errorData.message || `API Error: ${response.status} ${response.statusText}`;
        throw new ApiError(response.status, response.statusText, message, errorData);
    }

    return response.json();
}
