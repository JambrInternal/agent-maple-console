// Mock Knowledge Sources Data
import type { KnowledgeSource } from '../api/types';

export const mockKnowledgeSources: KnowledgeSource[] = [
    // Site-A Plaza knowledge
    {
        id: 'ks_1',
        projectId: 'proj_1',
        name: 'Site-A Construction Manual.pdf',
        type: 'pdf',
        status: 'ready',
        documentCount: 1,
        lastSyncAt: '2026-01-10T10:00:00Z',
        createdAt: '2024-07-05T09:00:00Z',
    },
    {
        id: 'ks_2',
        projectId: 'proj_1',
        name: 'Safety Procedures 2026.pdf',
        type: 'pdf',
        status: 'ready',
        documentCount: 1,
        lastSyncAt: '2026-01-15T14:00:00Z',
        createdAt: '2024-07-10T11:00:00Z',
    },
    {
        id: 'ks_3',
        projectId: 'proj_1',
        name: 'Google Drive - Engineering Specs',
        type: 'google_drive',
        status: 'indexing',
        documentCount: 24,
        lastSyncAt: '2026-02-04T06:00:00Z',
        createdAt: '2024-08-01T09:00:00Z',
    },
    {
        id: 'ks_4',
        projectId: 'proj_1',
        name: 'Vendor Contact List.doc',
        type: 'doc',
        status: 'ready',
        documentCount: 1,
        lastSyncAt: '2026-01-20T08:00:00Z',
        createdAt: '2024-07-20T10:00:00Z',
    },
    // Site-B Warehouse knowledge
    {
        id: 'ks_5',
        projectId: 'proj_2',
        name: 'Warehouse Layout Plans.pdf',
        type: 'pdf',
        status: 'ready',
        documentCount: 1,
        lastSyncAt: '2026-01-08T09:00:00Z',
        createdAt: '2024-08-20T10:00:00Z',
    },
    {
        id: 'ks_6',
        projectId: 'proj_2',
        name: 'HVAC Installation Guide.pdf',
        type: 'pdf',
        status: 'ready',
        documentCount: 1,
        lastSyncAt: '2026-01-12T11:00:00Z',
        createdAt: '2024-09-01T14:00:00Z',
    },
    // North Campus knowledge
    {
        id: 'ks_7',
        projectId: 'proj_4',
        name: 'Structural Engineering Specs',
        type: 'google_drive',
        status: 'ready',
        documentCount: 18,
        lastSyncAt: '2026-02-03T07:00:00Z',
        createdAt: '2024-11-15T10:00:00Z',
    },
    {
        id: 'ks_8',
        projectId: 'proj_4',
        name: 'Fire Safety Compliance.pdf',
        type: 'pdf',
        status: 'pending',
        documentCount: 1,
        lastSyncAt: null,
        createdAt: '2026-02-02T15:00:00Z',
    },
];

export function getMockKnowledgeSource(id: string): KnowledgeSource | undefined {
    return mockKnowledgeSources.find((ks) => ks.id === id);
}

export function getMockKnowledgeSourcesByProject(projectId: string): KnowledgeSource[] {
    return mockKnowledgeSources.filter((ks) => ks.projectId === projectId);
}
