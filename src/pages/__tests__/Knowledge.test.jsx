import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import Knowledge from '../Knowledge'
import {
    completeKnowledgeCloudCallback,
    deleteKnowledgeSource,
    disconnectKnowledgeCloudProvider,
    getKnowledgeCloudAuthorizeUrl,
    getKnowledgeSourceDownloadUrl,
    getKnowledgeSources,
    listKnowledgeCloudTokens,
    listKnowledgeGoogleDriveConfig,
    listKnowledgeSharePointConfig,
    reindexKnowledgeSource,
    syncKnowledgeGoogleDrive,
    uploadKnowledgeSource,
} from '../../services/knowledge'

const mockUseFeatureFlag = vi.fn()

vi.mock('../../services/knowledge', () => ({
    getKnowledgeSources: vi.fn(),
    uploadKnowledgeSource: vi.fn(),
    listKnowledgeCloudTokens: vi.fn(),
    getKnowledgeCloudAuthorizeUrl: vi.fn(),
    completeKnowledgeCloudCallback: vi.fn(),
    syncKnowledgeGoogleDrive: vi.fn(),
    syncKnowledgeSharePoint: vi.fn(),
    listKnowledgeGoogleDriveConfig: vi.fn(),
    listKnowledgeSharePointConfig: vi.fn(),
    disconnectKnowledgeCloudProvider: vi.fn(),
    getKnowledgeSourceDownloadUrl: vi.fn(),
    reindexKnowledgeSource: vi.fn(),
    deleteKnowledgeSource: vi.fn(),
}))

vi.mock('../../featureFlags/useFeatureFlag', () => ({
    useFeatureFlag: (...args) => mockUseFeatureFlag(...args),
}))

