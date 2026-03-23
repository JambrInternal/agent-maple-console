import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    completeKnowledgeCloudCallback,
    deleteKnowledgeChunksBatch,
    deleteKnowledgeSource,
    disconnectKnowledgeCloudProvider,
    getKnowledgeCloudAuthorizeUrl,
    getKnowledgeSource,
    getKnowledgeSourceDownloadUrl,
    getKnowledgeSources,
    listKnowledgeChunks,
    listKnowledgeCloudTokens,
    listKnowledgeGoogleDriveConfig,
    listKnowledgeSharePointConfig,
    reindexKnowledgeSource,
    reprocessKnowledgeChunk,
    reprocessKnowledgeChunksBatch,
    syncKnowledgeGoogleDrive,
    syncKnowledgeSharePoint,
    uploadKnowledgeSource,
} from './knowledge';
import { apiFetch } from '../api/client';
import { PROJECT_TENANT_MAP_STORAGE_KEY } from './projectFacade';

vi.mock('../api/client', () => ({
    API_CONFIG: { baseUrl: '' },
    apiFetch: vi.fn(),
}));

describe('knowledge service', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    it('lists knowledge sources for a tenant', async () => {
        vi.mocked(apiFetch).mockResolvedValue({
            data: [
                {
                    id: 1,
                    tenant_id: 2,
                    file_name: 'Specs.pdf',
                    source: 'upload',
                    content_type: 'application/pdf',
                    embedding_status: 'COMPLETED',
                    created_at: '2026-02-01T00:00:00Z',
                },
            ],
        });

        const result = await getKnowledgeSources('2');

        expect(apiFetch).toHaveBeenCalledWith('/datasources', {
            headers: { 'x-tenant-id': '2' },
        });
        expect(result[0].status).toBe('ready');
    });

    it('lists knowledge sources with source filter query', async () => {
        vi.mocked(apiFetch).mockResolvedValue({
            data: [],
        });

        await getKnowledgeSources('2', { source: 'google_drive' });

        expect(apiFetch).toHaveBeenCalledWith('/datasources?source=google_drive', {
            headers: { 'x-tenant-id': '2' },
        });
    });

    it('lists knowledge sources using project facade scope and stores project mapping', async () => {
        vi.mocked(apiFetch).mockResolvedValue({
            data: [],
        });

        await getKnowledgeSources({
            organizationId: 'tenant_1',
            projectId: 'proj_1',
        });

        expect(apiFetch).toHaveBeenCalledWith('/datasources', {
            headers: { 'x-tenant-id': 'tenant_1' },
        });
        expect(localStorage.getItem(PROJECT_TENANT_MAP_STORAGE_KEY)).toContain('"proj_1":"tenant_1"');
    });

    it('gets a knowledge source', async () => {
        vi.mocked(apiFetch).mockResolvedValue({
            data: {
                id: 5,
                tenant_id: 9,
                file_name: 'Manual.pdf',
                source: 'upload',
                content_type: 'application/pdf',
                embedding_status: 'IN_PROGRESS',
                created_at: '2026-02-01T00:00:00Z',
            },
        });

        const result = await getKnowledgeSource('5');

        expect(apiFetch).toHaveBeenCalledWith('/datasources/5', {
            headers: {},
        });
        expect(result.status).toBe('indexing');
    });

    it('uploads a knowledge source', async () => {
        const file = new File(['data'], 'doc.pdf', { type: 'application/pdf' });

        vi.mocked(apiFetch).mockResolvedValue({
            data: {
                id: 11,
                tenant_id: 7,
                file_name: 'doc.pdf',
                source: 'upload',
                content_type: 'application/pdf',
                embedding_status: 'NOT_STARTED',
                created_at: '2026-02-01T00:00:00Z',
            },
        });

        const result = await uploadKnowledgeSource('7', file);

        const [, options] = vi.mocked(apiFetch).mock.calls[0];
        expect(vi.mocked(apiFetch).mock.calls[0][0]).toBe('/datasources/upload');
        expect(options?.method).toBe('POST');
        expect(options?.headers).toEqual({ 'x-tenant-id': '7' });
        expect(options?.body).toBeInstanceOf(FormData);
        expect(result.name).toBe('doc.pdf');
    });

    it('deletes a knowledge source with scoped tenant header', async () => {
        vi.mocked(apiFetch).mockResolvedValue({});

        await deleteKnowledgeSource('22', {
            organizationId: 'tenant_1',
            projectId: 'proj_1',
        });

        expect(apiFetch).toHaveBeenCalledWith('/datasources/22', {
            method: 'DELETE',
            headers: { 'x-tenant-id': 'tenant_1' },
        });
    });

    it('reprocesses a knowledge source and reloads it with scope', async () => {
        vi.mocked(apiFetch)
            .mockResolvedValueOnce({})
            .mockResolvedValueOnce({
                data: {
                    id: 31,
                    tenant_id: 1,
                    file_name: 'Policy.pdf',
                    source: 'upload',
                    content_type: 'application/pdf',
                    embedding_status: 'IN_PROGRESS',
                    created_at: '2026-02-01T00:00:00Z',
                },
            });

        const result = await reindexKnowledgeSource('31', {
            organizationId: 'tenant_1',
            projectId: 'proj_1',
        });

        expect(apiFetch).toHaveBeenNthCalledWith(1, '/datasources/31/reprocess', {
            method: 'POST',
            headers: { 'x-tenant-id': 'tenant_1' },
        });
        expect(apiFetch).toHaveBeenNthCalledWith(2, '/datasources/31', {
            headers: { 'x-tenant-id': 'tenant_1' },
        });
        expect(result.status).toBe('indexing');
    });

    it('lists cloud tokens for knowledge integrations', async () => {
        vi.mocked(apiFetch).mockResolvedValue({
            data: [
                {
                    provider: 'google_drive',
                    access_token: 'secret',
                    expires_at: '2026-02-15T00:00:00Z',
                    created_at: '2026-02-13T00:00:00Z',
                    updated_at: '2026-02-13T00:00:00Z',
                },
            ],
        });

        const result = await listKnowledgeCloudTokens({
            organizationId: 'tenant_1',
            projectId: 'proj_1',
        });

        expect(apiFetch).toHaveBeenCalledWith('/oauth2/tokens', {
            headers: { 'x-tenant-id': 'tenant_1' },
        });
        expect(result).toEqual([
            {
                provider: 'google_drive',
                accessToken: 'secret',
                expiresAt: '2026-02-15T00:00:00Z',
                createdAt: '2026-02-13T00:00:00Z',
                updatedAt: '2026-02-13T00:00:00Z',
            },
        ]);
    });

    it('requests OAuth authorization URL with tenant scope', async () => {
        vi.mocked(apiFetch).mockResolvedValue({
            data: {
                authorization_url: 'https://auth.example.com/connect',
                state: 'state_123',
            },
        });

        const result = await getKnowledgeCloudAuthorizeUrl(
            { organizationId: 'tenant_1', projectId: 'proj_1' },
            'google_drive',
            'http://localhost:5173/org/proj/knowledge?oauth_provider=google_drive'
        );

        expect(apiFetch).toHaveBeenCalledWith('/oauth2/authorize', {
            method: 'POST',
            headers: { 'x-tenant-id': 'tenant_1' },
            body: JSON.stringify({
                provider: 'google_drive',
                redirect_uri: 'http://localhost:5173/org/proj/knowledge?oauth_provider=google_drive',
            }),
        });
        expect(result).toEqual({
            authorizationUrl: 'https://auth.example.com/connect',
            state: 'state_123',
        });
    });

    it('completes OAuth callback with tenant scope', async () => {
        vi.mocked(apiFetch).mockResolvedValue({
            data: {
                access_token: 'access_token_1',
                refresh_token: 'refresh_token_1',
                expires_in: 3600,
                token_type: 'Bearer',
            },
        });

        const result = await completeKnowledgeCloudCallback(
            { organizationId: 'tenant_1', projectId: 'proj_1' },
            'sharepoint',
            'oauth_code',
            'http://localhost:5173/org/proj/knowledge?oauth_provider=sharepoint'
        );

        expect(apiFetch).toHaveBeenCalledWith('/oauth2/callback', {
            method: 'POST',
            headers: { 'x-tenant-id': 'tenant_1' },
            body: JSON.stringify({
                provider: 'sharepoint',
                code: 'oauth_code',
                redirect_uri: 'http://localhost:5173/org/proj/knowledge?oauth_provider=sharepoint',
            }),
        });
        expect(result).toEqual({
            accessToken: 'access_token_1',
            refreshToken: 'refresh_token_1',
            expiresIn: 3600,
            tokenType: 'Bearer',
        });
    });

    it('lists google drive sync config watches', async () => {
        vi.mocked(apiFetch).mockResolvedValue({
            data: [
                {
                    watch_id: 11,
                    folder: { id: 'root' },
                    created_at: '2026-02-13T01:00:00Z',
                },
            ],
        });

        const result = await listKnowledgeGoogleDriveConfig({
            organizationId: 'tenant_1',
            projectId: 'proj_1',
        });

        expect(apiFetch).toHaveBeenCalledWith('/datasources/google-drive-config', {
            headers: { 'x-tenant-id': 'tenant_1' },
        });
        expect(result).toEqual([
            {
                watchId: '11',
                folderId: 'root',
                createdAt: '2026-02-13T01:00:00.000Z',
            },
        ]);
    });

    it('lists sharepoint sync config watches', async () => {
        vi.mocked(apiFetch).mockResolvedValue({
            data: [
                {
                    watch_id: 22,
                    folder: { id: 'sp_folder' },
                    created_at: '2026-02-13T02:00:00Z',
                },
            ],
        });

        const result = await listKnowledgeSharePointConfig({
            organizationId: 'tenant_1',
            projectId: 'proj_1',
        });

        expect(apiFetch).toHaveBeenCalledWith('/datasources/sharepoint-config', {
            headers: { 'x-tenant-id': 'tenant_1' },
        });
        expect(result).toEqual([
            {
                watchId: '22',
                folderId: 'sp_folder',
                createdAt: '2026-02-13T02:00:00.000Z',
            },
        ]);
    });

    it('disconnects cloud provider token', async () => {
        vi.mocked(apiFetch).mockResolvedValue({});

        await disconnectKnowledgeCloudProvider(
            { organizationId: 'tenant_1', projectId: 'proj_1' },
            'google_drive'
        );

        expect(apiFetch).toHaveBeenCalledWith('/oauth2/unauthorize/google_drive', {
            method: 'DELETE',
            headers: { 'x-tenant-id': 'tenant_1' },
        });
    });

    it('triggers google drive sync with folder IDs and recursive option', async () => {
        vi.mocked(apiFetch).mockResolvedValue({
            data: {
                watches_created: 1,
                sync_status: 'processing',
                message: 'sync started',
            },
        });

        const result = await syncKnowledgeGoogleDrive(
            {
                organizationId: 'tenant_1',
                projectId: 'proj_1',
            },
            {
                recursive: true,
                folderIds: [' root ', 'sub', 'root'],
            }
        );

        expect(apiFetch).toHaveBeenCalledWith('/datasources/sync-google-drive', {
            method: 'POST',
            headers: { 'x-tenant-id': 'tenant_1' },
            body: JSON.stringify({
                recursive: true,
                folder_ids: ['root', 'sub'],
            }),
        });
        expect(result).toEqual({
            watchesCreated: 1,
            syncStatus: 'processing',
            message: 'sync started',
        });
    });

    it('triggers sharepoint sync with recursive disabled by default', async () => {
        vi.mocked(apiFetch).mockResolvedValue({
            data: {
                watches_created: 2,
                sync_status: 'processing',
                message: 'sync started',
            },
        });

        const result = await syncKnowledgeSharePoint({
            organizationId: 'tenant_1',
            projectId: 'proj_1',
        });

        expect(apiFetch).toHaveBeenCalledWith('/datasources/sync-sharepoint', {
            method: 'POST',
            headers: { 'x-tenant-id': 'tenant_1' },
            body: JSON.stringify({
                recursive: false,
                folder_ids: undefined,
            }),
        });
        expect(result).toEqual({
            watchesCreated: 2,
            syncStatus: 'processing',
            message: 'sync started',
        });
    });

    it('gets datasource download URL', async () => {
        vi.mocked(apiFetch).mockResolvedValue({
            data: {
                download_url: 'https://signed.example.com/datasource.pdf',
                expires_in: 3600,
            },
        });

        const result = await getKnowledgeSourceDownloadUrl(
            { organizationId: 'tenant_1', projectId: 'proj_1' },
            '44'
        );

        expect(apiFetch).toHaveBeenCalledWith('/datasources/44/download-url', {
            headers: { 'x-tenant-id': 'tenant_1' },
        });
        expect(result).toEqual({
            downloadUrl: 'https://signed.example.com/datasource.pdf',
            expiresIn: 3600,
        });
    });

    it('lists chunks for a datasource with filters', async () => {
        vi.mocked(apiFetch).mockResolvedValue({
            data: [
                {
                    id: 91,
                    datasource_id: 44,
                    chunk_index: 3,
                    chunk_title: 'Intro',
                    element_type: 'TEXT',
                    always_handle: false,
                    text: 'First paragraph',
                    page: '1',
                    status: 'COMPLETED',
                    error_message: null,
                    created_at: '2026-02-13T00:00:00Z',
                    updated_at: '2026-02-13T00:30:00Z',
                },
            ],
        });

        const result = await listKnowledgeChunks(
            { organizationId: 'tenant_1', projectId: 'proj_1' },
            {
                datasourceId: '44',
                sortBy: 'created_at',
                sortOrder: 'desc',
            }
        );

        expect(apiFetch).toHaveBeenCalledWith('/file-chunks?datasource_id=44&sort_by=created_at&sort_order=desc', {
            headers: { 'x-tenant-id': 'tenant_1' },
        });
        expect(result).toEqual([
            {
                id: '91',
                datasourceId: '44',
                chunkIndex: 3,
                chunkTitle: 'Intro',
                elementType: 'TEXT',
                alwaysHandle: false,
                text: 'First paragraph',
                page: '1',
                status: 'ready',
                errorMessage: null,
                createdAt: '2026-02-13T00:00:00.000Z',
                updatedAt: '2026-02-13T00:30:00.000Z',
            },
        ]);
    });

    it('reprocesses a single chunk', async () => {
        vi.mocked(apiFetch).mockResolvedValue({});

        await reprocessKnowledgeChunk(
            { organizationId: 'tenant_1', projectId: 'proj_1' },
            '99'
        );

        expect(apiFetch).toHaveBeenCalledWith('/file-chunks/99/reprocess', {
            method: 'POST',
            headers: { 'x-tenant-id': 'tenant_1' },
        });
    });

    it('reprocesses chunk batch with normalized IDs', async () => {
        vi.mocked(apiFetch).mockResolvedValue({});

        await reprocessKnowledgeChunksBatch(
            { organizationId: 'tenant_1', projectId: 'proj_1' },
            ['42', 42, '77', 'bad']
        );

        expect(apiFetch).toHaveBeenCalledWith('/file-chunks/reprocess-batch', {
            method: 'POST',
            headers: { 'x-tenant-id': 'tenant_1' },
            body: JSON.stringify({
                chunk_ids: [42, 77],
            }),
        });
    });

    it('deletes chunk batch with normalized IDs', async () => {
        vi.mocked(apiFetch).mockResolvedValue({});

        await deleteKnowledgeChunksBatch(
            { organizationId: 'tenant_1', projectId: 'proj_1' },
            ['51', 51, '88', 'oops']
        );

        expect(apiFetch).toHaveBeenCalledWith('/file-chunks/delete-batch', {
            method: 'POST',
            headers: { 'x-tenant-id': 'tenant_1' },
            body: JSON.stringify({
                chunk_ids: [51, 88],
            }),
        });
    });
});
