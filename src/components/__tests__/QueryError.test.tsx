import { render, screen } from '@testing-library/react';
import QueryError from '../components/QueryError';

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

// Smoke test for a page
import Projects from '../pages/Projects.jsx';

describe('Projects page error', () => {
  it('shows error message, not crash', () => {
    // Mock useApiQuery to return error
    jest.mock('../hooks/useApiQuery', () => ({
      useApiQuery: () => ({ loading: false, error: new Error('boom'), data: null, refetch: jest.fn() })
    }));
    render(<Projects />);
    expect(screen.getByText(/Failed to load projects/)).toBeInTheDocument();
    expect(screen.getByText(/boom/)).toBeInTheDocument();
  });
});
