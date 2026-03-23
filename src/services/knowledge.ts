// Knowledge Base Service
import { apiFetch } from '../api/client';
import { mapDatasourceResponse, unwrapData, type ApiDatasource, type ApiResponse } from '../api/mappers';
import { toIsoStringOrNull, toKnowledgeStatus, toStringId } from '../api/mapping/shared';
import type { KnowledgeSource } from '../api/types';
import {
  resolveTenantIdFromScopedInput,
  resolveTenantIdFromScopedInputOptional,
  type ProjectScopedInput,
} from './projectFacade';

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

type KnowledgeCloudWatchConfigApiResponse = {
    watch_id?: number | null;
    folder?: {
        id?: string | null;
    } | null;
    created_at?: string | null;
};

type KnowledgeSourceDownloadUrlApiResponse = {
    download_url?: string | null;
    expires_in?: number | null;
};

type KnowledgeChunkApiResponse = {
    id?: number | null;
    datasource_id?: number | null;
    chunk_index?: number | null;
    chunk_title?: string | null;
    element_type?: string | null;
    always_handle?: boolean | null;
    text?: string | null;
    page?: string | null;
    status?: string | null;
    error_message?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
};

export type KnowledgeSourceFilter = 'upload' | 'knowledge_extraction' | 'google_drive' | 'sharepoint';
export type KnowledgeCloudProvider = 'google_drive' | 'sharepoint';
export type KnowledgeChunkStatus = 'pending' | 'indexing' | 'ready' | 'error';
export type KnowledgeChunkElementType = 'TEXT' | 'IMAGE_PAGE' | '';
export type KnowledgeChunkSortBy = 'id' | 'created_at' | 'status';
export type KnowledgeChunkSortOrder = 'asc' | 'desc';

export interface KnowledgeSourceListOptions {
    source?: KnowledgeSourceFilter;
}

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
    folderIds?: string[];
}

export interface KnowledgeCloudSyncResult {
    watchesCreated: number;
    syncStatus: string;
    message: string;
}

export interface KnowledgeCloudWatchConfig {
    watchId: string;
    folderId: string;
    createdAt: string | null;
}

export interface KnowledgeSourceDownloadUrlResult {
    downloadUrl: string;
    expiresIn: number | null;
}

export interface KnowledgeChunk {
    id: string;
    datasourceId: string;
    chunkIndex: number;
    chunkTitle: string;
    elementType: KnowledgeChunkElementType;
    alwaysHandle: boolean;
    text: string;
    page: string;
    status: KnowledgeChunkStatus;
    errorMessage: string | null;
    createdAt: string | null;
    updatedAt: string | null;
}

