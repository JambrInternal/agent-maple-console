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
const mockResendConfirmationCode = vi.fn()
let mockAuthState = {
    user: null,
    loading: false,
    login: mockLogin,
    register: mockRegister,
    confirmRegistration: mockConfirmRegistration,
    logout: mockLogout,
    resendConfirmationCode: mockResendConfirmationCode,
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
        vi.mocked(acceptInvitation).mockReset()
        mockAuthState = {
            user: null,
            loading: false,
            login: mockLogin,
            register: mockRegister,
            confirmRegistration: mockConfirmRegistration,
            logout: mockLogout,
            resendConfirmationCode: mockResendConfirmationCode,
        }
        document.documentElement.dataset.theme = 'dark'
    })

    it('renders single invite auth screen with editable email and password', async () => {
        render(
            <MemoryRouter initialEntries={['/accept-invitation?token=tok_1&email=invitee%40example.com']}>
                <AcceptInvitation />
            </MemoryRouter>
        )

        expect(await screen.findByText('Accept Invitation')).toBeInTheDocument()
        expect(screen.getByLabelText('Email')).toHaveValue('invitee@example.com')
        expect(screen.getByLabelText('First Name')).toBeInTheDocument()
        expect(screen.getByLabelText('Last Name')).toBeInTheDocument()
        expect(screen.getByLabelText('Password')).toBeInTheDocument()
        expect(mockNavigate).not.toHaveBeenCalled()
    })

    it('uses light theme while in super admin mode', async () => {
        localStorage.setItem('am_admin_mode', 'true')

        render(
            <MemoryRouter initialEntries={['/accept-invitation?token=tok_theme']}>
                <AcceptInvitation />
            </MemoryRouter>
        )

        await waitFor(() => {
            expect(document.documentElement.dataset.theme).toBe('light')
        })
    })

    it('signs in existing user and accepts invitation from same screen', async () => {
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
            <MemoryRouter initialEntries={['/accept-invitation?token=tok_create']}>
                <AcceptInvitation />
            </MemoryRouter>
        )

        await user.type(await screen.findByLabelText('Email'), 'invitee@example.com')
        await user.type(screen.getByLabelText('First Name'), 'Invitee')
        await user.type(screen.getByLabelText('Last Name'), 'Example')
        await user.type(screen.getByLabelText('Password'), 'CreatePass123!')
        await user.click(screen.getByRole('button', { name: 'Continue' }))

        await waitFor(() => {
            expect(mockLogin).toHaveBeenNthCalledWith(1, 'invitee@example.com', 'CreatePass123!')
            expect(mockRegister).toHaveBeenCalledWith('invitee@example.com', 'CreatePass123!', {
                givenName: 'Invitee',
                familyName: 'Example',
            })
            expect(mockLogin).toHaveBeenNthCalledWith(2, 'invitee@example.com', 'CreatePass123!')
            expect(acceptInvitation).toHaveBeenCalledWith('tok_create')
            expect(mockNavigate).toHaveBeenCalledWith('/org_11/projects', { replace: true })
        })
    })

    it('creates account when sign-in returns NotAuthorizedException for a non-existent user', async () => {
        const user = userEvent.setup()
        const notAuthorizedError = new Error('Incorrect username or password.')
        notAuthorizedError.name = 'NotAuthorizedException'

        mockLogin
            .mockRejectedValueOnce(notAuthorizedError)
            .mockResolvedValueOnce({ id: 'u3b', email: 'invitee@example.com' })
        mockRegister.mockResolvedValue({
            isComplete: true,
            nextStep: 'DONE',
            codeDeliveryDestination: null,
            codeDeliveryMedium: null,
        })
        vi.mocked(acceptInvitation).mockResolvedValue({
            id: 'inv_3b',
            email: 'invitee@example.com',
            tenantId: 'org_11b',
            role: 'viewer',
            status: 'accepted',
            isUsed: true,
            createdAt: '2026-02-11T10:00:00Z',
            expiresAt: '2026-03-11T10:00:00Z',
            usedAt: '2026-02-11T10:05:00Z',
        })

        render(
            <MemoryRouter initialEntries={['/accept-invitation?token=tok_masked']}>
                <AcceptInvitation />
            </MemoryRouter>
        )

        await user.type(await screen.findByLabelText('Email'), 'invitee@example.com')
        await user.type(screen.getByLabelText('First Name'), 'Invitee')
        await user.type(screen.getByLabelText('Last Name'), 'Masked')
        await user.type(screen.getByLabelText('Password'), 'CreatePass123!')
        await user.click(screen.getByRole('button', { name: 'Continue' }))

        await waitFor(() => {
            expect(mockLogin).toHaveBeenNthCalledWith(1, 'invitee@example.com', 'CreatePass123!')
            expect(mockRegister).toHaveBeenCalledWith('invitee@example.com', 'CreatePass123!', {
                givenName: 'Invitee',
                familyName: 'Masked',
            })
            expect(mockLogin).toHaveBeenNthCalledWith(2, 'invitee@example.com', 'CreatePass123!')
            expect(acceptInvitation).toHaveBeenCalledWith('tok_masked')
            expect(mockNavigate).toHaveBeenCalledWith('/org_11b/projects', { replace: true })
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
            <MemoryRouter initialEntries={['/accept-invitation?token=tok_confirm']}>
                <AcceptInvitation />
            </MemoryRouter>
        )

        await user.type(await screen.findByLabelText('Email'), 'invitee@example.com')
        await user.type(screen.getByLabelText('First Name'), 'Invitee')
        await user.type(screen.getByLabelText('Last Name'), 'Confirm')
        await user.type(screen.getByLabelText('Password'), 'ConfirmPass123!')
        await user.click(screen.getByRole('button', { name: 'Continue' }))

        expect(await screen.findByLabelText('Confirmation Code')).toBeInTheDocument()
        expect(screen.getByText(/Account created\. Enter the confirmation code/i)).toBeInTheDocument()
        expect(screen.getByLabelText('Email')).toBeDisabled()
        expect(screen.getByLabelText('First Name')).toBeDisabled()
        expect(screen.getByLabelText('Last Name')).toBeDisabled()

        await user.type(screen.getByLabelText('Confirmation Code'), '654321')
        await user.click(screen.getByRole('button', { name: 'Confirm & Continue' }))

        await waitFor(() => {
            expect(mockConfirmRegistration).toHaveBeenCalledWith('invitee@example.com', '654321')
            expect(mockLogin).toHaveBeenNthCalledWith(2, 'invitee@example.com', 'ConfirmPass123!')
            expect(acceptInvitation).toHaveBeenCalledWith('tok_confirm')
            expect(mockNavigate).toHaveBeenCalledWith('/org_12/projects', { replace: true })
        })
    })

    it('requires first and last name before creating an invited account', async () => {
        const user = userEvent.setup()
        const notFoundError = new Error('User does not exist')
        notFoundError.name = 'UserNotFoundException'
        mockLogin.mockRejectedValueOnce(notFoundError)

        render(
            <MemoryRouter initialEntries={['/accept-invitation?token=tok_missing_names']}>
                <AcceptInvitation />
            </MemoryRouter>
        )

        await user.type(await screen.findByLabelText('Email'), 'invitee@example.com')
        await user.type(screen.getByLabelText('Password'), 'CreatePass123!')
        await user.click(screen.getByRole('button', { name: 'Continue' }))

        expect(await screen.findByText('First name is required to create your account')).toBeInTheDocument()
        expect(mockRegister).not.toHaveBeenCalled()
    })

    it('shows invitation email mismatch as inline validation error', async () => {
        const user = userEvent.setup()
        mockLogin.mockResolvedValue({ id: 'u5', email: 'wrong@example.com' })
        vi.mocked(acceptInvitation).mockRejectedValue(
            new Error('User email does not match invitation email')
        )

        render(
            <MemoryRouter initialEntries={['/accept-invitation?token=tok_mismatch']}>
                <AcceptInvitation />
            </MemoryRouter>
        )

        await user.type(await screen.findByLabelText('Email'), 'wrong@example.com')
        await user.type(screen.getByLabelText('Password'), 'Password123!')
        await user.click(screen.getByRole('button', { name: 'Continue' }))

        expect(await screen.findByText(/Failed to accept invitation/i)).toBeInTheDocument()
        expect(screen.getByText(/User email does not match invitation email/i)).toBeInTheDocument()
        expect(mockLogout).toHaveBeenCalledTimes(1)
        expect(mockNavigate).not.toHaveBeenCalled()
    })

    it('logs out existing session and keeps user on invite auth screen', async () => {
        vi.mocked(acceptInvitation).mockRejectedValue(
            new Error('User email does not match invitation email')
        )

        mockAuthState = {
            user: {
                id: 'u_existing',
                email: 'existing@example.com',
                name: 'Existing',
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

        render(
            <MemoryRouter initialEntries={['/accept-invitation?token=tok_existing_session&email=invitee%40example.com']}>
                <AcceptInvitation />
            </MemoryRouter>
        )

        expect(await screen.findByText('Accept Invitation')).toBeInTheDocument()
        await waitFor(() => {
            expect(mockLogout).toHaveBeenCalledTimes(1)
        })
        expect(screen.getByLabelText('Email')).toHaveValue('invitee@example.com')
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

    it('shows resend button only in confirm mode', async () => {
        const user = userEvent.setup()
        const notFoundError = new Error('User does not exist')
        notFoundError.name = 'UserNotFoundException'

        mockLogin.mockRejectedValueOnce(notFoundError)
        mockRegister.mockResolvedValue({
            isComplete: false,
            nextStep: 'CONFIRM_SIGN_UP',
            codeDeliveryDestination: 'invitee@example.com',
            codeDeliveryMedium: 'EMAIL',
        })

        render(
            <MemoryRouter initialEntries={['/accept-invitation?token=tok_resend_visible']}>
                <AcceptInvitation />
            </MemoryRouter>
        )

        expect(screen.queryByRole('button', { name: /resend code/i })).not.toBeInTheDocument()

        await user.type(await screen.findByLabelText('Email'), 'invitee@example.com')
        await user.type(screen.getByLabelText('First Name'), 'Invitee')
        await user.type(screen.getByLabelText('Last Name'), 'Test')
        await user.type(screen.getByLabelText('Password'), 'TestPass123!')
        await user.click(screen.getByRole('button', { name: 'Continue' }))

        expect(await screen.findByRole('button', { name: /resend code/i })).toBeInTheDocument()
    })

    it('clears code field and shows info after successful resend', async () => {
        const user = userEvent.setup()
        const notFoundError = new Error('User does not exist')
        notFoundError.name = 'UserNotFoundException'

        mockLogin.mockRejectedValueOnce(notFoundError)
        mockRegister.mockResolvedValue({
            isComplete: false,
            nextStep: 'CONFIRM_SIGN_UP',
            codeDeliveryDestination: 'invitee@example.com',
            codeDeliveryMedium: 'EMAIL',
        })
        mockResendConfirmationCode.mockResolvedValue({
            codeDeliveryDestination: 'invitee@example.com',
            codeDeliveryMedium: 'EMAIL',
        })

        render(
            <MemoryRouter initialEntries={['/accept-invitation?token=tok_resend_success']}>
                <AcceptInvitation />
            </MemoryRouter>
        )

        await user.type(await screen.findByLabelText('Email'), 'invitee@example.com')
        await user.type(screen.getByLabelText('First Name'), 'Invitee')
        await user.type(screen.getByLabelText('Last Name'), 'Test')
        await user.type(screen.getByLabelText('Password'), 'TestPass123!')
        await user.click(screen.getByRole('button', { name: 'Continue' }))

        const codeInput = await screen.findByLabelText('Confirmation Code')
        await user.type(codeInput, '111111')
        expect(codeInput).toHaveValue('111111')

        await user.click(screen.getByRole('button', { name: /resend code/i }))

        await waitFor(() => {
            expect(mockResendConfirmationCode).toHaveBeenCalledWith('invitee@example.com')
        })

        await waitFor(() => {
            expect(screen.getByLabelText('Confirmation Code')).toHaveValue('')
        })

        expect(await screen.findByText(/New code sent to invitee@example\.com/i)).toBeInTheDocument()
    })

    it('disables resend button during cooldown and shows countdown', async () => {
        const user = userEvent.setup()
        const notFoundError = new Error('User does not exist')
        notFoundError.name = 'UserNotFoundException'

        mockLogin.mockRejectedValueOnce(notFoundError)
        mockRegister.mockResolvedValue({
            isComplete: false,
            nextStep: 'CONFIRM_SIGN_UP',
            codeDeliveryDestination: 'invitee@example.com',
            codeDeliveryMedium: 'EMAIL',
        })
        mockResendConfirmationCode.mockResolvedValue({
            codeDeliveryDestination: 'invitee@example.com',
            codeDeliveryMedium: 'EMAIL',
        })

        render(
            <MemoryRouter initialEntries={['/accept-invitation?token=tok_resend_cooldown']}>
                <AcceptInvitation />
            </MemoryRouter>
        )

        await user.type(await screen.findByLabelText('Email'), 'invitee@example.com')
        await user.type(screen.getByLabelText('First Name'), 'Invitee')
        await user.type(screen.getByLabelText('Last Name'), 'Test')
        await user.type(screen.getByLabelText('Password'), 'TestPass123!')
        await user.click(screen.getByRole('button', { name: 'Continue' }))

        await screen.findByRole('button', { name: /resend code/i })
        await user.click(screen.getByRole('button', { name: /resend code/i }))

        await waitFor(() => {
            const btn = screen.getByRole('button', { name: /resend code/i })
            expect(btn).toBeDisabled()
            expect(btn).toHaveTextContent(/Resend code \(\d+s\)/)
        })
    })

    it('shows error on resend failure', async () => {
        const user = userEvent.setup()
        const notFoundError = new Error('User does not exist')
        notFoundError.name = 'UserNotFoundException'

        mockLogin.mockRejectedValueOnce(notFoundError)
        mockRegister.mockResolvedValue({
            isComplete: false,
            nextStep: 'CONFIRM_SIGN_UP',
            codeDeliveryDestination: 'invitee@example.com',
            codeDeliveryMedium: 'EMAIL',
        })
        mockResendConfirmationCode.mockRejectedValue(new Error('Something went wrong'))

        render(
            <MemoryRouter initialEntries={['/accept-invitation?token=tok_resend_fail']}>
                <AcceptInvitation />
            </MemoryRouter>
        )

        await user.type(await screen.findByLabelText('Email'), 'invitee@example.com')
        await user.type(screen.getByLabelText('First Name'), 'Invitee')
        await user.type(screen.getByLabelText('Last Name'), 'Test')
        await user.type(screen.getByLabelText('Password'), 'TestPass123!')
        await user.click(screen.getByRole('button', { name: 'Continue' }))

        await screen.findByRole('button', { name: /resend code/i })
        await user.click(screen.getByRole('button', { name: /resend code/i }))

        expect(await screen.findByText(/Failed to send code/i)).toBeInTheDocument()
    })

    it('shows rate-limit error on LimitExceededException during resend', async () => {
        const user = userEvent.setup()
        const notFoundError = new Error('User does not exist')
        notFoundError.name = 'UserNotFoundException'

        mockLogin.mockRejectedValueOnce(notFoundError)
        mockRegister.mockResolvedValue({
            isComplete: false,
            nextStep: 'CONFIRM_SIGN_UP',
            codeDeliveryDestination: 'invitee@example.com',
            codeDeliveryMedium: 'EMAIL',
        })
        const limitError = new Error('Attempt limit exceeded, please try after some time.')
        limitError.name = 'LimitExceededException'
        mockResendConfirmationCode.mockRejectedValue(limitError)

        render(
            <MemoryRouter initialEntries={['/accept-invitation?token=tok_resend_limit']}>
                <AcceptInvitation />
            </MemoryRouter>
        )

        await user.type(await screen.findByLabelText('Email'), 'invitee@example.com')
        await user.type(screen.getByLabelText('First Name'), 'Invitee')
        await user.type(screen.getByLabelText('Last Name'), 'Test')
        await user.type(screen.getByLabelText('Password'), 'TestPass123!')
        await user.click(screen.getByRole('button', { name: 'Continue' }))

        await screen.findByRole('button', { name: /resend code/i })
        await user.click(screen.getByRole('button', { name: /resend code/i }))

        expect(await screen.findByText(/Too many attempts/i)).toBeInTheDocument()
    })
})
