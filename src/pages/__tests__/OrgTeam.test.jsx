import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import OrgTeam from '../OrgTeam'
import { getUsers, inviteUser, removeUser } from '../../services/people'

vi.mock('../../services/people', () => ({
    getUsers: vi.fn(),
    inviteUser: vi.fn(),
    removeUser: vi.fn(),
}))

describe('OrgTeam', () => {
    beforeEach(() => {
        localStorage.clear()
        vi.clearAllMocks()
    })

    it('shows invited users in the team table with pending invite status', async () => {
        vi.mocked(getUsers).mockResolvedValue([
            {
                id: 'user_1',
                email: 'member@example.com',
                name: 'Member One',
                role: 'member',
                organizationId: null,
                tenantId: 'org_1',
                mfaEnabled: true,
                createdAt: '2026-02-01T00:00:00Z',
            },
        ])

        vi.mocked(inviteUser).mockResolvedValue({
            id: 'invite_1',
            email: 'invitee@example.com',
            role: 'member',
            status: 'pending',
            isUsed: false,
            createdAt: '2026-02-11T00:00:00Z',
            expiresAt: '2026-03-11T00:00:00Z',
            usedAt: null,
        })

        const queryClient = new QueryClient()
        const user = userEvent.setup()

        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={['/org_1/team']}>
                    <Routes>
                        <Route path="/:orgId/team" element={<OrgTeam />} />
                    </Routes>
                </MemoryRouter>
            </QueryClientProvider>
        )

        expect(await screen.findByText('Member One')).toBeInTheDocument()
        expect(screen.getByText('Active')).toBeInTheDocument()

        await user.click(screen.getByRole('button', { name: 'Invite Member' }))
        await user.type(screen.getByLabelText('Email Address'), 'invitee@example.com')
        await user.click(screen.getByRole('button', { name: 'Send Invitation' }))

        await screen.findAllByText('invitee@example.com')
        const invitedRow = screen.getAllByRole('row').find(
            (row) => within(row).queryAllByText('invitee@example.com').length > 0
        )
        expect(invitedRow).not.toBeNull()
        expect(within(invitedRow).queryAllByText('Pending').length).toBeGreaterThan(0)
        expect(within(invitedRow).getByText('N/A')).toBeInTheDocument()

        expect(getUsers).toHaveBeenCalledWith('org_1')
        expect(inviteUser).toHaveBeenCalledWith('invitee@example.com', 'org_1')
        expect(removeUser).not.toHaveBeenCalled()
    })
})
