import { ApiError, getErrorStatus } from '../api/client';

const STATUS_HINTS: Record<number, string> = {
    400: 'Check required fields.',
    401: 'Please sign in again.',
    403: 'Access denied.',
    404: 'Not found.',
    409: 'Already exists or conflicts.',
    422: 'Check the input values.',
    429: 'Too many requests. Try again shortly.',
    500: 'Server error. Try again later.',
    503: 'Service unavailable. Try again shortly.',
};

const getErrorDetail = (error: unknown): string | null => {
    if (!error) return null;

    // Standard JS Error
    if (error instanceof Error && error.message) return error.message;

    if (typeof error !== 'object') return null;

    // ApiError details (backend message body)
    if (error instanceof ApiError) {
        const details = error.details as { message?: string; detail?: Array<{ msg?: string }> } | undefined;
        if (details?.message) return details.message;
        if (Array.isArray(details?.detail) && details.detail[0]?.msg) return details.detail[0].msg;
    }

    // Generic object with message
    const msg = (error as any).message;
    if (typeof msg === 'string' && msg.trim()) return msg;

    // Last resort: stringify unknown objects (bounded so UI doesn't explode)
    try {
        const s = JSON.stringify(error);
        if (s && s !== '{}' && s !== '[]') return s.slice(0, 200);
    } catch {
        // ignore
    }

    return null;
};

export const withStatus = (message: string, error: unknown): string => {
    const status = getErrorStatus(error);
    const detail = getErrorDetail(error);
    const hint = status ? STATUS_HINTS[status] : null;
    const context = detail || hint;

    if (status && context) {
        return `${message} (Status ${status}: ${context})`;
    }
    if (status) {
        return `${message} (Status ${status})`;
    }
    if (context) {
        return `${message} (${context})`;
    }
    return message;
};
