export const API_CONFIG = {
    baseUrl: import.meta.env.VITE_API_URL || 'https://api.stage.certly.jambr.ca',
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

export async function apiFetch<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token = getAuthToken();
    const tenantId = getTenantId();
    const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

    const headers = new Headers(options.headers as HeadersInit);
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }
    if (tenantId) {
        headers.set('x-tenant-id', tenantId);
    }
    if (!isFormData && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(`${API_CONFIG.baseUrl}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message = errorData.message || `API Error: ${response.status} ${response.statusText}`;
        throw new ApiError(response.status, response.statusText, message, errorData);
    }

    return response.json();
}
