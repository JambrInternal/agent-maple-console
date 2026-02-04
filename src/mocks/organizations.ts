// Mock Organizations Data
import type { Organization } from '../api/types';

export const mockOrganizations: Organization[] = [
    {
        id: 'org_1',
        name: 'Iron Maple Construction',
        projectCount: 3,
        memberCount: 12,
        plan: 'professional',
        createdAt: '2024-06-15T10:00:00Z',
    },
    {
        id: 'org_2',
        name: 'Bushy Tailed Contracting',
        projectCount: 2,
        memberCount: 6,
        plan: 'starter',
        createdAt: '2024-09-22T14:30:00Z',
    },
];

export function getMockOrganization(id: string): Organization | undefined {
    return mockOrganizations.find((org) => org.id === id);
}
