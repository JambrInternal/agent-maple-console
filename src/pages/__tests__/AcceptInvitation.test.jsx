import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import AcceptInvitation from '../AcceptInvitation'
import { acceptInvitation } from '../../services/people'

const mockNavigate = vi.fn()
const mockLogin = vi.fn()
const mockRegister = vi.fn()
const mockConfirmRegistration = vi.fn()
const mockLogout = vi.fn()
let mockAuthState = {
    user: null,
    loading: false,
    login: mockLogin,
    register: mockRegister,
    confirmRegistration: mockConfirmRegistration,
    logout: mockLogout,
}

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
        sessionStorage.clear()
        vi.clearAllMocks()
        mockAuthState = {
            user: null,
            loading: false,
            login: mockLogin,
            register: mockRegister,
            confirmRegistration: mockConfirmRegistration,
            logout: mockLogout,
        }
        document.documentElement.dataset.theme = 'dark'
    })

    it('renders single invite auth screen for unauthenticated users', async () => {
        render(
            <MemoryRouter initialEntries={['/accept-invitation?token=tok_1&email=invitee%40example.com']}>
                <AcceptInvitation />
            </MemoryRouter>
        )

        expect(await screen.findByText('Accept Invitation')).toBeInTheDocument()
        expect(screen.getByText('invitee@example.com')).toBeInTheDocument()
        expect(screen.getByLabelText('Password')).toBeInTheDocument()
        expect(mockNavigate).not.toHaveBeenCalled()
    })

    it('uses light theme while in super admin mode', async () => {
        localStorage.setItem('am_admin_mode', 'true')

        render(
            <MemoryRouter initialEntries={['/accept-invitation?token=tok_theme&email=invitee%40example.com']}>
                <AcceptInvitation />
            </MemoryRouter>
        )

        await waitFor(() => {
            expect(document.documentElement.dataset.theme).toBe('light')
        })
    })

    it('auto-accepts invitation for already-authenticated invited session', async () => {
        mockAuthState = {
            user: {
                id: 'u1',
                email: 'invitee@example.com',
                name: 'Invitee',
                role: 'member',
                organizationId: null,
                tenantId: null,
                mfaEnabled: false,
                createdAt: '2026-02-11T00:00:00Z',
            },
            loading: false,
            login: mockLogin,
            register: mockRegister,
            confirmRegistration: mockConfirmRegistration,
            logout: mockLogout,
        }

        vi.mocked(acceptInvitation).mockResolvedValue({
            id: 'inv_1',
            email: 'invitee@example.com',
            tenantId: 'org_9',
            role: 'viewer',
            status: 'accepted',
            isUsed: true,
            createdAt: '2026-02-11T10:00:00Z',
            expiresAt: '2026-03-11T10:00:00Z',
            usedAt: '2026-02-11T10:05:00Z',
        })

        render(
            <MemoryRouter initialEntries={['/accept-invitation?token=tok_1&email=invitee%40example.com']}>
                <AcceptInvitation />
            </MemoryRouter>
        )

        expect(await screen.findByText('Invitation Accepted')).toBeInTheDocument()
        await waitFor(() => {
            expect(acceptInvitation).toHaveBeenCalledWith('tok_1')
            expect(localStorage.getItem('am_tenant_id')).toBe('org_9')
            expect(mockNavigate).toHaveBeenCalledWith('/org_9/projects', { replace: true })
        })
    })

    it('signs in existing invited user and accepts invitation from same screen', async () => {
        const user = userEvent.setup()
        mockLogin.mockResolvedValue({
            id: 'u2',
            email: 'invitee@example.com',
        })
        vi.mocked(acceptInvitation).mockResolvedValue({
            id: 'inv_2',
            email: 'invitee@example.com',
            tenantId: 'org_10',
            role: 'viewer',
            status: 'accepted',
            isUsed: true,
            createdAt: '2026-02-11T10:00:00Z',
            expiresAt: '2026-03-11T10:00:00Z',
            usedAt: '2026-02-11T10:05:00Z',
        })

        render(
            <MemoryRouter initialEntries={['/accept-invitation?token=tok_existing&email=invitee%40example.com']}>
                <AcceptInvitation />
            </MemoryRouter>
        )

        await user.type(await screen.findByLabelText('Password'), 'Password123!')
        await user.click(screen.getByRole('button', { name: 'Continue' }))

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith('invitee@example.com', 'Password123!')
            expect(acceptInvitation).toHaveBeenCalledWith('tok_existing')
            expect(mockNavigate).toHaveBeenCalledWith('/org_10/projects', { replace: true })
        })
    })

    it('creates password when account does not exist, then accepts invitation', async () => {
        const user = userEvent.setup()
        const notFoundError = new Error('User does not exist')
        notFoundError.name = 'UserNotFoundException'

        mockLogin
            .mockRejectedValueOnce(notFoundError)
            .mockResolvedValueOnce({ id: 'u3', email: 'invitee@example.com' })
        mockRegister.mockResolvedValue({
            isComplete: true,
            nextStep: 'DONE',
            codeDeliveryDestination: null,
            codeDeliveryMedium: null,
        })
        vi.mocked(acceptInvitation).mockResolvedValue({
            id: 'inv_3',
            email: 'invitee@example.com',
            tenantId: 'org_11',
            role: 'viewer',
            status: 'accepted',
            isUsed: true,
            createdAt: '2026-02-11T10:00:00Z',
            expiresAt: '2026-03-11T10:00:00Z',
            usedAt: '2026-02-11T10:05:00Z',
        })

        render(
            <MemoryRouter initialEntries={['/accept-invitation?token=tok_create&email=invitee%40example.com']}>
                <AcceptInvitation />
            </MemoryRouter>
        )

        await user.type(await screen.findByLabelText('Password'), 'CreatePass123!')
        await user.click(screen.getByRole('button', { name: 'Continue' }))

        await waitFor(() => {
            expect(mockLogin).toHaveBeenNthCalledWith(1, 'invitee@example.com', 'CreatePass123!')
            expect(mockRegister).toHaveBeenCalledWith('invitee@example.com', 'CreatePass123!')
            expect(mockLogin).toHaveBeenNthCalledWith(2, 'invitee@example.com', 'CreatePass123!')
            expect(acceptInvitation).toHaveBeenCalledWith('tok_create')
            expect(mockNavigate).toHaveBeenCalledWith('/org_11/projects', { replace: true })
        })
    })

    it('collects confirmation code on same screen when registration needs confirmation', async () => {
        const user = userEvent.setup()
        const notFoundError = new Error('User does not exist')
        notFoundError.name = 'UserNotFoundException'

        mockLogin
            .mockRejectedValueOnce(notFoundError)
            .mockResolvedValueOnce({ id: 'u4', email: 'invitee@example.com' })
        mockRegister.mockResolvedValue({
            isComplete: false,
            nextStep: 'CONFIRM_SIGN_UP',
            codeDeliveryDestination: 'invitee@example.com',
            codeDeliveryMedium: 'EMAIL',
        })
        mockConfirmRegistration.mockResolvedValue(undefined)
        vi.mocked(acceptInvitation).mockResolvedValue({
            id: 'inv_4',
            email: 'invitee@example.com',
            tenantId: 'org_12',
            role: 'viewer',
            status: 'accepted',
            isUsed: true,
            createdAt: '2026-02-11T10:00:00Z',
            expiresAt: '2026-03-11T10:00:00Z',
            usedAt: '2026-02-11T10:05:00Z',
        })

        render(
            <MemoryRouter initialEntries={['/accept-invitation?token=tok_confirm&email=invitee%40example.com']}>
                <AcceptInvitation />
            </MemoryRouter>
        )

        await user.type(await screen.findByLabelText('Password'), 'ConfirmPass123!')
        await user.click(screen.getByRole('button', { name: 'Continue' }))

        expect(await screen.findByLabelText('Confirmation Code')).toBeInTheDocument()
        expect(screen.getByText(/Account created\. Enter the confirmation code/i)).toBeInTheDocument()

        await user.type(screen.getByLabelText('Confirmation Code'), '654321')
        await user.click(screen.getByRole('button', { name: 'Confirm & Continue' }))

        await waitFor(() => {
            expect(mockConfirmRegistration).toHaveBeenCalledWith('invitee@example.com', '654321')
            expect(mockLogin).toHaveBeenNthCalledWith(2, 'invitee@example.com', 'ConfirmPass123!')
            expect(acceptInvitation).toHaveBeenCalledWith('tok_confirm')
            expect(mockNavigate).toHaveBeenCalledWith('/org_12/projects', { replace: true })
        })
    })

    it('logs out mismatched active session and keeps flow on invite screen', async () => {
        mockAuthState = {
            user: {
                id: 'u_wrong',
                email: 'wrong@example.com',
                name: 'Wrong',
                role: 'member',
                organizationId: null,
                tenantId: null,
                mfaEnabled: false,
                createdAt: '2026-02-11T00:00:00Z',
            },
            loading: false,
            login: mockLogin,
            register: mockRegister,
            confirmRegistration: mockConfirmRegistration,
            logout: mockLogout,
        }

        vi.mocked(acceptInvitation).mockRejectedValue(
            new Error('User email does not match invitation email')
        )

        render(
            <MemoryRouter initialEntries={['/accept-invitation?token=tok_mismatch&email=invitee%40example.com']}>
                <AcceptInvitation />
            </MemoryRouter>
        )

        expect(await screen.findByText('Accept Invitation')).toBeInTheDocument()
        await waitFor(() => {
            expect(mockLogout).toHaveBeenCalledTimes(1)
        })
        expect(screen.getByText(/This invite is for invitee@example.com/i)).toBeInTheDocument()
        expect(mockNavigate).not.toHaveBeenCalled()
    })

    it('shows an error when invitation token is missing', async () => {
        render(
            <MemoryRouter initialEntries={['/accept-invitation?email=invitee%40example.com']}>
                <AcceptInvitation />
            </MemoryRouter>
        )

        expect(await screen.findByText('Invitation Could Not Be Accepted')).toBeInTheDocument()
        expect(screen.getByText(/Invitation token is missing/i)).toBeInTheDocument()
    })

    it('shows an error when invitation email is missing', async () => {
        render(
            <MemoryRouter initialEntries={['/accept-invitation?token=tok_no_email']}>
                <AcceptInvitation />
            </MemoryRouter>
        )

        expect(await screen.findByText('Invitation Could Not Be Accepted')).toBeInTheDocument()
        expect(screen.getByText(/Invitation email is missing/i)).toBeInTheDocument()
    })
})
