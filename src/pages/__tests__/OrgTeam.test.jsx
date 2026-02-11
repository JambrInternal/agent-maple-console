import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import OrgTeam from '../OrgTeam'
import { getUsers, inviteUser } from '../../services/people'

vi.mock('../../services/people', () => ({
    getUsers: vi.fn(),
    inviteUser: vi.fn(),
}))

describe('OrgTeam', () => {
    beforeEach(() => {
        localStorage.clear()
        vi.clearAllMocks()
    })

    it('shows invited users in the team table with merged role/status and invite actions menu', async () => {
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
        expect(screen.getByRole('columnheader', { name: 'Role' })).toBeInTheDocument()
        expect(screen.queryByRole('columnheader', { name: 'MFA Status' })).not.toBeInTheDocument()
        expect(screen.queryByRole('columnheader', { name: 'Invite Status' })).not.toBeInTheDocument()
        expect(screen.queryByRole('columnheader', { name: 'Actions' })).not.toBeInTheDocument()

        await user.click(screen.getByRole('button', { name: 'Invite Member' }))
        await user.type(screen.getByLabelText('Email Address'), 'invitee@example.com')
        await user.click(screen.getByRole('button', { name: 'Send Invitation' }))

        await screen.findAllByText('invitee@example.com')
        const invitedRow = screen.getAllByRole('row').find(
            (row) => within(row).queryAllByText('invitee@example.com').length > 0
        )
        expect(invitedRow).not.toBeNull()
        expect(within(invitedRow).getByText('Invited')).toBeInTheDocument()
        expect(within(invitedRow).getByLabelText('Invite status pending')).toBeInTheDocument()
        expect(within(invitedRow).getByRole('button', { name: 'Invite actions for invitee@example.com' })).toBeInTheDocument()

        expect(getUsers).toHaveBeenCalledWith('org_1')
        expect(inviteUser).toHaveBeenCalledWith('invitee@example.com', 'org_1')
    })

    it('recomputes invite status from localStorage when invite has expired', async () => {
        vi.mocked(getUsers).mockResolvedValue([])

        // Simulate an invite that was saved as 'pending' but has now expired
        const expiredDate = new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
        const storedInvite = {
            id: 'invite_expired',
            email: 'expired@example.com',
            role: 'member',
            status: 'pending', // Stored as pending
            isUsed: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(), // 30 days ago
            expiresAt: expiredDate.toISOString(), // Expired
            usedAt: null,
        }

        localStorage.setItem('am_pending_team_invites_org_1', JSON.stringify([storedInvite]))

        const queryClient = new QueryClient()

        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={['/org_1/team']}>
                    <Routes>
                        <Route path="/:orgId/team" element={<OrgTeam />} />
                    </Routes>
                </MemoryRouter>
            </QueryClientProvider>
        )

        await screen.findAllByText('expired@example.com')
        const invitedRow = screen.getAllByRole('row').find(
            (row) => within(row).queryAllByText('expired@example.com').length > 0
        )
        
        expect(invitedRow).not.toBeNull()
        expect(within(invitedRow).getByLabelText('Invite status expired')).toBeInTheDocument()
        expect(within(invitedRow).getByText('Invited')).toBeInTheDocument()
    })

    it('recomputes invite status from localStorage when invite has been used', async () => {
        vi.mocked(getUsers).mockResolvedValue([])

        // Simulate an invite that was saved as 'pending' but has been used
        const storedInvite = {
            id: 'invite_used',
            email: 'used@example.com',
            role: 'member',
            status: 'pending', // Stored as pending
            isUsed: true, // But has been used
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 25).toISOString(), // Still valid
            usedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // Used 1 day ago
        }

        localStorage.setItem('am_pending_team_invites_org_1', JSON.stringify([storedInvite]))

        const queryClient = new QueryClient()

        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={['/org_1/team']}>
                    <Routes>
                        <Route path="/:orgId/team" element={<OrgTeam />} />
                    </Routes>
                </MemoryRouter>
            </QueryClientProvider>
        )

        await screen.findAllByText('used@example.com')
        const invitedRow = screen.getAllByRole('row').find(
            (row) => within(row).queryAllByText('used@example.com').length > 0
        )
        
        expect(invitedRow).not.toBeNull()
        expect(within(invitedRow).getByLabelText('Invite status accepted')).toBeInTheDocument()
        expect(within(invitedRow).getByText('member')).toBeInTheDocument()
        expect(within(invitedRow).queryByRole('button', { name: 'Invite actions for used@example.com' })).not.toBeInTheDocument()
    })

    it('resends pending invites from the row menu', async () => {
        vi.mocked(getUsers).mockResolvedValue([])
        vi.mocked(inviteUser).mockResolvedValue({
            id: 'invite_resend_2',
            email: 'resend@example.com',
            role: 'member',
            status: 'pending',
            isUsed: false,
            createdAt: '2026-02-12T00:00:00Z',
            expiresAt: '2026-03-12T00:00:00Z',
            usedAt: null,
        })

        localStorage.setItem('am_pending_team_invites_org_1', JSON.stringify([{
            id: 'invite_resend_1',
            email: 'resend@example.com',
            role: 'member',
            status: 'pending',
            isUsed: false,
            createdAt: '2026-02-11T00:00:00Z',
            expiresAt: '2026-03-11T00:00:00Z',
            usedAt: null,
        }]))

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

        await screen.findByRole('button', { name: 'Invite actions for resend@example.com' })
        await user.click(screen.getByRole('button', { name: 'Invite actions for resend@example.com' }))
        await user.click(screen.getByRole('menuitem', { name: 'Resend invite' }))

        expect(inviteUser).toHaveBeenCalledWith('resend@example.com', 'org_1')
        await waitFor(() => {
            const storage = JSON.parse(localStorage.getItem('am_pending_team_invites_org_1'))
            expect(storage).toHaveLength(1)
            expect(storage[0].id).toBe('invite_resend_2')
        })
    })

    it('cancels pending invites from the row menu', async () => {
        vi.mocked(getUsers).mockResolvedValue([])
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)

        localStorage.setItem('am_pending_team_invites_org_1', JSON.stringify([{
            id: 'invite_cancel_1',
            email: 'cancel@example.com',
            role: 'member',
            status: 'pending',
            isUsed: false,
            createdAt: '2026-02-11T00:00:00Z',
            expiresAt: '2026-03-11T00:00:00Z',
            usedAt: null,
        }]))

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

        await screen.findByRole('button', { name: 'Invite actions for cancel@example.com' })
        await user.click(screen.getByRole('button', { name: 'Invite actions for cancel@example.com' }))
        await user.click(screen.getByRole('menuitem', { name: 'Cancel invite' }))

        expect(confirmSpy).toHaveBeenCalledWith('Cancel invitation for cancel@example.com?')
        await waitFor(() => {
            expect(screen.queryByText('cancel@example.com')).not.toBeInTheDocument()
        })
        await waitFor(() => {
            const storage = JSON.parse(localStorage.getItem('am_pending_team_invites_org_1'))
            expect(storage).toEqual([])
        })

        confirmSpy.mockRestore()
    })

    it('prevents cross-org invite state leaks when orgId changes', async () => {
        vi.mocked(getUsers).mockResolvedValue([])

        // Set up invites for org_1
        const org1Invite = {
            id: 'invite_org1',
            email: 'org1-user@example.com',
            role: 'member',
            status: 'pending',
            isUsed: false,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
            usedAt: null,
        }
        localStorage.setItem('am_pending_team_invites_org_1', JSON.stringify([org1Invite]))

        // Set up invites for org_2
        const org2Invite = {
            id: 'invite_org2',
            email: 'org2-user@example.com',
            role: 'member',
            status: 'pending',
            isUsed: false,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
            usedAt: null,
        }
        localStorage.setItem('am_pending_team_invites_org_2', JSON.stringify([org2Invite]))

        const queryClient = new QueryClient()

        // Render with org_1
        const { unmount } = render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={['/org_1/team']}>
                    <Routes>
                        <Route path="/:orgId/team" element={<OrgTeam />} />
                    </Routes>
                </MemoryRouter>
            </QueryClientProvider>
        )

        // Verify org_1 invite is shown
        await screen.findAllByText('org1-user@example.com')
        expect(screen.queryByText('org2-user@example.com')).not.toBeInTheDocument()

        // Unmount the component
        unmount()

        // Now render with org_2
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={['/org_2/team']}>
                    <Routes>
                        <Route path="/:orgId/team" element={<OrgTeam />} />
                    </Routes>
                </MemoryRouter>
            </QueryClientProvider>
        )

        // Verify org_2 invite is shown and org_1 invite is not
        await screen.findAllByText('org2-user@example.com')
        expect(screen.queryByText('org1-user@example.com')).not.toBeInTheDocument()

        // Verify localStorage was not corrupted - org_2 should still have only its invite
        const org2Storage = JSON.parse(localStorage.getItem('am_pending_team_invites_org_2'))
        expect(org2Storage).toHaveLength(1)
        expect(org2Storage[0].email).toBe('org2-user@example.com')

        // Verify org_1 storage was not overwritten
        const org1Storage = JSON.parse(localStorage.getItem('am_pending_team_invites_org_1'))
        expect(org1Storage).toHaveLength(1)
        expect(org1Storage[0].email).toBe('org1-user@example.com')
    })
})
