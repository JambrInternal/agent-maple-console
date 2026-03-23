import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import Projects from './Projects'
import { createProject, getProjects } from '../../services/projects'
import { saveProjectPersonalityTemplate, DEFAULT_PROJECT_PERSONALITY_TEMPLATE } from '../../services/agentFacade'

vi.mock('../../services/projects', () => ({
  createProject: vi.fn(),
  getProjects: vi.fn(),
  updateProjectStatus: vi.fn(),
}))

vi.mock('../../services/agentFacade', () => ({
  saveProjectPersonalityTemplate: vi.fn().mockResolvedValue({}),
  DEFAULT_PROJECT_PERSONALITY_TEMPLATE: {
    templateType: 'PARAMETERIZED',
    userRole: 'on-site manager/worker',
    conversationType: 'Construction support chat',
    aiRole: 'Construction Support Manager',
    aiRoleCharacteristics: ['Kind', 'Active Listening'],
    aiRoleEmotionalTone: ['calm'],
    aiRoleDialogueStrategy: ['informative and helpful'],
    aiRoleConstraints: ['Do not repeat greetings'],
    contextContent: 'Always use tools to query the internal database first *silently* before answering every question. Do not mention it in reply.',
    goals: ['Evaluate user performance in conversation'],
    evaluationCriteria: ['Active Listening', 'Product Knowledge'],
    isDefault: true,
    runnerInstructions: '',
    agentInstructions: '',
  },
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

  it('auto-creates a default personality template after project creation', async () => {
    const user = userEvent.setup()
    vi.mocked(createProject).mockResolvedValue({
      id: 'proj_new',
      organizationId: 'org_1',
      name: 'Fresh Project',
      agentStatus: 'offline',
      threadCount: 0,
      issueCount: 0,
      lastActivityAt: '2026-02-06T08:00:00Z',
      createdAt: '2026-02-06T08:00:00Z',
    })

    await renderWithRoute({ projects: [] })
    await screen.findByText('No projects match your filters.')

    await user.click(screen.getByRole('button', { name: 'Launch Project' }))
    await user.type(screen.getByLabelText('Project Name'), 'Fresh Project')
    await user.click(screen.getByRole('button', { name: 'Create Project' }))

    expect(createProject).toHaveBeenCalledWith('org_1', 'Fresh Project')
    expect(saveProjectPersonalityTemplate).toHaveBeenCalledWith(
      { organizationId: 'org_1', projectId: 'proj_new' },
      DEFAULT_PROJECT_PERSONALITY_TEMPLATE
    )
  })

  it('still completes project creation if personality template creation fails', async () => {
    const user = userEvent.setup()
    vi.mocked(createProject).mockResolvedValue({
      id: 'proj_fail',
      organizationId: 'org_1',
      name: 'Resilient Project',
      agentStatus: 'offline',
      threadCount: 0,
      issueCount: 0,
      lastActivityAt: '2026-02-06T08:00:00Z',
      createdAt: '2026-02-06T08:00:00Z',
    })
    vi.mocked(saveProjectPersonalityTemplate).mockRejectedValue(new Error('Template API down'))

    await renderWithRoute({ projects: [] })
    await screen.findByText('No projects match your filters.')

    await user.click(screen.getByRole('button', { name: 'Launch Project' }))
    await user.type(screen.getByLabelText('Project Name'), 'Resilient Project')
    await user.click(screen.getByRole('button', { name: 'Create Project' }))

    expect(createProject).toHaveBeenCalledWith('org_1', 'Resilient Project')
    expect(saveProjectPersonalityTemplate).toHaveBeenCalled()
  })
})
