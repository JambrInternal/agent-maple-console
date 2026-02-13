import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import Knowledge from '../Knowledge'
import {
    completeKnowledgeCloudCallback,
    getKnowledgeCloudAuthorizeUrl,
    getKnowledgeSources,
    listKnowledgeCloudTokens,
    syncKnowledgeGoogleDrive,
    uploadKnowledgeSource,
} from '../../services/knowledge'

vi.mock('../../services/knowledge', () => ({
    getKnowledgeSources: vi.fn(),
    uploadKnowledgeSource: vi.fn(),
    listKnowledgeCloudTokens: vi.fn(),
    getKnowledgeCloudAuthorizeUrl: vi.fn(),
    completeKnowledgeCloudCallback: vi.fn(),
    syncKnowledgeGoogleDrive: vi.fn(),
    syncKnowledgeSharePoint: vi.fn(),
}))

describe('Knowledge page', () => {
    let windowOpenSpy

    const renderKnowledge = (initialEntry = '/org_1/proj_1/knowledge') => {
        const queryClient = new QueryClient()
        return render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={[initialEntry]}>
                    <Routes>
                        <Route path="/:orgId/:projId/knowledge" element={<Knowledge />} />
                    </Routes>
                </MemoryRouter>
            </QueryClientProvider>
        )
    }

    beforeEach(() => {
        sessionStorage.clear()
        vi.clearAllMocks()
        vi.mocked(getKnowledgeSources).mockResolvedValue([])
        vi.mocked(listKnowledgeCloudTokens).mockResolvedValue([])
        vi.mocked(uploadKnowledgeSource).mockResolvedValue({
            id: '1',
            projectId: 'org_1',
            name: 'doc.pdf',
            type: 'pdf',
            status: 'pending',
            documentCount: 0,
            lastSyncAt: null,
            createdAt: '2026-02-13T00:00:00Z',
        })
        vi.mocked(getKnowledgeCloudAuthorizeUrl).mockResolvedValue({
            authorizationUrl: 'https://example.com/oauth',
            state: 'state_123',
        })
        vi.mocked(completeKnowledgeCloudCallback).mockResolvedValue({
            accessToken: 'token',
            refreshToken: null,
            expiresIn: 3600,
            tokenType: 'Bearer',
        })
        vi.mocked(syncKnowledgeGoogleDrive).mockResolvedValue({
            watchesCreated: 1,
            syncStatus: 'processing',
            message: 'started',
        })
        windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null)
    })

    afterEach(() => {
        windowOpenSpy.mockRestore()
    })

    it('renders knowledge headers, upload action, and cloud connect section', async () => {
        renderKnowledge()

        expect(getKnowledgeSources).toHaveBeenCalledWith({
            organizationId: 'org_1',
            projectId: 'proj_1',
        })
        expect(listKnowledgeCloudTokens).toHaveBeenCalledWith({
            organizationId: 'org_1',
            projectId: 'proj_1',
        })
        expect(screen.getByRole('heading', { name: 'Knowledge Base' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Upload Files' })).toBeEnabled()
        expect(screen.getAllByRole('button', { name: 'Connect' })).toHaveLength(2)
        expect(screen.getByText('Google Drive')).toBeInTheDocument()
        expect(screen.getByText('SharePoint')).toBeInTheDocument()

        expect(await screen.findByText('File Name')).toBeInTheDocument()
        expect(screen.getByText('Type')).toBeInTheDocument()
        expect(screen.getByText('Source')).toBeInTheDocument()
        expect(screen.getByText('Status')).toBeInTheDocument()
        expect(screen.getByText('Uploaded')).toBeInTheDocument()
    })

    it('uploads multiple files and reports partial failures', async () => {
        vi.mocked(uploadKnowledgeSource)
            .mockResolvedValueOnce({
                id: '1',
                projectId: 'org_1',
                name: 'good.pdf',
                type: 'pdf',
                status: 'pending',
                documentCount: 0,
                lastSyncAt: null,
                createdAt: '2026-02-13T00:00:00Z',
            })
            .mockRejectedValueOnce(new Error('file too large'))

        const { container } = renderKnowledge()
        const fileInput = container.querySelector('input[type="file"]')
        const goodFile = new File(['good'], 'good.pdf', { type: 'application/pdf' })
        const badFile = new File(['bad'], 'bad.pdf', { type: 'application/pdf' })

        expect(fileInput).not.toBeNull()
        const user = userEvent.setup()
        await user.upload(fileInput, [goodFile, badFile])

        await waitFor(() => expect(uploadKnowledgeSource).toHaveBeenCalledTimes(2))
        expect(uploadKnowledgeSource).toHaveBeenNthCalledWith(
            1,
            { organizationId: 'org_1', projectId: 'proj_1' },
            goodFile
        )
        expect(uploadKnowledgeSource).toHaveBeenNthCalledWith(
            2,
            { organizationId: 'org_1', projectId: 'proj_1' },
            badFile
        )
        expect(await screen.findByText('Uploaded 1 file(s), 1 failed.')).toBeInTheDocument()
        expect(screen.getByText(/bad\.pdf: upload failed\./i)).toBeInTheDocument()
    })

    it('starts cloud OAuth connect flow and redirects to authorization URL', async () => {
        renderKnowledge()

        await userEvent.click(screen.getAllByRole('button', { name: 'Connect' })[0])

        await waitFor(() =>
            expect(getKnowledgeCloudAuthorizeUrl).toHaveBeenCalledWith(
                { organizationId: 'org_1', projectId: 'proj_1' },
                'google_drive',
                expect.stringContaining('/org_1/proj_1/knowledge?oauth_provider=google_drive')
            )
        )
        expect(sessionStorage.getItem('am_knowledge_oauth_state:org_1:proj_1:google_drive')).toBe('state_123')
        expect(windowOpenSpy).toHaveBeenCalledWith('https://example.com/oauth', '_self')
    })

    it('completes OAuth callback and starts google drive root sync', async () => {
        sessionStorage.setItem('am_knowledge_oauth_state:org_1:proj_1:google_drive', 'state_123')
        renderKnowledge('/org_1/proj_1/knowledge?oauth_provider=google_drive&code=oauth_code&state=state_123')

        await waitFor(() =>
            expect(completeKnowledgeCloudCallback).toHaveBeenCalledWith(
                { organizationId: 'org_1', projectId: 'proj_1' },
                'google_drive',
                'oauth_code',
                expect.stringContaining('/org_1/proj_1/knowledge?oauth_provider=google_drive')
            )
        )
        expect(syncKnowledgeGoogleDrive).toHaveBeenCalledWith(
            { organizationId: 'org_1', projectId: 'proj_1' },
            { recursive: false }
        )
        expect(await screen.findByText('Google Drive connected. Root sync started.')).toBeInTheDocument()
    })

    it('shows connected state for google drive and sharepoint tokens', async () => {
        vi.mocked(listKnowledgeCloudTokens).mockResolvedValue([
            {
                provider: 'google_drive',
                accessToken: 'token_1',
                expiresAt: null,
                createdAt: null,
                updatedAt: null,
            },
            {
                provider: 'sharepoint',
                accessToken: 'token_2',
                expiresAt: null,
                createdAt: null,
                updatedAt: null,
            },
        ])

        renderKnowledge()

        expect(await screen.findAllByText('Connected')).toHaveLength(2)
        expect(screen.getAllByRole('button', { name: 'Reconnect' })).toHaveLength(2)
    })
})
