import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getProject, getProjects, updateProjectStatus } from '../projects';
import { apiFetch } from '../../api/client';

vi.mock('../../api/client', () => ({
    API_CONFIG: { baseUrl: '' },
    apiFetch: vi.fn(),
}));

describe('projects service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('lists projects for an organization', async () => {
        vi.mocked(apiFetch).mockResolvedValue({
            data: [
                {
                    id: 'proj_1',
                    organization_id: 'org_1',
                    name: 'Site A',
                    thread_count: 2,
                    issue_count: 1,
                    created_at: '2026-02-01T00:00:00Z',
                    agent: { status: 'online' },
                },
            ],
        });

        const result = await getProjects('org_1');

        expect(apiFetch).toHaveBeenCalledWith('/organizations/org_1/projects');
        expect(result[0].agentStatus).toBe('online');
        expect(result[0].organizationId).toBe('org_1');
    });

    it('gets a single project', async () => {
        vi.mocked(apiFetch).mockResolvedValue({
            data: {
                id: 'proj_2',
                organization_id: 'org_2',
                name: 'Warehouse',
                created_at: '2026-02-02T00:00:00Z',
                agent: { status: 'offline' },
            },
        });

        const result = await getProject('proj_2');

        expect(apiFetch).toHaveBeenCalledWith('/projects/proj_2');
        expect(result.agentStatus).toBe('offline');
    });

    it('updates project agent status', async () => {
        vi.mocked(apiFetch)
            .mockResolvedValueOnce({})
            .mockResolvedValueOnce({
                data: {
                    id: 'proj_3',
                    organization_id: 'org_3',
                    name: 'Campus',
                    created_at: '2026-02-03T00:00:00Z',
                    agent: { status: 'offline' },
                },
            });

        const result = await updateProjectStatus('proj_3', 'offline');

        expect(apiFetch).toHaveBeenNthCalledWith(1, '/admin/tenants/proj_3/disable', {
            method: 'POST',
            body: JSON.stringify({ disabled: true }),
        });
        expect(apiFetch).toHaveBeenNthCalledWith(2, '/projects/proj_3');
        expect(result.agentStatus).toBe('offline');
    });
});
