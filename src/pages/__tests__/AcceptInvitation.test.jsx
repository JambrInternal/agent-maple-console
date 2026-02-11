import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AcceptInvitation from '../AcceptInvitation'
import { acceptInvitation } from '../../services/people'

const mockNavigate = vi.fn()
let mockAuthState = { user: null, loading: false }

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

describe('AcceptInvitation', () => {
    beforeEach(() => {
        localStorage.clear()
        vi.clearAllMocks()
        mockAuthState = { user: null, loading: false }
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
})
