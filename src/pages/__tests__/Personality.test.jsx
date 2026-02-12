import React from 'react'
import { beforeEach, describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import Personality from '../Personality'
import {
    getProjectPersonalityTemplate,
    saveProjectPersonalityTemplate,
} from '../../services/agentFacade'

vi.mock('../../services/agentFacade', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        ...actual,
        getProjectPersonalityTemplate: vi.fn(),
        saveProjectPersonalityTemplate: vi.fn(),
    }
})

const renderPage = () => {
    const queryClient = new QueryClient()
    render(
        <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={['/org_1/proj_1/personality']}>
                <Routes>
                    <Route path="/:orgId/:projId/personality" element={<Personality />} />
                </Routes>
            </MemoryRouter>
        </QueryClientProvider>
    )
}

describe('Personality page', () => {
    beforeEach(() => {
        localStorage.clear()
        vi.clearAllMocks()
    })

    it('loads the singleton personality template for project scope', async () => {
        vi.mocked(getProjectPersonalityTemplate).mockResolvedValue({
            id: '101',
            source: 'tenant_template',
            templateType: 'FULL_CONTROLLED',
            runnerInstructions: '',
            agentInstructions: 'Be concise and polite.',
            userRole: 'resident',
            conversationType: 'project_updates',
            aiRole: 'assistant',
            aiRoleCharacteristics: ['clear'],
            aiRoleEmotionalTone: [],
            aiRoleDialogueStrategy: [],
            aiRoleConstraints: [],
            contextContent: '',
            goals: [],
            evaluationCriteria: [],
            isDefault: true,
        })

        renderPage()

        expect(getProjectPersonalityTemplate).toHaveBeenCalledWith({
            organizationId: 'org_1',
            projectId: 'proj_1',
        })
        expect(await screen.findByRole('heading', { name: 'Personality' })).toBeInTheDocument()
        expect(await screen.findByDisplayValue('assistant')).toBeInTheDocument()
        expect(screen.queryByText(/Template ID/i)).not.toBeInTheDocument()
        expect(screen.queryByText('Mark as default template')).not.toBeInTheDocument()
        expect(screen.queryByLabelText('Template Type')).not.toBeInTheDocument()
        expect(screen.queryByRole('option', { name: 'Full Controlled' })).not.toBeInTheDocument()
        expect(screen.queryByLabelText('Agent Instructions')).not.toBeInTheDocument()
        expect(screen.queryByLabelText('Runner Instructions')).not.toBeInTheDocument()
        expect(screen.getByLabelText('User Role')).toBeInTheDocument()
    })

    it('saves updates through the personality facade', async () => {
        vi.mocked(getProjectPersonalityTemplate).mockResolvedValue({
            id: null,
            source: 'bootstrap_default',
            templateType: 'FULL_CONTROLLED',
            runnerInstructions: '',
            agentInstructions: '',
            userRole: 'resident',
            conversationType: 'project_updates',
            aiRole: 'assistant',
            aiRoleCharacteristics: [],
            aiRoleEmotionalTone: [],
            aiRoleDialogueStrategy: [],
            aiRoleConstraints: [],
            contextContent: '',
            goals: [],
            evaluationCriteria: [],
            isDefault: true,
        })
        vi.mocked(saveProjectPersonalityTemplate).mockResolvedValue({
            id: '700',
            source: 'tenant_template',
            templateType: 'FULL_CONTROLLED',
            runnerInstructions: '',
            agentInstructions: 'Use practical language.',
            userRole: 'resident',
            conversationType: 'project_updates',
            aiRole: 'assistant',
            aiRoleCharacteristics: [],
            aiRoleEmotionalTone: [],
            aiRoleDialogueStrategy: [],
            aiRoleConstraints: [],
            contextContent: '',
            goals: [],
            evaluationCriteria: [],
            isDefault: true,
        })

        renderPage()

        const user = userEvent.setup()
        const aiRoleField = await screen.findByLabelText('AI Role')
        await user.clear(aiRoleField)
        await user.type(aiRoleField, 'site_assistant')
        await user.click(screen.getByRole('button', { name: 'Save Personality' }))

        await waitFor(() => {
            expect(saveProjectPersonalityTemplate).toHaveBeenCalledWith(
                { organizationId: 'org_1', projectId: 'proj_1' },
                expect.objectContaining({
                    templateType: 'PARAMETERIZED',
                    aiRole: 'site_assistant',
                })
            )
        })
        expect(await screen.findByText('Personality template saved.')).toBeInTheDocument()
    })

    it('shows Full Controlled option for super admins only', async () => {
        localStorage.setItem('am_admin_mode', 'true')
        vi.mocked(getProjectPersonalityTemplate).mockResolvedValue({
            id: '101',
            source: 'tenant_template',
            templateType: 'FULL_CONTROLLED',
            runnerInstructions: '',
            agentInstructions: '',
            userRole: 'resident',
            conversationType: 'project_updates',
            aiRole: 'assistant',
            aiRoleCharacteristics: [],
            aiRoleEmotionalTone: [],
            aiRoleDialogueStrategy: [],
            aiRoleConstraints: [],
            contextContent: '',
            goals: [],
            evaluationCriteria: [],
            isDefault: true,
        })

        renderPage()

        expect(await screen.findByRole('heading', { name: 'Personality' })).toBeInTheDocument()
        expect(await screen.findByLabelText('Template Type')).toHaveValue('FULL_CONTROLLED')
        expect(screen.getByRole('option', { name: 'Full Controlled' })).toBeInTheDocument()
        expect(screen.getByLabelText('Agent Instructions')).toBeInTheDocument()
        expect(screen.getByLabelText('Runner Instructions')).toBeInTheDocument()
        expect(screen.queryByLabelText('User Role')).not.toBeInTheDocument()
    })
})
