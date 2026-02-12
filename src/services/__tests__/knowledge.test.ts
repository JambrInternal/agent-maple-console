import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    deleteKnowledgeSource,
    getKnowledgeSource,
    getKnowledgeSources,
    reindexKnowledgeSource,
    uploadKnowledgeSource,
} from '../knowledge';
import { apiFetch } from '../../api/client';
import { PROJECT_TENANT_MAP_STORAGE_KEY } from '../projectFacade';

vi.mock('../../api/client', () => ({
    API_CONFIG: { baseUrl: '' },
    apiFetch: vi.fn(),
}));

describe('knowledge service', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    it('lists knowledge sources for a project', async () => {
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

        expect(apiFetch).toHaveBeenCalledWith('/datasources/5');
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

    it('deletes a knowledge source', async () => {
        vi.mocked(apiFetch).mockResolvedValue({});

        await deleteKnowledgeSource('22');

        expect(apiFetch).toHaveBeenCalledWith('/datasources/22', { method: 'DELETE' });
    });

    it('reprocesses a knowledge source', async () => {
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

        const result = await reindexKnowledgeSource('31');

        expect(apiFetch).toHaveBeenNthCalledWith(1, '/datasources/31/reprocess', { method: 'POST' });
        expect(apiFetch).toHaveBeenNthCalledWith(2, '/datasources/31');
        expect(result.status).toBe('indexing');
    });
});
