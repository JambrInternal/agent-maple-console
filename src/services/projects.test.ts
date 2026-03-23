import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createProject, getProject, getProjects, updateProjectStatus } from './projects';
import { apiFetch } from '../api/client';

vi.mock('../api/client', () => ({
  API_CONFIG: { baseUrl: '' },
  apiFetch: vi.fn(),
  getErrorStatus: (error: { status?: number } | null) => (error?.status ?? null),
}));

describe('projects service', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetAllMocks();
  });

  it('lists projects for current tenant for non-admin users', async () => {
    vi.mocked(apiFetch).mockResolvedValue({
      data: [
        {
          id: 'proj_1',
          tenant_id: 1,
          name: 'Site A',
          created_at: '2026-02-01T00:00:00Z',
          agent: { status: 'online' },
          thread_count: 2,
          issue_count: 1,
        },
      ],
    });

    const result = await getProjects('tenant_1');

    expect(apiFetch).toHaveBeenCalledWith('/projects/', {
      headers: {
        'x-tenant-id': 'tenant_1',
      },
    });
    expect(result[0].agentStatus).toBe('online');
    expect(result[0].organizationId).toBe('1');
  });

  it('uses tenant-scoped endpoint for admin users', async () => {
    localStorage.setItem('am_admin_mode', 'true');
    vi.mocked(apiFetch).mockResolvedValue({
      data: [
        {
          id: 'proj_admin_1',
          tenant_id: 77,
          name: 'Admin Site',
          created_at: '2026-02-01T00:00:00Z',
          agent: { status: 'online' },
          thread_count: 0,
          issue_count: 0,
        },
      ],
    });

    const result = await getProjects('77');

    expect(apiFetch).toHaveBeenCalledWith('/projects/tenant/77');
    expect(result[0].id).toBe('proj_admin_1');
  });

  it('falls back to current-tenant endpoint when admin endpoint returns forbidden', async () => {
    localStorage.setItem('am_admin_mode', 'true');
    vi.mocked(apiFetch)
      .mockRejectedValueOnce({ status: 403, message: 'Not admin' })
      .mockResolvedValueOnce({
        data: [
          {
            id: 'proj_fallback_1',
            tenant_id: 88,
            name: 'Fallback Site',
            created_at: '2026-02-01T00:00:00Z',
            agent: { status: 'online' },
            thread_count: 0,
            issue_count: 0,
          },
        ],
      });

    const result = await getProjects('88');

    expect(apiFetch).toHaveBeenNthCalledWith(1, '/projects/tenant/88');
    expect(apiFetch).toHaveBeenNthCalledWith(2, '/projects/', {
      headers: {
        'x-tenant-id': '88',
      },
    });
    expect(localStorage.getItem('am_admin_mode')).toBe('false');
    expect(result[0].id).toBe('proj_fallback_1');
  });

  it('gets a single project', async () => {
    vi.mocked(apiFetch).mockResolvedValue({
      data: {
        id: 'proj_2',
        tenant_id: 22,
        name: 'Warehouse',
        created_at: '2026-02-02T00:00:00Z',
        agent: { status: 'offline' },
      },
    });

    const result = await getProject('proj_2');

    expect(apiFetch).toHaveBeenCalledWith('/projects/proj_2');
    expect(result.agentStatus).toBe('offline');
    expect(result.organizationId).toBe('22');
  });

  it('falls back to tenant list when project lookup fails', async () => {
    vi.mocked(apiFetch)
      .mockRejectedValueOnce({ status: 404 })
      .mockResolvedValueOnce({
        data: [
          {
            id: 'proj_2',
            name: 'Warehouse',
            created_at: '2026-02-02T00:00:00Z',
            is_disabled: true,
          },
        ],
      });

    const result = await getProject('proj_2');

    expect(apiFetch).toHaveBeenNthCalledWith(1, '/projects/proj_2');
    expect(apiFetch).toHaveBeenNthCalledWith(2, '/user/tenants');
    expect(result.agentStatus).toBe('offline');
  });

  it('creates a project for an organization', async () => {
    vi.mocked(apiFetch).mockResolvedValue({
      data: {
        id: 'proj_4',
        tenant_id: 44,
        name: 'New Project',
        created_at: '2026-02-04T00:00:00Z',
        agent: { status: 'online' },
      },
    });

    const result = await createProject('tenant_44', 'New Project');

    expect(apiFetch).toHaveBeenCalledWith('/projects/', {
      method: 'POST',
      headers: {
        'x-tenant-id': 'tenant_44',
      },
      body: JSON.stringify({ name: 'New Project' }),
    });
    expect(result.id).toBe('proj_4');
    expect(result.organizationId).toBe('44');
  });

  it('updates project agent status', async () => {
    vi.mocked(apiFetch)
      .mockResolvedValueOnce({
        data: {
          id: 'proj_3',
          tenant_id: 33,
          name: 'Campus',
          created_at: '2026-02-03T00:00:00Z',
          agent: { status: 'offline' },
        },
      })
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({
        data: {
          id: 'proj_3',
          tenant_id: 33,
          name: 'Campus',
          created_at: '2026-02-03T00:00:00Z',
          agent: { status: 'offline' },
        },
      });

    const result = await updateProjectStatus('proj_3', 'offline');

    expect(apiFetch).toHaveBeenNthCalledWith(1, '/projects/proj_3');
    expect(apiFetch).toHaveBeenNthCalledWith(2, '/admin/tenants/33/disable', {
      method: 'POST',
      body: JSON.stringify({ disabled: true }),
    });
    expect(apiFetch).toHaveBeenNthCalledWith(3, '/projects/proj_3');
    expect(result.agentStatus).toBe('offline');
  });
});