export interface KnowledgeChunkListOptions {
    datasourceId?: string | number;
    status?: string;
    elementType?: 'TEXT' | 'IMAGE_PAGE';
    sortBy?: KnowledgeChunkSortBy;
    sortOrder?: KnowledgeChunkSortOrder;
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

const toCloudWatchConfig = (config: KnowledgeCloudWatchConfigApiResponse): KnowledgeCloudWatchConfig => ({
  watchId: toStringId(config.watch_id),
  folderId: (config.folder?.id || '').trim(),
  createdAt: toIsoStringOrNull(config.created_at),
});

const toKnowledgeChunkElementType = (value: unknown): KnowledgeChunkElementType => {
  if (value === 'TEXT' || value === 'IMAGE_PAGE') return value;
  return '';
};

const toKnowledgeChunk = (chunk: KnowledgeChunkApiResponse): KnowledgeChunk => ({
  id: toStringId(chunk.id),
  datasourceId: toStringId(chunk.datasource_id),
  chunkIndex: typeof chunk.chunk_index === 'number' ? chunk.chunk_index : -1,
  chunkTitle: chunk.chunk_title || '',
  elementType: toKnowledgeChunkElementType(chunk.element_type),
  alwaysHandle: Boolean(chunk.always_handle),
  text: chunk.text || '',
  page: chunk.page || '',
  status: toKnowledgeStatus(chunk.status),
  errorMessage: chunk.error_message || null,
  createdAt: toIsoStringOrNull(chunk.created_at),
  updatedAt: toIsoStringOrNull(chunk.updated_at),
});

const normalizeFolderIds = (folderIds?: string[]): string[] | undefined => {
  if (!Array.isArray(folderIds)) return undefined;

  const deduped = Array.from(
    new Set(
      folderIds
        .map((folderId) => folderId.trim())
        .filter(Boolean)
    )
  );

  return deduped.length > 0 ? deduped : undefined;
};

const buildTenantHeaders = (
  scope: ProjectScopedInput | undefined,
  context: string
): Record<string, string> => {
  const tenantId = resolveTenantIdFromScopedInputOptional(scope, context);
  if (!tenantId) return {};

  return {
    'x-tenant-id': tenantId,
  };
};

const normalizeChunkIds = (chunkIds: Array<number | string>): number[] => {
  return Array.from(new Set(
    chunkIds
      .map((chunkId) => {
        const parsed = Number(chunkId);
        return Number.isInteger(parsed) ? parsed : null;
      })
      .filter((chunkId): chunkId is number => chunkId !== null)
  ));
};

/**
 * Get all knowledge sources for a given project context.
 *
 * Accepts either:
 * - a project facade scope object (`{ organizationId, projectId }`), or
 * - a tenant/organization ID string.
 *
 * Tenant-scoped backend resources are resolved via project facade mapping.
 */
export async function getKnowledgeSources(
  scope: ProjectScopedInput,
  options?: KnowledgeSourceListOptions
): Promise<KnowledgeSource[]> {
  const tenantId = resolveTenantIdFromScopedInput(scope, 'knowledge source list');
  const params = new URLSearchParams();
  if (options?.source) {
    params.set('source', options.source);
  }
  const endpoint = params.size > 0 ? `/datasources?${params.toString()}` : '/datasources';

  const response = await apiFetch<ApiResponse<ApiDatasource[]>>(endpoint, {
    headers: {
      'x-tenant-id': tenantId,
    },
  });
  const data = unwrapData(response, []);
  return data.map(mapDatasourceResponse);
}

/**
 * Get a single knowledge source by ID.
 */
export async function getKnowledgeSource(id: string, scope?: ProjectScopedInput): Promise<KnowledgeSource> {
  const response = await apiFetch<ApiResponse<ApiDatasource>>(`/datasources/${id}`, {
    headers: buildTenantHeaders(scope, 'knowledge source read'),
  });
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
  const tenantId = resolveTenantIdFromScopedInput(scope, 'knowledge source upload');
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
export async function deleteKnowledgeSource(id: string, scope?: ProjectScopedInput): Promise<void> {
  await apiFetch(`/datasources/${id}`, {
    method: 'DELETE',
    headers: buildTenantHeaders(scope, 'knowledge source delete'),
  });
}

/**
 * Re-index a knowledge source.
 */
export async function reindexKnowledgeSource(id: string, scope?: ProjectScopedInput): Promise<KnowledgeSource> {
  await apiFetch(`/datasources/${id}/reprocess`, {
    method: 'POST',
    headers: buildTenantHeaders(scope, 'knowledge source reprocess'),
  });
  return getKnowledgeSource(id, scope);
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

export async function listKnowledgeGoogleDriveConfig(scope: ProjectScopedInput): Promise<KnowledgeCloudWatchConfig[]> {
  const tenantId = resolveTenantIdFromScopedInput(scope, 'knowledge google drive config');
  const response = await apiFetch<ApiResponse<KnowledgeCloudWatchConfigApiResponse[]>>('/datasources/google-drive-config', {
    headers: {
      'x-tenant-id': tenantId,
    },
  });
  const config = unwrapData(response, []);
  return config.map(toCloudWatchConfig);
}

export async function listKnowledgeSharePointConfig(scope: ProjectScopedInput): Promise<KnowledgeCloudWatchConfig[]> {
  const tenantId = resolveTenantIdFromScopedInput(scope, 'knowledge sharepoint config');
  const response = await apiFetch<ApiResponse<KnowledgeCloudWatchConfigApiResponse[]>>('/datasources/sharepoint-config', {
    headers: {
      'x-tenant-id': tenantId,
    },
  });
  const config = unwrapData(response, []);
  return config.map(toCloudWatchConfig);
}

export async function disconnectKnowledgeCloudProvider(
  scope: ProjectScopedInput,
  provider: KnowledgeCloudProvider
): Promise<void> {
  const tenantId = resolveTenantIdFromScopedInput(scope, 'knowledge cloud disconnect');
  await apiFetch(`/oauth2/unauthorize/${provider}`, {
    method: 'DELETE',
    headers: {
      'x-tenant-id': tenantId,
    },
  });
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
      folder_ids: normalizeFolderIds(options?.folderIds),
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
      folder_ids: normalizeFolderIds(options?.folderIds),
    }),
  });
  const data = unwrapData(response);
  return toCloudSyncResult(data);
}

