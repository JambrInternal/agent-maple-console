import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import OrgSelection from './OrgSelection'
import { createOrganization, getOrganizations } from '../../services/organizations'

vi.mock('../../services/organizations', () => ({
  getOrganizations: vi.fn(),
  createOrganization: vi.fn(),
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  }
})

describe('OrgSelection', () => {
  it('shows create org tile and creates an organization', async () => {
    vi.mocked(getOrganizations).mockResolvedValue([])
    vi.mocked(createOrganization).mockResolvedValue({
      id: 'org_1',
      name: 'New Org',
      projectCount: 0,
      createdAt: '2026-02-01T00:00:00Z',
    })

    const user = userEvent.setup()

    const queryClient = new QueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <OrgSelection />
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(await screen.findByText('Create a New Organization')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Create a New Organization' }))
    const createDialog = await screen.findByRole('dialog', { name: 'Create Organization' })
    await user.type(within(createDialog).getByLabelText('Organization Name'), 'New Org')
    await user.click(within(createDialog).getByRole('button', { name: 'Create Organization' }))

    await waitFor(() => {
      expect(createOrganization).toHaveBeenCalledWith(expect.objectContaining({ name: 'New Org' }))
    })
  })
})
