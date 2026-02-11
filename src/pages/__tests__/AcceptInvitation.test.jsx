import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import AcceptInvitation from '../AcceptInvitation'
import { acceptInvitation } from '../../services/people'

const mockNavigate = vi.fn()
const mockLogout = vi.fn()
let mockAuthState = { user: null, loading: false, logout: mockLogout }

vi.mock('../../contexts/AuthContext', () => ({
    useAuth: () => mockAuthState,
}))

vi.mock('../../services/people', () => ({
    acceptInvitation: vi.fn(),
}))

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    }
})

// Helper to compute the hashed session storage key (matching AcceptInvitation.jsx)
const hashToken = (token) => {
    if (!token) return 'unknown'
    let hash = 0
    for (let i = 0; i < token.length; i += 1) {
        hash = (hash << 5) - hash + token.charCodeAt(i)
        hash |= 0
    }
    return Math.abs(hash).toString(36)
}
const inviteReauthKey = (token) => `am_invite_reauth_done_${hashToken(token)}`

describe('AcceptInvitation', () => {
    beforeEach(() => {
        localStorage.clear()
        sessionStorage.clear()
        vi.clearAllMocks()
        mockAuthState = { user: null, loading: false, logout: mockLogout }
    })

    it('redirects to login when user is not authenticated', async () => {
        render(
            <MemoryRouter initialEntries={['/accept-invitation?token=abc123']}>
                <AcceptInvitation />
            </MemoryRouter>
        )

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/login', {
                replace: true,
                state: {
                    from: {
                        pathname: '/accept-invitation',
                        search: '?token=abc123',
                        hash: '',
                    },
                },
            })
        })
    })

    it('accepts invitation after login and routes to invited organization', async () => {
        mockAuthState = {
            user: {
                id: 'u1',
                email: 'member@example.com',
                name: 'Member',
                role: 'member',
                organizationId: null,
                tenantId: null,
                mfaEnabled: false,
                createdAt: '2026-02-11T00:00:00Z',
            },
            loading: false,
            logout: mockLogout,
        }

        vi.mocked(acceptInvitation).mockResolvedValue({
            id: 'inv_1',
            email: 'member@example.com',
            tenantId: 'org_9',
            role: 'viewer',
            status: 'accepted',
            isUsed: true,
            createdAt: '2026-02-11T10:00:00Z',
            expiresAt: '2026-03-11T10:00:00Z',
            usedAt: '2026-02-11T10:05:00Z',
        })

        sessionStorage.setItem(inviteReauthKey('tok_1'), '1')

        render(
            <MemoryRouter initialEntries={['/accept-invitation?token=tok_1']}>
                <AcceptInvitation />
            </MemoryRouter>
        )

        expect(await screen.findByText('Invitation Accepted')).toBeInTheDocument()
        expect(screen.getByText('Redirecting you now.')).toBeInTheDocument()

        await waitFor(() => {
            expect(acceptInvitation).toHaveBeenCalledWith('tok_1')
            expect(localStorage.getItem('am_tenant_id')).toBe('org_9')
            expect(mockNavigate).toHaveBeenCalledWith('/org_9/projects', { replace: true })
        })
    })

    it('auto logs out active session before invite acceptance and redirects to login', async () => {
        mockAuthState = {
            user: {
                id: 'u-active',
                email: 'active@example.com',
                name: 'Active',
                role: 'member',
                organizationId: null,
                tenantId: null,
                mfaEnabled: false,
                createdAt: '2026-02-11T00:00:00Z',
            },
            loading: false,
            logout: mockLogout,
        }

        render(
            <MemoryRouter initialEntries={['/accept-invitation?token=tok_force']}>
                <AcceptInvitation />
            </MemoryRouter>
        )

        await waitFor(() => {
            expect(mockLogout).toHaveBeenCalledTimes(1)
            expect(mockNavigate).toHaveBeenCalledWith('/login', {
                replace: true,
                state: {
                    from: {
                        pathname: '/accept-invitation',
                        search: '?token=tok_force',
                        hash: '',
                    },
                },
            })
            expect(acceptInvitation).not.toHaveBeenCalled()
        })
    })

    it('shows an error when token is missing', async () => {
        render(
            <MemoryRouter initialEntries={['/accept-invitation']}>
                <AcceptInvitation />
            </MemoryRouter>
        )

        expect(await screen.findByText('Invitation Could Not Be Accepted')).toBeInTheDocument()
        expect(screen.getByText(/Invitation token is missing/i)).toBeInTheDocument()
        expect(acceptInvitation).not.toHaveBeenCalled()
    })

    it('handles email mismatch by offering sign out and continuing to login', async () => {
        mockAuthState = {
            user: {
                id: 'u-admin',
                email: 'jeremy@jambr.ca',
                name: 'Jeremy',
                role: 'admin',
                organizationId: null,
                tenantId: null,
                mfaEnabled: false,
                createdAt: '2026-02-11T00:00:00Z',
            },
            loading: false,
            logout: mockLogout,
        }

        vi.mocked(acceptInvitation).mockRejectedValue(
            new Error('User email does not match invitation email')
        )
        sessionStorage.setItem(inviteReauthKey('tok_mismatch'), '1')

        const user = userEvent.setup()

        render(
            <MemoryRouter initialEntries={['/accept-invitation?token=tok_mismatch']}>
                <AcceptInvitation />
            </MemoryRouter>
        )

        expect(await screen.findByText('Invitation Could Not Be Accepted')).toBeInTheDocument()
        expect(screen.getByText(/You are signed in as jeremy@jambr.ca/i)).toBeInTheDocument()

        const signOutButton = await screen.findByRole('button', { name: 'Sign Out & Continue' })
        await user.click(signOutButton)

        await waitFor(() => {
            expect(mockLogout).toHaveBeenCalledTimes(1)
            expect(mockNavigate).toHaveBeenCalledWith('/login', {
                replace: true,
                state: {
                    from: {
                        pathname: '/accept-invitation',
                        search: '?token=tok_mismatch',
                        hash: '',
                    },
                },
            })
        })
    })

    it('handles email mismatch error from ApiError with details.detail[0].msg shape', async () => {
        mockAuthState = {
            user: {
                id: 'u-test',
                email: 'wrong@example.com',
                name: 'Test User',
                role: 'member',
                organizationId: null,
                tenantId: null,
                mfaEnabled: false,
                createdAt: '2026-02-11T00:00:00Z',
            },
            loading: false,
            logout: mockLogout,
        }

        // Simulate ApiError with nested detail array shape
        const apiError = new Error('Validation failed')
        apiError.details = {
            detail: [
                { msg: 'invitation_email_mismatch: Email does not match invitation email' }
            ]
        }

        vi.mocked(acceptInvitation).mockRejectedValue(apiError)
        sessionStorage.setItem(inviteReauthKey('tok_api_err'), '1')

        const user = userEvent.setup()

        render(
            <MemoryRouter initialEntries={['/accept-invitation?token=tok_api_err']}>
                <AcceptInvitation />
            </MemoryRouter>
        )

        expect(await screen.findByText('Invitation Could Not Be Accepted')).toBeInTheDocument()
        expect(screen.getByText(/You are signed in as wrong@example.com/i)).toBeInTheDocument()

        const signOutButton = await screen.findByRole('button', { name: 'Sign Out & Continue' })
        expect(signOutButton).toBeInTheDocument()
    })
})
