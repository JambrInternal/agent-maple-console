import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createOrganization, getOrganization, getOrganizations } from '../organizations';
import { apiFetch } from '../../api/client';

vi.mock('../../api/client', () => ({
    API_CONFIG: { baseUrl: '' },
    apiFetch: vi.fn(),
}));

describe('organizations service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('lists organizations and maps fields', async () => {
        vi.mocked(apiFetch).mockResolvedValue({
            data: [
                {
                    id: 101,
                    name: 'Iron Maple',
                    project_count: 3,
                    member_count: 8,
                    created_at: '2026-02-01T00:00:00Z',
                },
            ],
        });

        const result = await getOrganizations();

        expect(apiFetch).toHaveBeenCalledWith('/organizations');
        expect(result).toEqual([
            {
                id: '101',
                name: 'Iron Maple',
                projectCount: 3,
                memberCount: 8,
                createdAt: '2026-02-01T00:00:00.000Z',
            },
        ]);
    });

    it('gets a single organization', async () => {
        vi.mocked(apiFetch).mockResolvedValue({
            data: {
                id: 'org_1',
                name: 'Bushy Tailed',
                project_count: 1,
                created_at: '2026-02-02T00:00:00Z',
            },
        });

        const result = await getOrganization('org_1');

        expect(apiFetch).toHaveBeenCalledWith('/organizations/org_1');
        expect(result.id).toBe('org_1');
        expect(result.projectCount).toBe(1);
    });

    it('creates an organization', async () => {
        vi.mocked(apiFetch).mockResolvedValue({
            data: {
                id: 'org_2',
                name: 'New Org',
                project_count: 0,
                created_at: '2026-02-03T00:00:00Z',
            },
        });

        const result = await createOrganization('New Org');

        expect(apiFetch).toHaveBeenCalledWith('/organizations', {
            method: 'POST',
            body: JSON.stringify({ name: 'New Org' }),
        });
        expect(result.name).toBe('New Org');
    });
});
