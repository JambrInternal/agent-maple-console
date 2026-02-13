// Knowledge Base Service
import { apiFetch } from '../api/client';
import type { KnowledgeSource } from '../api/types';
import { mapDatasourceResponse, unwrapData, type ApiDatasource, type ApiResponse } from '../api/mappers';
import { resolveTenantIdFromScopedInput, type ProjectScopedInput } from './projectFacade';

type KnowledgeCloudTokenApiResponse = {
    provider?: string | null;
    access_token?: string | null;
    expires_at?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
};

type KnowledgeCloudAuthorizeApiResponse = {
    authorization_url?: string | null;
    state?: string | null;
};

type KnowledgeCloudCallbackApiResponse = {
    access_token?: string | null;
    refresh_token?: string | null;
    expires_in?: number | null;
    token_type?: string | null;
};

type KnowledgeCloudSyncApiResponse = {
    watches_created?: number | null;
    sync_status?: string | null;
    message?: string | null;
};

export type KnowledgeCloudProvider = 'google_drive' | 'sharepoint';

export interface KnowledgeCloudToken {
    provider: string;
    accessToken: string | null;
    expiresAt: string | null;
    createdAt: string | null;
    updatedAt: string | null;
}

export interface KnowledgeCloudAuthorizeResult {
    authorizationUrl: string;
    state: string;
}

export interface KnowledgeCloudCallbackResult {
    accessToken: string | null;
    refreshToken: string | null;
    expiresIn: number | null;
    tokenType: string | null;
}

export interface KnowledgeCloudSyncOptions {
    recursive?: boolean;
}

export interface KnowledgeCloudSyncResult {
    watchesCreated: number;
    syncStatus: string;
    message: string;
}

const toCloudToken = (token: KnowledgeCloudTokenApiResponse): KnowledgeCloudToken => ({
    provider: (token.provider || '').trim(),
    accessToken: token.access_token || null,
    expiresAt: token.expires_at || null,
    createdAt: token.created_at || null,
    updatedAt: token.updated_at || null,
});

const toCloudSyncResult = (response: KnowledgeCloudSyncApiResponse): KnowledgeCloudSyncResult => ({
    watchesCreated: typeof response.watches_created === 'number' ? response.watches_created : 0,
    syncStatus: response.sync_status || '',
    message: response.message || '',
});

/**
 * Get all knowledge sources for a given project context.
 *
 * Accepts either:
 * - a project facade scope object (`{ organizationId, projectId }`), or
 * - a tenant/organization ID string.
 *
 * Tenant-scoped backend resources are resolved via project facade mapping.
 */
export async function getKnowledgeSources(scope: ProjectScopedInput): Promise<KnowledgeSource[]> {
    const tenantId = resolveTenantIdFromScopedInput(scope, 'knowledge source list')
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
 * Upload a new knowledge source.
 */
export async function uploadKnowledgeSource(
    scope: ProjectScopedInput,
    file: File,
    metadata?: Record<string, unknown>
): Promise<KnowledgeSource> {
    const tenantId = resolveTenantIdFromScopedInput(scope, 'knowledge source upload')
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
 * Delete a knowledge source.
 */
export async function deleteKnowledgeSource(id: string): Promise<void> {
    await apiFetch(`/datasources/${id}`, { method: 'DELETE' });
}

/**
 * Re-index a knowledge source.
 */
export async function reindexKnowledgeSource(id: string): Promise<KnowledgeSource> {
    await apiFetch(`/datasources/${id}/reprocess`, { method: 'POST' });
    return getKnowledgeSource(id);
}

/**
 * List OAuth cloud tokens available for the current tenant scope.
 */
export async function listKnowledgeCloudTokens(scope: ProjectScopedInput): Promise<KnowledgeCloudToken[]> {
    const tenantId = resolveTenantIdFromScopedInput(scope, 'knowledge cloud token list');
    const response = await apiFetch<ApiResponse<KnowledgeCloudTokenApiResponse[]>>('/oauth2/tokens', {
        headers: {
            'x-tenant-id': tenantId,
        },
    });
    const tokens = unwrapData(response, []);
    return tokens.map(toCloudToken);
}

/**
 * Request an OAuth provider authorization URL for knowledge cloud sync.
 */
export async function getKnowledgeCloudAuthorizeUrl(
    scope: ProjectScopedInput,
    provider: KnowledgeCloudProvider,
    redirectUri: string
): Promise<KnowledgeCloudAuthorizeResult> {
    const tenantId = resolveTenantIdFromScopedInput(scope, 'knowledge cloud authorize');
    const response = await apiFetch<ApiResponse<KnowledgeCloudAuthorizeApiResponse>>('/oauth2/authorize', {
        method: 'POST',
        headers: {
            'x-tenant-id': tenantId,
        },
        body: JSON.stringify({
            provider,
            redirect_uri: redirectUri,
        }),
    });
    const data = unwrapData(response);

    return {
        authorizationUrl: data.authorization_url || '',
        state: data.state || '',
    };
}

/**
 * Complete OAuth callback and persist provider tokens for the current tenant scope.
 */
export async function completeKnowledgeCloudCallback(
    scope: ProjectScopedInput,
    provider: KnowledgeCloudProvider,
    code: string,
    redirectUri: string
): Promise<KnowledgeCloudCallbackResult> {
    const tenantId = resolveTenantIdFromScopedInput(scope, 'knowledge cloud callback');
    const response = await apiFetch<ApiResponse<KnowledgeCloudCallbackApiResponse>>('/oauth2/callback', {
        method: 'POST',
        headers: {
            'x-tenant-id': tenantId,
        },
        body: JSON.stringify({
            provider,
            code,
            redirect_uri: redirectUri,
        }),
    });
    const data = unwrapData(response);

    return {
        accessToken: data.access_token || null,
        refreshToken: data.refresh_token || null,
        expiresIn: typeof data.expires_in === 'number' ? data.expires_in : null,
        tokenType: data.token_type || null,
    };
}

/**
 * Trigger Google Drive sync (root/default scope when folder_ids omitted).
 */
export async function syncKnowledgeGoogleDrive(
    scope: ProjectScopedInput,
    options?: KnowledgeCloudSyncOptions
): Promise<KnowledgeCloudSyncResult> {
    const tenantId = resolveTenantIdFromScopedInput(scope, 'knowledge google drive sync');
    const response = await apiFetch<ApiResponse<KnowledgeCloudSyncApiResponse>>('/datasources/sync-google-drive', {
        method: 'POST',
        headers: {
            'x-tenant-id': tenantId,
        },
        body: JSON.stringify({
            recursive: options?.recursive ?? false,
        }),
    });
    const data = unwrapData(response);
    return toCloudSyncResult(data);
}

/**
 * Trigger SharePoint sync (root/default scope when folder_ids omitted).
 */
export async function syncKnowledgeSharePoint(
    scope: ProjectScopedInput,
    options?: KnowledgeCloudSyncOptions
): Promise<KnowledgeCloudSyncResult> {
    const tenantId = resolveTenantIdFromScopedInput(scope, 'knowledge sharepoint sync');
    const response = await apiFetch<ApiResponse<KnowledgeCloudSyncApiResponse>>('/datasources/sync-sharepoint', {
        method: 'POST',
        headers: {
            'x-tenant-id': tenantId,
        },
        body: JSON.stringify({
            recursive: options?.recursive ?? false,
        }),
    });
    const data = unwrapData(response);
    return toCloudSyncResult(data);
}
