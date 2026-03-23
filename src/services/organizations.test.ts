import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createOrganization, getOrganization, getOrganizations } from './organizations';
import { apiFetch } from '../api/client';

vi.mock('../api/client', () => ({
  API_CONFIG: { baseUrl: '' },
  apiFetch: vi.fn(),
  getErrorStatus: (error: { status?: number } | null) => (error?.status ?? null),
}));

describe('organizations service', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetAllMocks();
  });

  it('lists organizations and maps fields (no projectCount by default)', async () => {
    vi.mocked(apiFetch)
      .mockResolvedValueOnce({
        data: [
          {
            id: 'tenant_1',
            name: 'Iron Maple',
            is_disabled: false,
            created_at: '2026-02-01T00:00:00Z',
          },
        ],
      });

    const result = await getOrganizations();

    expect(apiFetch).toHaveBeenCalledOnce();
    expect(apiFetch).toHaveBeenCalledWith('/user/tenants');
    expect(result).toEqual([
      expect.objectContaining({
        id: 'tenant_1',
        name: 'Iron Maple',
        projectCount: undefined,
        createdAt: '2026-02-01T00:00:00.000Z',
      }),
    ]);
  });

  it('lists organizations for admins with projectCount from response', async () => {
    localStorage.setItem('am_admin_mode', 'true');
    vi.mocked(apiFetch)
      .mockResolvedValueOnce({
        data: [
          {
            id: 'tenant_1',
            name: 'Iron Maple',
            is_disabled: false,
            projects_count: 5,
            created_at: '2026-02-01T00:00:00Z',
          },
        ],
      });

    const result = await getOrganizations();

    expect(apiFetch).toHaveBeenCalledWith('/admin/tenants');
    expect(result).toEqual([
      expect.objectContaining({
        id: 'tenant_1',
        name: 'Iron Maple',
        projectCount: 5,
        createdAt: '2026-02-01T00:00:00.000Z',
      }),
    ]);
  });

  it('gets a single organization (no projectCount by default)', async () => {
    vi.mocked(apiFetch)
      .mockResolvedValueOnce({
        data: [
          {
            id: 'tenant_2',
            name: 'Bushy Tailed',
            created_at: '2026-02-02T00:00:00Z',
          },
        ],
      });

    const result = await getOrganization('tenant_2');

    expect(apiFetch).toHaveBeenNthCalledWith(1, '/user/tenants');
    expect(result.id).toBe('tenant_2');
    expect(result.projectCount).toBeUndefined();
  });

  it('gets a single organization for admin (potentially with projects_count)', async () => {
    vi.mocked(apiFetch)
      .mockResolvedValueOnce({
        data: {
          id: 'tenant_2',
          name: 'Bushy Tailed',
          projects_count: 3,
          created_at: '2026-02-02T00:00:00Z',
        },
      });

    localStorage.setItem('am_admin_mode', 'true');
    const result = await getOrganization('tenant_2');

    expect(apiFetch).toHaveBeenCalledWith('/admin/tenants/tenant_2');
    expect(result.id).toBe('tenant_2');
    expect(result.projectCount).toBe(3);
  });

  it('creates an organization', async () => {
    vi.mocked(apiFetch).mockResolvedValue({
      data: {
        id: 'tenant_3',
        name: 'New Org',
        created_at: '2026-02-03T00:00:00Z',
      },
    });

    const result = await createOrganization('New Org');

    expect(apiFetch).toHaveBeenCalledWith('/user/tenants', {
      method: 'POST',
      body: JSON.stringify({ name: 'New Org' }),
    });
    expect(result.name).toBe('New Org');
  });

  it('creates an organization with full payload', async () => {
    vi.mocked(apiFetch).mockResolvedValue({
      data: {
        id: 'tenant_full',
        name: 'Full Org',
        description: 'A description',
        twilio_number: '+1234',
        created_at: '2026-02-03T00:00:00Z',
      },
    });

    const result = await createOrganization({
      name: 'Full Org',
      description: 'A description',
      twilioNumber: '+1234',
      obtainTwilioPhoneNumber: true
    });

    expect(apiFetch).toHaveBeenCalledWith('/user/tenants', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Full Org',
        description: 'A description',
        twilio_number: '+1234',
        obtain_twilio_phone_number: true
      }),
    });
    expect(result.id).toBe('tenant_full');
  });

  it('lists all organizations for admins', async () => {
    localStorage.setItem('am_admin_mode', 'true');
    vi.mocked(apiFetch)
      .mockResolvedValueOnce({
        data: [
          {
            id: 'tenant_admin',
            name: 'Admin Org',
            projects_count: 1,
            created_at: '2026-02-01T00:00:00Z',
          },
        ],
      });

    const result = await getOrganizations();

    expect(apiFetch).toHaveBeenCalledWith('/admin/tenants');
    expect(result[0].id).toBe('tenant_admin');
    expect(result[0].projectCount).toBe(1);
    expect(localStorage.getItem('am_admin_mode')).toBe('true');
  });

  it('creates an organization via admin endpoint when admin mode is set', async () => {
    localStorage.setItem('am_admin_mode', 'true');
    vi.mocked(apiFetch).mockResolvedValue({
      data: {
        id: 'tenant_4',
        name: 'Admin Created Org',
        created_at: '2026-02-04T00:00:00Z',
      },
    });

    const result = await createOrganization('Admin Created Org');

    expect(apiFetch).toHaveBeenCalledWith('/admin/tenants', {
      method: 'POST',
      body: JSON.stringify({ name: 'Admin Created Org' }),
    });
    expect(result.id).toBe('tenant_4');
  });
});
