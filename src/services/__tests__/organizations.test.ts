import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createOrganization, getOrganization, getOrganizations } from '../organizations';
import { apiFetch } from '../../api/client';

vi.mock('../../api/client', () => ({
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
            .mockRejectedValueOnce({ status: 403 })
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

        expect(apiFetch).toHaveBeenNthCalledWith(1, '/admin/tenants');
        expect(apiFetch).toHaveBeenNthCalledWith(2, '/user/tenants');
        expect(result).toEqual([
            {
                id: 'tenant_1',
                name: 'Iron Maple',
                memberCount: undefined,
                createdAt: '2026-02-01T00:00:00.000Z',
            },
        ]);
    });

    it('lists organizations with projectCount when requested', async () => {
        vi.mocked(apiFetch)
            .mockRejectedValueOnce({ status: 403 })
            .mockResolvedValueOnce({
                data: [
                    {
                        id: 'tenant_1',
                        name: 'Iron Maple',
                        is_disabled: false,
                        created_at: '2026-02-01T00:00:00Z',
                    },
                ],
            })
            .mockResolvedValueOnce({
                data: [
                    {
                        id: 'proj_1',
                        tenant_id: 1,
                        name: 'Site A',
                        thread_count: 0,
                        issue_count: 0,
                        created_at: '2026-02-01T00:00:00Z',
                    },
                    {
                        id: 'proj_2',
                        tenant_id: 1,
                        name: 'Site B',
                        thread_count: 0,
                        issue_count: 0,
                        created_at: '2026-02-01T00:00:00Z',
                    },
                ],
            });

        const result = await getOrganizations({ includeProjectCounts: true });

        expect(apiFetch).toHaveBeenNthCalledWith(1, '/admin/tenants');
        expect(apiFetch).toHaveBeenNthCalledWith(2, '/user/tenants');
        expect(apiFetch).toHaveBeenNthCalledWith(3, '/projects/tenant/tenant_1');
        expect(result).toEqual([
            {
                id: 'tenant_1',
                name: 'Iron Maple',
                projectCount: 2,
                memberCount: undefined,
                createdAt: '2026-02-01T00:00:00.000Z',
            },
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

    it('gets a single organization with projectCount when requested', async () => {
        vi.mocked(apiFetch)
            .mockResolvedValueOnce({
                data: [
                    {
                        id: 'tenant_2',
                        name: 'Bushy Tailed',
                        created_at: '2026-02-02T00:00:00Z',
                    },
                ],
            })
            .mockResolvedValueOnce({
                data: [
                    {
                        id: 'proj_3',
                        tenant_id: 2,
                        name: 'Main Site',
                        created_at: '2026-02-02T00:00:00Z',
                        thread_count: 0,
                        issue_count: 0,
                    },
                ],
            });

        const result = await getOrganization('tenant_2', { includeProjectCounts: true });

        expect(apiFetch).toHaveBeenNthCalledWith(1, '/user/tenants');
        expect(apiFetch).toHaveBeenNthCalledWith(2, '/projects/tenant/tenant_2');
        expect(result.id).toBe('tenant_2');
        expect(result.projectCount).toBe(1);
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

    it('lists all organizations for admins', async () => {
        vi.mocked(apiFetch)
            .mockResolvedValueOnce({
                data: [
                    {
                        id: 'tenant_admin',
                        name: 'Admin Org',
                        created_at: '2026-02-01T00:00:00Z',
                    },
                ],
            })
            .mockResolvedValueOnce({
                data: [],
            });

        const result = await getOrganizations();

        expect(apiFetch).toHaveBeenNthCalledWith(1, '/admin/tenants');
        expect(apiFetch).toHaveBeenNthCalledWith(2, '/projects/tenant/tenant_admin');
        expect(result[0].id).toBe('tenant_admin');
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
