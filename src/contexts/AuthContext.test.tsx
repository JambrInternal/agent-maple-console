import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';
import type { User } from '../api/types';

vi.mock('../services/auth', () => ({
  getCurrentUser: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
  confirmRegistration: vi.fn(),
  forgotPassword: vi.fn(),
  confirmForgotPassword: vi.fn(),
  resendConfirmationCode: vi.fn(),
}));

vi.mock('../services/authEvents', () => ({}));

import * as authService from '../services/auth';

const createUser = (id: string): User => ({
  id,
  email: `${id}@example.com`,
  name: `User ${id}`,
  role: 'admin',
  organizationId: null,
  tenantId: null,
  mfaEnabled: false,
  createdAt: '2026-03-20T00:00:00Z',
});

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('hydrates the current user through React Query', async () => {
    const user = createUser('u1');
    vi.mocked(authService.getCurrentUser).mockResolvedValue(user);

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toEqual(user);
    expect(authService.getCurrentUser).toHaveBeenCalledTimes(1);
  });

  it('updates cached user after login', async () => {
    vi.mocked(authService.getCurrentUser).mockResolvedValue(null);
    const user = createUser('u2');
    vi.mocked(authService.login).mockResolvedValue(user);

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.login('u2@example.com', 'Password123!');
    });

    await waitFor(() => {
      expect(result.current.user).toEqual(user);
    });

    expect(authService.login).toHaveBeenCalledWith('u2@example.com', 'Password123!');
  });

  it('clears cached user after logout', async () => {
    const user = createUser('u3');
    vi.mocked(authService.getCurrentUser).mockResolvedValue(user);
    vi.mocked(authService.logout).mockResolvedValue();

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.user).toEqual(user);
    });

    await act(async () => {
      await result.current.logout();
    });

    await waitFor(() => {
      expect(result.current.user).toBeNull();
    });

    expect(authService.logout).toHaveBeenCalledTimes(1);
  });

  it('refetches the current user when syncCurrentUser is called', async () => {
    vi.mocked(authService.getCurrentUser)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(createUser('u4'));

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.syncCurrentUser();
    });

    await waitFor(() => {
      expect(result.current.user).toEqual(createUser('u4'));
    });

    expect(authService.getCurrentUser).toHaveBeenCalledTimes(2);
  });
});
