// Knowledge Base Service
import { apiFetch } from '../api/client';
import type { KnowledgeSource } from '../api/types';
import { mapDatasourceResponse, unwrapData, type ApiDatasource, type ApiResponse } from '../api/mappers';
import { resolveTenantIdOrThrow, type ProjectFacadeScope } from './projectFacade';

type ProjectScopedInput = string | ProjectFacadeScope

const resolveTenantId = (input: ProjectScopedInput, context: string): string => {
    if (typeof input === 'string') {
        const tenantId = input.trim()
        if (!tenantId) {
            throw new Error(`Organization ID is required for ${context}.`)
        }
        return tenantId
    }

    return resolveTenantIdOrThrow(input, context)
}

/**
 * Get all knowledge sources for a project facade scope.
 * Tenant-scoped backend resources are resolved via project facade mapping.
 */
export async function getKnowledgeSources(scope: ProjectScopedInput): Promise<KnowledgeSource[]> {
    const tenantId = resolveTenantId(scope, 'knowledge source list')
    const response = await apiFetch<ApiResponse<ApiDatasource[]>>('/datasources', {
        headers: {
            'x-tenant-id': tenantId,
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
    scope: ProjectScopedInput,
    file: File,
    metadata?: Record<string, unknown>
): Promise<KnowledgeSource> {
    const tenantId = resolveTenantId(scope, 'knowledge source upload')
    const formData = new FormData();
    formData.append('file', file);
    if (metadata) {
        formData.append('metadata', JSON.stringify(metadata));
    }

    const response = await apiFetch<ApiResponse<ApiDatasource>>('/datasources/upload', {
        method: 'POST',
        headers: {
            'x-tenant-id': tenantId,
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
