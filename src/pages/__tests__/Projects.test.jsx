import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import Projects from '../Projects'
import { getProjects } from '../../services/projects'

vi.mock('../../services/projects', () => ({
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
        agentStatus: 'hibernating',
        threadCount: 0,
        issueCount: 0,
        lastActivityAt: '2026-02-01T08:00:00Z',
        createdAt: '2024-01-02T00:00:00Z',
    },
]

const renderWithRoute = async (initialEntry = '/org_1/projects') => {
    vi.mocked(getProjects).mockResolvedValue(mockProjects)
    render(
        <MemoryRouter initialEntries={[initialEntry]}>
            <Routes>
                <Route path="/:orgId/projects" element={<Projects />} />
            </Routes>
        </MemoryRouter>
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

        await user.click(screen.getByRole('button', { name: 'Hibernating' }))

        expect(screen.queryByText('Site A')).not.toBeInTheDocument()
        expect(screen.getByText('Site B')).toBeInTheDocument()
    })
})
