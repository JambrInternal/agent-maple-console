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
    if (!error || typeof error !== 'object') return null;
    if (error instanceof ApiError) {
        const details = error.details as { message?: string; detail?: Array<{ msg?: string }> } | undefined;
        if (details?.message) return details.message;
        if (Array.isArray(details?.detail) && details.detail[0]?.msg) {
            return details.detail[0].msg;
        }
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
