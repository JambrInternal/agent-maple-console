import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock token service to avoid Amplify side effects
vi.mock('../../services/token', () => ({
  getFreshToken: vi.fn(() => Promise.resolve(null)),
  clearToken: vi.fn(),
}));

import * as client from '../client';
import { getFreshToken } from '../../services/token';

// URL normalization regression test

describe('API client URL normalization', () => {
  it('joins baseUrl and endpoint without double slashes', () => {
    const baseUrl = 'https://api.dev.agentmaple.ca/';
    const endpoint = '/user/tenants';
    const url = new URL(endpoint, baseUrl).toString();
    expect(url).toBe('https://api.dev.agentmaple.ca/user/tenants');
  });

  it('joins baseUrl and endpoint with no leading slash', () => {
    const baseUrl = 'https://api.dev.agentmaple.ca';
    const endpoint = 'user/tenants';
    const url = new URL(endpoint, baseUrl).toString();
    expect(url).toBe('https://api.dev.agentmaple.ca/user/tenants');
  });
});

// Endpoint error handling regression test

describe('API client endpoint error handling', () => {
  it('does not treat 404 as auth failure', async () => {
    // Mock fetch to return 404
    globalThis.fetch = async () => ({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: async () => ({ message: 'Not Found' }),
    }) as any;
    await expect(client.apiFetch('/not-an-endpoint')).rejects.toMatchObject({
      name: 'ApiError',
      status: 404,
    });
  });
});

describe('API client tenant header behavior', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('does not attach x-tenant-id to tenant-agnostic /user endpoints', async () => {
    localStorage.setItem('am_tenant_id', '26');
    const fetchMock = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    })) as any;
    globalThis.fetch = fetchMock;

    await client.apiFetch('/user/accept-invitation', {
      method: 'POST',
      body: JSON.stringify({ token: 'tok_123' }),
    });

    const requestOptions = fetchMock.mock.calls[0][1] as RequestInit;
    const headers = new Headers(requestOptions.headers as HeadersInit);
    expect(headers.has('x-tenant-id')).toBe(false);
  });

  it('attaches x-tenant-id to tenant-scoped endpoints', async () => {
    localStorage.setItem('am_tenant_id', '26');
    const fetchMock = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    })) as any;
    globalThis.fetch = fetchMock;

    await client.apiFetch('/tenants/send-invitation', {
      method: 'POST',
      body: JSON.stringify({ email: 'x@example.com' }),
    });

    const requestOptions = fetchMock.mock.calls[0][1] as RequestInit;
    const headers = new Headers(requestOptions.headers as HeadersInit);
    expect(headers.get('x-tenant-id')).toBe('26');
  });

  it('falls back to stored token when token refresh returns null', async () => {
    localStorage.setItem('am_auth_token', 'stored-token');
    vi.mocked(getFreshToken).mockResolvedValueOnce(null);

    const fetchMock = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    })) as any;
    globalThis.fetch = fetchMock;

    await client.apiFetch('/user/tenants');

    const requestOptions = fetchMock.mock.calls[0][1] as RequestInit;
    const headers = new Headers(requestOptions.headers as HeadersInit);
    expect(headers.get('Authorization')).toBe('Bearer stored-token');
  });
});

// 401 redirect regression test

describe('API client 401 redirect', () => {
  it('redirects to /login only once on 401', async () => {
    vi.spyOn(client.navigation, 'toLogin').mockImplementation(() => {});
    globalThis.fetch = vi.fn(async () => ({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: async () => ({ message: 'Unauthorized' }),
    })) as any;
    await expect(client.apiFetch('/user/tenants')).rejects.toMatchObject({ status: 401 });
    expect(client.navigation.toLogin).toHaveBeenCalledTimes(1);
  });
});