describe('Knowledge page', () => {
    let windowLocationAssignSpy
    let windowOpenSpy
    let confirmSpy
    let originalLocation

    const knowledgeRows = [
        {
            id: '1',
            projectId: 'proj_1',
            name: 'doc-1.pdf',
            type: 'pdf',
            status: 'ready',
            documentCount: 0,
            lastSyncAt: null,
            createdAt: '2026-02-13T00:00:00Z',
        },
        {
            id: '2',
            projectId: 'proj_1',
            name: 'doc-2.pdf',
            type: 'google_drive',
            status: 'indexing',
            documentCount: 0,
            lastSyncAt: null,
            createdAt: '2026-02-13T00:00:00Z',
        },
    ]

    const renderKnowledge = (initialEntry = '/org_1/proj_1/knowledge') => {
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
                        <Route path="/:orgId/:projId/knowledge" element={<Knowledge />} />
                    </Routes>
                </MemoryRouter>
            </QueryClientProvider>
        )
    }

    beforeEach(() => {
        sessionStorage.clear()
        vi.clearAllMocks()
        mockUseFeatureFlag.mockReturnValue({
            enabled: true,
            source: 'fallback',
            loading: false,
        })
        vi.mocked(getKnowledgeSources).mockResolvedValue(knowledgeRows)
        vi.mocked(listKnowledgeCloudTokens).mockResolvedValue([])
        vi.mocked(uploadKnowledgeSource).mockResolvedValue({
            id: '1',
            projectId: 'proj_1',
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
        vi.mocked(listKnowledgeGoogleDriveConfig).mockResolvedValue([])
        vi.mocked(listKnowledgeSharePointConfig).mockResolvedValue([])
        vi.mocked(disconnectKnowledgeCloudProvider).mockResolvedValue()
        vi.mocked(getKnowledgeSourceDownloadUrl).mockResolvedValue({
            downloadUrl: 'https://signed.example.com/doc.pdf',
            expiresIn: 3600,
        })
        vi.mocked(reindexKnowledgeSource).mockResolvedValue(knowledgeRows[0])
        vi.mocked(deleteKnowledgeSource).mockResolvedValue()

        originalLocation = window.location
        delete window.location
        windowLocationAssignSpy = vi.fn()
        window.location = {
            assign: windowLocationAssignSpy,
            origin: 'http://localhost:3000',
            pathname: '/org_1/proj_1/knowledge',
            href: 'http://localhost:3000/org_1/proj_1/knowledge',
        }

        windowOpenSpy = vi.fn()
        vi.stubGlobal('open', windowOpenSpy)
        confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
    })

    afterEach(() => {
        window.location = originalLocation
        vi.unstubAllGlobals()
        confirmSpy.mockRestore()
    })

    it('renders tabs, rows, and cloud connect cards', async () => {
        renderKnowledge()

        expect(getKnowledgeSources).toHaveBeenCalledWith(
            { organizationId: 'org_1', projectId: 'proj_1' },
            { source: undefined }
        )
        expect(listKnowledgeCloudTokens).toHaveBeenCalledWith({
            organizationId: 'org_1',
            projectId: 'proj_1',
        })
        expect(screen.getByRole('heading', { name: 'Knowledge Base' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Upload Files' })).toBeEnabled()
        expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Google Drive' })).toBeInTheDocument()
        expect(screen.getAllByRole('button', { name: 'Connect' })).toHaveLength(2)

        expect(await screen.findByText('doc-1.pdf')).toBeInTheDocument()
        expect(screen.getByText('doc-2.pdf')).toBeInTheDocument()
    })

    it('applies source tab from URL and requests filtered knowledge list', async () => {
        renderKnowledge('/org_1/proj_1/knowledge?source=google_drive')

        await waitFor(() => {
            expect(getKnowledgeSources).toHaveBeenCalledWith(
                { organizationId: 'org_1', projectId: 'proj_1' },
                { source: 'google_drive' }
            )
        })
        expect(screen.getByRole('button', { name: 'Google Drive' }).className).toContain('active')
    })

    it('uploads multiple files and reports partial failures', async () => {
        vi.mocked(uploadKnowledgeSource)
            .mockResolvedValueOnce({
                id: '1',
                projectId: 'proj_1',
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
        expect(await screen.findByText('Uploaded 1 file(s), 1 failed.')).toBeInTheDocument()
        expect(screen.getByText(/bad\.pdf: upload failed\./i)).toBeInTheDocument()
    })

    it('starts OAuth connect flow and redirects to provider URL', async () => {
        renderKnowledge()
        const user = userEvent.setup()

        await user.click(screen.getAllByRole('button', { name: 'Connect' })[0])

        await waitFor(() =>
            expect(getKnowledgeCloudAuthorizeUrl).toHaveBeenCalledWith(
                { organizationId: 'org_1', projectId: 'proj_1' },
                'google_drive',
                expect.stringContaining('/org_1/proj_1/knowledge?oauth_provider=google_drive')
            )
        )
        expect(sessionStorage.getItem('am_knowledge_oauth_state:org_1:proj_1:google_drive')).toBe('state_123')
        expect(windowLocationAssignSpy).toHaveBeenCalledWith('https://example.com/oauth')
    })

    it('completes OAuth callback, syncs root, and preserves source tab query', async () => {
        sessionStorage.setItem('am_knowledge_oauth_state:org_1:proj_1:google_drive', 'state_123')
        renderKnowledge('/org_1/proj_1/knowledge?source=upload&oauth_provider=google_drive&code=oauth_code&state=state_123')

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
        expect(screen.getByRole('button', { name: 'Upload' }).className).toContain('active')
    })

    it('submits manual folder IDs from sync dialog', async () => {
        vi.mocked(listKnowledgeCloudTokens).mockResolvedValue([
            {
                provider: 'google_drive',
                accessToken: 'token_1',
                expiresAt: null,
                createdAt: null,
                updatedAt: null,
            },
        ])
        vi.mocked(listKnowledgeGoogleDriveConfig).mockResolvedValue([
            {
                watchId: '11',
                folderId: 'existing_root',
                createdAt: '2026-02-13T00:00:00.000Z',
            },
        ])

        renderKnowledge()
        const user = userEvent.setup()
        const syncButtons = await screen.findAllByRole('button', { name: 'Sync' })
        await user.click(syncButtons[0])

        await user.type(screen.getByLabelText('Folder IDs (Optional)'), ' root, team-folder\nroot ')
        await user.click(screen.getByRole('checkbox', { name: 'Sync subfolders recursively' }))
        await user.click(screen.getByRole('button', { name: 'Start Google Drive Sync' }))

        await waitFor(() =>
            expect(syncKnowledgeGoogleDrive).toHaveBeenCalledWith(
                { organizationId: 'org_1', projectId: 'proj_1' },
                { recursive: true, folderIds: ['root', 'team-folder'] }
            )
        )
    })

    it('disconnects cloud provider token', async () => {
        vi.mocked(listKnowledgeCloudTokens).mockResolvedValue([
            {
                provider: 'google_drive',
                accessToken: 'token_1',
                expiresAt: null,
                createdAt: null,
                updatedAt: null,
            },
        ])

        renderKnowledge()
        const user = userEvent.setup()

        await user.click(await screen.findByRole('button', { name: 'Disconnect' }))

        await waitFor(() =>
            expect(disconnectKnowledgeCloudProvider).toHaveBeenCalledWith(
                { organizationId: 'org_1', projectId: 'proj_1' },
                'google_drive'
            )
        )
        expect(window.confirm).toHaveBeenCalled()
    })

    it('runs datasource row actions and bulk delete', async () => {
        renderKnowledge()
        const user = userEvent.setup()

        await user.click(await screen.findByLabelText('Knowledge actions for doc-1.pdf'))
        await user.click(screen.getByRole('menuitem', { name: 'Download' }))
        expect(getKnowledgeSourceDownloadUrl).toHaveBeenCalledWith(
            { organizationId: 'org_1', projectId: 'proj_1' },
            '1'
        )
        expect(windowOpenSpy).toHaveBeenCalledWith('https://signed.example.com/doc.pdf', '_blank', 'noopener,noreferrer')

        await user.click(screen.getByLabelText('Knowledge actions for doc-1.pdf'))
        await user.click(screen.getByRole('menuitem', { name: 'Reprocess' }))
        await waitFor(() =>
            expect(reindexKnowledgeSource).toHaveBeenCalledWith(
                '1',
                { organizationId: 'org_1', projectId: 'proj_1' }
            )
        )

        await user.click(screen.getByLabelText('Select doc-1.pdf'))
        await user.click(screen.getByLabelText('Select doc-2.pdf'))
        await user.click(screen.getByRole('button', { name: 'Delete Selected' }))

        await waitFor(() => expect(deleteKnowledgeSource).toHaveBeenCalledTimes(2))
        expect(deleteKnowledgeSource).toHaveBeenNthCalledWith(
            1,
            '1',
            { organizationId: 'org_1', projectId: 'proj_1' }
        )
        expect(deleteKnowledgeSource).toHaveBeenNthCalledWith(
            2,
            '2',
            { organizationId: 'org_1', projectId: 'proj_1' }
        )
    })

    it('hides cloud actions and blocks oauth callback when cloud flag is disabled', async () => {
        mockUseFeatureFlag.mockReturnValue({
            enabled: false,
            source: 'fallback',
            loading: false,
        })

        renderKnowledge('/org_1/proj_1/knowledge?oauth_provider=google_drive&code=oauth_code&state=state_123')

        expect(await screen.findByText('Cloud actions are disabled by feature flag.')).toBeInTheDocument()
        expect(screen.queryByRole('button', { name: 'Connect' })).not.toBeInTheDocument()
        expect(screen.queryByRole('button', { name: 'Sync' })).not.toBeInTheDocument()
        expect(completeKnowledgeCloudCallback).not.toHaveBeenCalled()
        expect(syncKnowledgeGoogleDrive).not.toHaveBeenCalled()
    })
})
