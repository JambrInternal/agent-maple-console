// Knowledge Base Service
import { mockFetch } from '../api/client';
import type { KnowledgeSource } from '../api/types';
import { getMockKnowledgeSourcesByProject, getMockKnowledgeSource } from '../mocks/knowledge';

/**
 * Get all knowledge sources for a project
 */
export async function getKnowledgeSources(projectId: string): Promise<KnowledgeSource[]> {
    const sources = getMockKnowledgeSourcesByProject(projectId);
    return mockFetch(sources);
}

/**
 * Get a single knowledge source by ID
 */
export async function getKnowledgeSource(id: string): Promise<KnowledgeSource> {
    const source = getMockKnowledgeSource(id);
    if (!source) {
        throw new Error(`Knowledge source not found: ${id}`);
    }
    return mockFetch(source);
}

/**
 * Simulates uploading a new knowledge source
 */
export async function uploadKnowledgeSource(
    projectId: string,
    fileName: string,
    type: 'pdf' | 'doc'
): Promise<KnowledgeSource> {
    const newSource: KnowledgeSource = {
        id: `ks_${Date.now()}`,
        projectId,
        name: fileName,
        type,
        status: 'pending',
        documentCount: 1,
        lastSyncAt: null,
        createdAt: new Date().toISOString(),
    };

    return mockFetch(newSource);
}

/**
 * Simulates deleting a knowledge source
 */
export async function deleteKnowledgeSource(id: string): Promise<void> {
    // In a real app, this would call the API
    return mockFetch(undefined);
}

/**
 * Simulates re-indexing a knowledge source
 */
export async function reindexKnowledgeSource(id: string): Promise<KnowledgeSource> {
    const source = getMockKnowledgeSource(id);
    if (!source) {
        throw new Error(`Knowledge source not found: ${id}`);
    }

    const updated: KnowledgeSource = {
        ...source,
        status: 'indexing',
    };

    return mockFetch(updated);
}
