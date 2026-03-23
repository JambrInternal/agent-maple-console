import React from 'react';
import { withStatus } from '../utils/errors';
import { Button } from './ui';

export default function QueryError({
  message,
  error,
  onRetry,
}: {
  message: string;
  error: unknown;
  onRetry?: () => void;
}) {
  return (
    <div className="am-text-2" style={{ padding: '2rem 0', color: '#ef4444' }}>
      <div>{withStatus(message, error)}</div>

      {onRetry && (
        <Button
          type="button"
          variant="secondary"
          onClick={onRetry}
          style={{ marginTop: '0.75rem' }}
        >
          Retry
        </Button>
      )}
    </div>
  );
}
