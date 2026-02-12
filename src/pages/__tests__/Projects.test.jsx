import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import Projects from '../Projects'
import { createProject, getProjects } from '../../services/projects'

vi.mock('../../services/projects', () => ({
    createProject: vi.fn(),
    getProjects: vi.fn(),
    updateProjectStatus: vi.fn(),
}))

const mockProjects = [
    {
        id: 'proj_1',
        organizationId: 'org_1',
        name: 'Site A',
        agentStatus: 'online',
        threadCount: 4,
        issueCount: 1,
        lastActivityAt: '2026-02-04T08:00:00Z',
        createdAt: '2024-01-01T00:00:00Z',
    },
    {
        id: 'proj_2',
        organizationId: 'org_1',
        name: 'Site B',
        agentStatus: 'offline',
        threadCount: 0,
        issueCount: 0,
        lastActivityAt: '2026-02-01T08:00:00Z',
        createdAt: '2024-01-02T00:00:00Z',
    },
]

const renderWithRoute = async ({
    initialEntry = '/org_1/projects',
    projects = mockProjects,
} = {}) => {
    vi.mocked(getProjects).mockResolvedValue(projects)
    const queryClient = new QueryClient()
    render(
        <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={[initialEntry]}>
                <Routes>
                    <Route path="/:orgId/projects" element={<Projects />} />
                </Routes>
            </MemoryRouter>
        </QueryClientProvider>
    )
}

describe('Projects page', () => {
    it('renders project cards from the service', async () => {
        await renderWithRoute()
        expect(await screen.findByText('Site A')).toBeInTheDocument()
        expect(screen.getByText('Site B')).toBeInTheDocument()
    })

    it('filters by status', async () => {
        const user = userEvent.setup()
        await renderWithRoute()
        await screen.findByText('Site A')

        await user.click(screen.getByRole('button', { name: 'Offline' }))

        expect(screen.queryByText('Site A')).not.toBeInTheDocument()
        expect(screen.getByText('Site B')).toBeInTheDocument()
    })

    it('disables launch project when organization already has a project', async () => {
        await renderWithRoute()
        await screen.findByText('Site A')

        const launchButton = screen.getByRole('button', { name: 'Launch Project' })
        expect(launchButton).toBeDisabled()
        expect(launchButton).toHaveStyle({ opacity: '0.55' })
    })

    it('creates a project from the modal', async () => {
        const user = userEvent.setup()
        vi.mocked(createProject).mockResolvedValue({
            id: 'proj_3',
            organizationId: 'org_1',
            name: 'New Project',
            agentStatus: 'offline',
            threadCount: 0,
            issueCount: 0,
            lastActivityAt: '2026-02-06T08:00:00Z',
            createdAt: '2026-02-06T08:00:00Z',
        })

        await renderWithRoute({ projects: [] })
        await screen.findByText('No projects match your filters.')

        await user.click(screen.getByRole('button', { name: 'Launch Project' }))
        await user.type(screen.getByLabelText('Project Name'), 'New Project')
        await user.click(screen.getByRole('button', { name: 'Create Project' }))

        expect(createProject).toHaveBeenCalledWith('org_1', 'New Project')
    })
})
