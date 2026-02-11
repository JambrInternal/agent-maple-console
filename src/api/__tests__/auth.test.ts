import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSignUp = vi.fn()
const mockResetPassword = vi.fn()
const mockConfirmResetPassword = vi.fn()
const mockSignIn = vi.fn()
const mockFetchAuthSession = vi.fn()
const mockGetCurrentUser = vi.fn()
const mockFetchUserAttributes = vi.fn()
const mockApiFetch = vi.fn()
const mockSetAdminMode = vi.fn()

vi.mock('aws-amplify/auth', () => ({
    signUp: (...args: unknown[]) => mockSignUp(...args),
    resetPassword: (...args: unknown[]) => mockResetPassword(...args),
    confirmResetPassword: (...args: unknown[]) => mockConfirmResetPassword(...args),
    confirmSignUp: vi.fn(),
    signIn: (...args: unknown[]) => mockSignIn(...args),
    signOut: vi.fn(),
    fetchAuthSession: (...args: unknown[]) => mockFetchAuthSession(...args),
    getCurrentUser: (...args: unknown[]) => mockGetCurrentUser(...args),
    fetchUserAttributes: (...args: unknown[]) => mockFetchUserAttributes(...args),
}))

vi.mock('../client', () => ({
    apiFetch: (...args: unknown[]) => mockApiFetch(...args),
}))

vi.mock('../../utils/admin', () => ({
    clearAdminMode: vi.fn(),
    setAdminMode: (...args: unknown[]) => mockSetAdminMode(...args),
}))

import { confirmForgotPassword, forgotPassword, getSessionUser, login, register } from '../auth'

const buildSignedInResult = () => ({
    isSignedIn: true,
    nextStep: { signInStep: 'DONE' },
})

const buildSession = (token: string) => ({
    tokens: {
        idToken: {
            toString: () => token,
        },
    },
})

describe('api auth', () => {
    beforeEach(() => {
        localStorage.clear()
        vi.clearAllMocks()
    })

    it('sends custom role attribute for post-confirmation user creation', async () => {
        mockSignUp.mockResolvedValue({
            isSignUpComplete: false,
            nextStep: {
                signUpStep: 'CONFIRM_SIGN_UP',
                codeDeliveryDetails: {
                    destination: 'invitee@example.com',
                    deliveryMedium: 'EMAIL',
                },
            },
        })

        await register(' invitee@example.com ', 'Temporary123!')

        expect(mockSignUp).toHaveBeenCalledWith({
            username: 'invitee@example.com',
            password: 'Temporary123!',
            options: {
                userAttributes: {
                    email: 'invitee@example.com',
                    'custom:role': 'INSTRUCTOR',
                },
            },
        })
    })

    it('returns admin role and enables admin mode when role is ADMIN and backend verification passes', async () => {
        mockSignIn.mockResolvedValue(buildSignedInResult())
        mockFetchAuthSession.mockResolvedValue(buildSession('id-token-admin'))
        mockGetCurrentUser.mockResolvedValue({ userId: 'u_admin', username: 'admin@example.com' })
        mockFetchUserAttributes.mockResolvedValue({ 'custom:role': 'ADMIN' })
        mockApiFetch.mockResolvedValue({ data: [] })

        const result = await login('admin@example.com', 'Password123!')

        expect(mockApiFetch).toHaveBeenCalledWith('/admin/tenants')
        expect(mockSetAdminMode).toHaveBeenCalledWith(true)
        expect(result.token).toBe('id-token-admin')
        expect(result.user?.role).toBe('admin')
    })

    it('returns member role and disables admin mode when role is not ADMIN', async () => {
        mockSignIn.mockResolvedValue(buildSignedInResult())
        mockFetchAuthSession.mockResolvedValue(buildSession('id-token-member'))
        mockGetCurrentUser.mockResolvedValue({ userId: 'u_member', username: 'member@example.com' })
        mockFetchUserAttributes.mockResolvedValue({ 'custom:role': 'LEARNER' })

        const result = await login('member@example.com', 'Password123!')

        expect(mockApiFetch).not.toHaveBeenCalled()
        expect(mockSetAdminMode).toHaveBeenCalledWith(false)
        expect(result.token).toBe('id-token-member')
        expect(result.user?.role).toBe('member')
    })

    it('falls back to member role when ADMIN verification fails', async () => {
        mockSignIn.mockResolvedValue(buildSignedInResult())
        mockFetchAuthSession.mockResolvedValue(buildSession('id-token-fallback'))
        mockGetCurrentUser.mockResolvedValue({ userId: 'u_admin_2', username: 'admin2@example.com' })
        mockFetchUserAttributes.mockResolvedValue({ 'custom:role': 'ADMIN' })
        mockApiFetch.mockRejectedValue(new Error('forbidden'))

        const result = await login('admin2@example.com', 'Password123!')

        expect(mockApiFetch).toHaveBeenCalledWith('/admin/tenants')
        expect(mockSetAdminMode).toHaveBeenCalledWith(false)
        expect(result.user?.role).toBe('member')
    })

    it('hydrates session user with admin role and stores token when admin verification passes', async () => {
        mockGetCurrentUser.mockResolvedValue({ userId: 'u_session_admin', username: 'cognito-user' })
        mockFetchAuthSession.mockResolvedValue(buildSession('session-id-token'))
        mockFetchUserAttributes
            .mockResolvedValueOnce({ 'custom:role': 'ADMIN' })
            .mockResolvedValueOnce({ 'custom:role': 'ADMIN', email: 'session-admin@example.com' })
        mockApiFetch.mockResolvedValue({ data: [] })

        const user = await getSessionUser()

        expect(user).not.toBeNull()
        expect(user?.role).toBe('admin')
        expect(user?.email).toBe('session-admin@example.com')
        expect(localStorage.getItem('am_auth_token')).toBe('session-id-token')
        expect(mockSetAdminMode).toHaveBeenCalledWith(true)
    })

    it('starts forgot-password flow and returns code delivery info', async () => {
        mockResetPassword.mockResolvedValue({
            nextStep: {
                resetPasswordStep: 'CONFIRM_RESET_PASSWORD_WITH_CODE',
                codeDeliveryDetails: {
                    destination: 'j***@example.com',
                    deliveryMedium: 'EMAIL',
                },
            },
        })

        const result = await forgotPassword(' reset.user@example.com ')

        expect(mockResetPassword).toHaveBeenCalledWith({
            username: 'reset.user@example.com',
        })
        expect(result).toEqual({
            nextStep: 'CONFIRM_RESET_PASSWORD_WITH_CODE',
            codeDeliveryDestination: 'j***@example.com',
            codeDeliveryMedium: 'EMAIL',
        })
    })

    it('confirms forgot-password reset with code and new password', async () => {
        mockConfirmResetPassword.mockResolvedValue(undefined)

        await confirmForgotPassword(' reset.user@example.com ', ' 123456 ', 'NewPass123!')

        expect(mockConfirmResetPassword).toHaveBeenCalledWith({
            username: 'reset.user@example.com',
            confirmationCode: '123456',
            newPassword: 'NewPass123!',
        })
    })
})