export async function getKnowledgeSourceDownloadUrl(
  scope: ProjectScopedInput,
  datasourceId: string
): Promise<KnowledgeSourceDownloadUrlResult> {
  const tenantId = resolveTenantIdFromScopedInput(scope, 'knowledge source download url');
  const response = await apiFetch<ApiResponse<KnowledgeSourceDownloadUrlApiResponse>>(
    `/datasources/${datasourceId}/download-url`,
    {
      headers: {
        'x-tenant-id': tenantId,
      },
    }
  );
  const data = unwrapData(response);
  return {
    downloadUrl: data.download_url || '',
    expiresIn: typeof data.expires_in === 'number' ? data.expires_in : null,
  };
}

export async function listKnowledgeChunks(
  scope: ProjectScopedInput,
  options: KnowledgeChunkListOptions
): Promise<KnowledgeChunk[]> {
  const tenantId = resolveTenantIdFromScopedInput(scope, 'knowledge chunk list');
  const params = new URLSearchParams();
  if (options.datasourceId !== undefined) {
    params.set('datasource_id', String(options.datasourceId));
  }
  if (options.status) {
    params.set('status', options.status);
  }
  if (options.elementType) {
    params.set('element_type', options.elementType);
  }
  if (options.sortBy) {
    params.set('sort_by', options.sortBy);
  }
  if (options.sortOrder) {
    params.set('sort_order', options.sortOrder);
  }
  const endpoint = params.size > 0 ? `/file-chunks?${params.toString()}` : '/file-chunks';

  const response = await apiFetch<ApiResponse<KnowledgeChunkApiResponse[]>>(endpoint, {
    headers: {
      'x-tenant-id': tenantId,
    },
  });
  const chunks = unwrapData(response, []);
  return chunks.map(toKnowledgeChunk);
}

export async function reprocessKnowledgeChunk(
  scope: ProjectScopedInput,
  chunkId: string
): Promise<void> {
  const tenantId = resolveTenantIdFromScopedInput(scope, 'knowledge chunk reprocess');
  await apiFetch(`/file-chunks/${chunkId}/reprocess`, {
    method: 'POST',
    headers: {
      'x-tenant-id': tenantId,
    },
  });
}

export async function reprocessKnowledgeChunksBatch(
  scope: ProjectScopedInput,
  chunkIds: Array<number | string>
): Promise<void> {
  const normalizedChunkIds = normalizeChunkIds(chunkIds);
  if (normalizedChunkIds.length === 0) return;

  const tenantId = resolveTenantIdFromScopedInput(scope, 'knowledge chunk reprocess batch');
  await apiFetch('/file-chunks/reprocess-batch', {
    method: 'POST',
    headers: {
      'x-tenant-id': tenantId,
    },
    body: JSON.stringify({
      chunk_ids: normalizedChunkIds,
    }),
  });
}

export async function deleteKnowledgeChunksBatch(
  scope: ProjectScopedInput,
  chunkIds: Array<number | string>
): Promise<void> {
  const normalizedChunkIds = normalizeChunkIds(chunkIds);
  if (normalizedChunkIds.length === 0) return;

  const tenantId = resolveTenantIdFromScopedInput(scope, 'knowledge chunk delete batch');
  await apiFetch('/file-chunks/delete-batch', {
    method: 'POST',
    headers: {
      'x-tenant-id': tenantId,
    },
    body: JSON.stringify({
      chunk_ids: normalizedChunkIds,
    }),
  });
}
