import React from 'react'
import { beforeEach, describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import Voice from './Voice'
import { getProjectAgentContact } from '../../services/agentFacade'

vi.mock('../../services/agentFacade', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    getProjectAgentContact: vi.fn(),
  }
})

const renderPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/org_1/proj_1/voice']}>
        <Routes>
          <Route path="/:orgId/:projId/voice" element={<Voice />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('Voice page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders configured state with phone number', async () => {
    vi.mocked(getProjectAgentContact).mockResolvedValue({
      firstName: 'Test Project',
      phoneNumber: '+14165551234',
      source: 'tenant_twilio',
    })

    renderPage()

    expect(getProjectAgentContact).toHaveBeenCalledWith({
      organizationId: 'org_1',
      projectId: 'proj_1',
    })

    expect(await screen.findByText('+14165551234')).toBeInTheDocument()
    expect(screen.getByText('Project phone number')).toBeInTheDocument()
    expect(screen.getByText('How to use this number')).toBeInTheDocument()
    expect(screen.queryByText('Phone Session Not Configured')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument()
  })

  it('renders unconfigured state with placeholder', async () => {
    vi.mocked(getProjectAgentContact).mockResolvedValue({
      firstName: null,
      phoneNumber: null,
      source: 'unconfigured',
    })

    renderPage()

    expect(await screen.findByText('Phone Session Not Configured')).toBeInTheDocument()
    expect(screen.getByText('A phone session must be created by the backend before a number is available.')).toBeInTheDocument()
    expect(screen.queryByText('How to use this number')).not.toBeInTheDocument()
  })

  it('renders loading state', async () => {
    vi.mocked(getProjectAgentContact).mockReturnValue(new Promise(() => {}))

    renderPage()

    expect(await screen.findByText('Loading phone configuration...')).toBeInTheDocument()
  })

  it('renders error state with retry button', async () => {
    vi.mocked(getProjectAgentContact).mockRejectedValue(new Error('Network error'))

    renderPage()

    await waitFor(
      () => {
        expect(screen.queryByText('Loading phone configuration...')).not.toBeInTheDocument()
      },
      { timeout: 2000 }
    )

    expect(screen.getByText(/Failed to load phone configuration/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
  })
})
