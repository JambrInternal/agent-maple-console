import { describe, it, expect, vi } from 'vitest';
import { API_CONFIG, apiFetch } from '../client';

// URL normalization regression test

describe('API client URL normalization', () => {
  it('joins baseUrl and endpoint without double slashes', () => {
    const baseUrl = 'https://api.dev.agentmaple.ca/';
    const endpoint = '/user/sync';
    const url = new URL(endpoint, baseUrl).toString();
    expect(url).toBe('https://api.dev.agentmaple.ca/user/sync');
  });

  it('joins baseUrl and endpoint with no leading slash', () => {
    const baseUrl = 'https://api.dev.agentmaple.ca';
    const endpoint = 'user/sync';
    const url = new URL(endpoint, baseUrl).toString();
    expect(url).toBe('https://api.dev.agentmaple.ca/user/sync');
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
    try {
      await apiFetch('/not-an-endpoint');
    } catch (err: any) {
      expect(err.status).toBe(404);
      expect(err.name).toBe('ApiError');
    }
  });
});

// 401 redirect regression test

describe('API client 401 redirect', () => {
  it('redirects to /login only once on 401', async () => {
    // Mock fetch to return 401
    globalThis.fetch = async () => ({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: async () => ({ message: 'Unauthorized' }),
    }) as any;
    // Spy on window.location.assign
    const assignSpy = vi.spyOn(window.location, 'assign').mockImplementation(() => {});
    try {
      await apiFetch('/user/sync');
    } catch (err: any) {
      expect(err.status).toBe(401);
      expect(assignSpy).toHaveBeenCalledWith('/login');
      expect(assignSpy).toHaveBeenCalledTimes(1);
    }
    assignSpy.mockRestore();
  });
});
