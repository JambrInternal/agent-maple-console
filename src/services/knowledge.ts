// Knowledge Base Service
import { apiFetch } from '../api/client';
import type { KnowledgeSource } from '../api/types';
import { mapDatasourceResponse, unwrapData, type ApiDatasource, type ApiResponse } from '../api/mappers';

/**
 * Get all knowledge sources for a project
 */
export async function getKnowledgeSources(projectId: string): Promise<KnowledgeSource[]> {
    const response = await apiFetch<ApiResponse<ApiDatasource[]>>('/datasources', {
        headers: {
            'x-tenant-id': projectId,
        },
    });
    const data = unwrapData(response, []);
    return data.map(mapDatasourceResponse);
}

/**
 * Get a single knowledge source by ID
 */
export async function getKnowledgeSource(id: string): Promise<KnowledgeSource> {
    const response = await apiFetch<ApiResponse<ApiDatasource>>(`/datasources/${id}`);
    const data = unwrapData(response);
    return mapDatasourceResponse(data);
}

/**
 * Simulates uploading a new knowledge source
 */
export async function uploadKnowledgeSource(
    projectId: string,
    file: File,
    metadata?: Record<string, any>
): Promise<KnowledgeSource> {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata) {
        formData.append('metadata', JSON.stringify(metadata));
    }

    const response = await apiFetch<ApiResponse<ApiDatasource>>('/datasources/upload', {
        method: 'POST',
        headers: {
            'x-tenant-id': projectId,
        },
        body: formData,
    });
    const data = unwrapData(response);
    return mapDatasourceResponse(data);
}

/**
 * Simulates deleting a knowledge source
 */
export async function deleteKnowledgeSource(id: string): Promise<void> {
    await apiFetch(`/datasources/${id}`, { method: 'DELETE' });
}

/**
 * Simulates re-indexing a knowledge source
 */
export async function reindexKnowledgeSource(id: string): Promise<KnowledgeSource> {
    await apiFetch(`/datasources/${id}/reprocess`, { method: 'POST' });
    return getKnowledgeSource(id);
}
