import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import KnowledgeChunks from './KnowledgeChunks'
import {
    deleteKnowledgeChunksBatch,
    listKnowledgeChunks,
    reprocessKnowledgeChunk,
    reprocessKnowledgeChunksBatch,
} from '../../services/knowledge'

vi.mock('../../services/knowledge', () => ({
    listKnowledgeChunks: vi.fn(),
    reprocessKnowledgeChunk: vi.fn(),
    reprocessKnowledgeChunksBatch: vi.fn(),
    deleteKnowledgeChunksBatch: vi.fn(),
}))

describe('KnowledgeChunks page', () => {
    const renderPage = (initialEntry = '/org_1/proj_1/datasources/44/chunks') => {
        const queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                },
            },
        })
        return render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={[initialEntry]}>
                    <Routes>
                        <Route path="/:orgId/:projId/datasources/:datasourceId/chunks" element={<KnowledgeChunks />} />
                    </Routes>
                </MemoryRouter>
            </QueryClientProvider>
        )
    }

    beforeEach(() => {
        vi.clearAllMocks()
        vi.spyOn(window, 'confirm').mockReturnValue(true)
        vi.mocked(listKnowledgeChunks).mockResolvedValue([
            {
                id: '101',
                datasourceId: '44',
                chunkIndex: 0,
                chunkTitle: 'Intro',
                elementType: 'TEXT',
                alwaysHandle: false,
                text: 'first',
                page: '1',
                status: 'ready',
                errorMessage: null,
                createdAt: '2026-02-13T00:00:00.000Z',
                updatedAt: '2026-02-13T00:00:00.000Z',
            },
            {
                id: '102',
                datasourceId: '44',
                chunkIndex: 1,
                chunkTitle: 'Body',
                elementType: 'TEXT',
                alwaysHandle: false,
                text: 'second',
                page: '2',
                status: 'indexing',
                errorMessage: null,
                createdAt: '2026-02-13T00:00:00.000Z',
                updatedAt: '2026-02-13T00:00:00.000Z',
            },
        ])
        vi.mocked(reprocessKnowledgeChunk).mockResolvedValue()
        vi.mocked(reprocessKnowledgeChunksBatch).mockResolvedValue()
        vi.mocked(deleteKnowledgeChunksBatch).mockResolvedValue()
    })

    it('loads datasource chunks and shows rows', async () => {
        renderPage()

        await waitFor(() =>
            expect(listKnowledgeChunks).toHaveBeenCalledWith(
                { organizationId: 'org_1', projectId: 'proj_1' },
                {
                    datasourceId: '44',
                    sortBy: 'created_at',
                    sortOrder: 'desc',
                }
            )
        )
        expect(await screen.findByText('Intro')).toBeInTheDocument()
        expect(screen.getByText('Body')).toBeInTheDocument()
    })

    it('reprocesses a single chunk', async () => {
        renderPage()
        const user = userEvent.setup()

        await user.click(await screen.findAllByRole('button', { name: 'Reprocess' }).then((buttons) => buttons[0]))

        await waitFor(() =>
            expect(reprocessKnowledgeChunk).toHaveBeenCalledWith(
                { organizationId: 'org_1', projectId: 'proj_1' },
                '101'
            )
        )
    })

    it('runs batch reprocess and delete actions for selected chunks', async () => {
        renderPage()
        const user = userEvent.setup()

        await user.click(await screen.findByLabelText('Select chunk 101'))
        await user.click(screen.getByLabelText('Select chunk 102'))
        await user.click(screen.getByRole('button', { name: 'Reprocess Selected' }))
        await waitFor(() =>
            expect(reprocessKnowledgeChunksBatch).toHaveBeenCalledWith(
                { organizationId: 'org_1', projectId: 'proj_1' },
                ['101', '102']
            )
        )

        await user.click(screen.getByRole('button', { name: 'Delete Selected' }))
        await waitFor(() =>
            expect(deleteKnowledgeChunksBatch).toHaveBeenCalledWith(
                { organizationId: 'org_1', projectId: 'proj_1' },
                ['101', '102']
            )
        )
    })

    it('shows query error when chunks request fails', async () => {
        vi.mocked(listKnowledgeChunks).mockRejectedValue(new Error('boom'))
        renderPage()

        expect(await screen.findByText(/Failed to load chunks\./i)).toBeInTheDocument()
    })
})
