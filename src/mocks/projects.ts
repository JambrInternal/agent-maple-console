// Mock Projects Data
import type { Project } from '../api/types';

export const mockProjects: Project[] = [
    // Iron Maple Construction projects
    {
        id: 'proj_1',
        organizationId: 'org_1',
        name: 'Site-A Plaza',
        agentStatus: 'online',
        threadCount: 12,
        issueCount: 3,
        lastActivityAt: '2026-02-04T08:45:00Z',
        createdAt: '2024-07-01T09:00:00Z',
    },
    {
        id: 'proj_2',
        organizationId: 'org_1',
        name: 'Site-B Warehouse',
        agentStatus: 'warning',
        threadCount: 8,
        issueCount: 2,
        lastActivityAt: '2026-02-04T07:30:00Z',
        createdAt: '2024-08-15T11:00:00Z',
    },
    {
        id: 'proj_3',
        organizationId: 'org_1',
        name: 'Downtown Tower',
        agentStatus: 'problems',
        threadCount: 0,
        issueCount: 0,
        lastActivityAt: '2026-01-15T16:00:00Z',
        createdAt: '2024-10-01T08:00:00Z',
    },
    // Bushy Tailed Contracting projects
    {
        id: 'proj_4',
        organizationId: 'org_2',
        name: 'North Campus',
        agentStatus: 'online',
        threadCount: 15,
        issueCount: 4,
        lastActivityAt: '2026-02-04T09:15:00Z',
        createdAt: '2024-11-01T10:00:00Z',
    },
    {
        id: 'proj_5',
        organizationId: 'org_2',
        name: 'Retail Complex',
        agentStatus: 'offline',
        threadCount: 5,
        issueCount: 1,
        lastActivityAt: '2026-02-01T14:00:00Z',
        createdAt: '2024-12-01T09:00:00Z',
    },
];

export function getMockProject(id: string): Project | undefined {
    return mockProjects.find((proj) => proj.id === id);
}

export function getMockProjectsByOrg(orgId: string): Project[] {
    return mockProjects.filter((proj) => proj.organizationId === orgId);
}
