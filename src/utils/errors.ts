import { ApiError, getErrorStatus } from '../api/client';

type ErrorLike = {
    message?: unknown;
};

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

  // ApiError details (backend message body)
  if (error instanceof ApiError) {
    const details = error.details as {
            message?: string;
            detail?: string | Array<{ msg?: string } | string>;
        } | undefined;

    if (typeof details?.message === 'string' && details.message.trim()) {
      return details.message;
    }

    if (typeof details?.detail === 'string' && details.detail.trim()) {
      return details.detail;
    }

    if (Array.isArray(details?.detail)) {
      const firstDetail = details.detail[0];
      if (typeof firstDetail === 'string' && firstDetail.trim()) {
        return firstDetail;
      }
      if (
        firstDetail &&
                typeof firstDetail === 'object' &&
                'msg' in firstDetail &&
                typeof firstDetail.msg === 'string' &&
                firstDetail.msg.trim()
      ) {
        return firstDetail.msg;
      }
    }
  }

  // Standard JS Error
  if (error instanceof Error && error.message) return error.message;

  if (typeof error !== 'object' || error === null) return null;

  if ('message' in error) {
    const message = (error as ErrorLike).message;
    if (typeof message === 'string' && message.trim()) {
      return message;
    }
  }

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
