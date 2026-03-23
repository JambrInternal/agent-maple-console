import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import QueryError from './QueryError';

describe('QueryError', () => {
  it('renders Error instance as string', () => {
    render(<QueryError message="Failed" error={new Error('boom')} />);
    expect(screen.getByText(/Failed/)).toBeInTheDocument();
    expect(screen.getByText(/boom/)).toBeInTheDocument();
  });

  it('renders ApiError as string', () => {
    const apiError = { message: 'api fail', status: 404 };
    render(<QueryError message="Failed" error={apiError} />);
    expect(screen.getByText(/Failed/)).toBeInTheDocument();
    expect(screen.getByText(/api fail/)).toBeInTheDocument();
  });

  it('renders unknown error as string', () => {
    render(<QueryError message="Failed" error={{ foo: 'bar' }} />);
    expect(screen.getByText(/Failed/)).toBeInTheDocument();
    expect(screen.getByText(/bar/)).toBeInTheDocument();
  });
});

