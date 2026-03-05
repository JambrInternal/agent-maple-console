import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSignUp = vi.fn()
const mockResetPassword = vi.fn()
const mockConfirmResetPassword = vi.fn()
const mockSignIn = vi.fn()
const mockSignOut = vi.fn()
const mockFetchAuthSession = vi.fn()
const mockGetCurrentUser = vi.fn()
const mockFetchUserAttributes = vi.fn()
const mockResendSignUpCode = vi.fn()
const mockApiFetch = vi.fn()
const mockSetAdminMode = vi.fn()

vi.mock('aws-amplify/auth', () => ({
    signUp: (...args: unknown[]) => mockSignUp(...args),
    resetPassword: (...args: unknown[]) => mockResetPassword(...args),
    confirmResetPassword: (...args: unknown[]) => mockConfirmResetPassword(...args),
    confirmSignUp: vi.fn(),
    signIn: (...args: unknown[]) => mockSignIn(...args),
    signOut: (...args: unknown[]) => mockSignOut(...args),
    fetchAuthSession: (...args: unknown[]) => mockFetchAuthSession(...args),
    getCurrentUser: (...args: unknown[]) => mockGetCurrentUser(...args),
    fetchUserAttributes: (...args: unknown[]) => mockFetchUserAttributes(...args),
    resendSignUpCode: (...args: unknown[]) => mockResendSignUpCode(...args),
}))

vi.mock('../client', () => ({
    apiFetch: (...args: unknown[]) => mockApiFetch(...args),
}))

vi.mock('../../utils/admin', () => ({
    clearAdminMode: vi.fn(),
    setAdminMode: (...args: unknown[]) => mockSetAdminMode(...args),
}))

import {
    __resetAuthSyncStateForTests,
    confirmForgotPassword,
    forgotPassword,
    getSessionUser,
    login,
    logout,
    register,
    resendConfirmationCode,
} from '../auth'

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
        __resetAuthSyncStateForTests()
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
                    given_name: 'Invitee',
                    family_name: 'User',
                },
            },
        })
    })

    it('derives required Cognito name attributes from invite email aliases', async () => {
        mockSignUp.mockResolvedValue({
            isSignUpComplete: true,
            nextStep: {
                signUpStep: 'DONE',
            },
        })

        await register(' jeremy+rcs@jambr.ca ', 'Temporary123!')

        expect(mockSignUp).toHaveBeenCalledWith({
            username: 'jeremy+rcs@jambr.ca',
            password: 'Temporary123!',
            options: {
                userAttributes: {
                    email: 'jeremy+rcs@jambr.ca',
                    'custom:role': 'INSTRUCTOR',
                    given_name: 'Jeremy',
                    family_name: 'Rcs',
                },
            },
        })
    })

    it('uses provided invited profile names when present', async () => {
        mockSignUp.mockResolvedValue({
            isSignUpComplete: true,
            nextStep: {
                signUpStep: 'DONE',
            },
        })

        await register('invitee@example.com', 'Temporary123!', {
            givenName: 'Jamie',
            familyName: 'Ng',
        })

        expect(mockSignUp).toHaveBeenCalledWith({
            username: 'invitee@example.com',
            password: 'Temporary123!',
            options: {
                userAttributes: {
                    email: 'invitee@example.com',
                    'custom:role': 'INSTRUCTOR',
                    given_name: 'Jamie',
                    family_name: 'Ng',
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

        expect(mockApiFetch).toHaveBeenCalledWith('/user/sync', { method: 'POST' })
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

        mockApiFetch.mockResolvedValue({ data: {} })
        const result = await login('member@example.com', 'Password123!')

        expect(mockApiFetch).toHaveBeenCalledWith('/user/sync', { method: 'POST' })
        expect(mockApiFetch).not.toHaveBeenCalledWith('/admin/tenants')
        expect(mockSetAdminMode).toHaveBeenCalledWith(false)
        expect(result.token).toBe('id-token-member')
        expect(result.user?.role).toBe('member')
    })

    it('falls back to member role when ADMIN verification fails', async () => {
        mockSignIn.mockResolvedValue(buildSignedInResult())
        mockFetchAuthSession.mockResolvedValue(buildSession('id-token-fallback'))
        mockGetCurrentUser.mockResolvedValue({ userId: 'u_admin_2', username: 'admin2@example.com' })
        mockFetchUserAttributes.mockResolvedValue({ 'custom:role': 'ADMIN' })
        mockApiFetch
            .mockResolvedValueOnce({ data: {} })
            .mockRejectedValueOnce(new Error('forbidden'))

        const result = await login('admin2@example.com', 'Password123!')

        expect(mockApiFetch).toHaveBeenCalledWith('/user/sync', { method: 'POST' })
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
        expect(mockApiFetch).toHaveBeenCalledWith('/user/sync', { method: 'POST' })
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

    it('deduplicates concurrent user sync calls across login and session hydration', async () => {
        mockSignIn.mockResolvedValue(buildSignedInResult())
        mockFetchAuthSession.mockResolvedValue(buildSession('id-token-shared-sync'))
        mockGetCurrentUser.mockResolvedValue({ userId: 'u_shared', username: 'shared@example.com' })
        mockFetchUserAttributes.mockResolvedValue({
            'custom:role': 'LEARNER',
            email: 'shared@example.com',
        })

        let resolveSync: (() => void) | null = null
        const syncPromise = new Promise<void>((resolve) => {
            resolveSync = resolve
        })

        mockApiFetch.mockImplementation((endpoint: unknown) => {
            if (endpoint === '/user/sync') {
                return syncPromise.then(() => ({ data: {} }))
            }
            return Promise.resolve({ data: {} })
        })

        const loginPromise = login('shared@example.com', 'Password123!')
        const sessionPromise = getSessionUser()

        await new Promise((resolve) => setTimeout(resolve, 25))
        const syncCallsDuringInflight = mockApiFetch.mock.calls.filter(
            (call) => call[0] === '/user/sync'
        )
        expect(syncCallsDuringInflight).toHaveLength(1)

        resolveSync?.()
        await Promise.all([loginPromise, sessionPromise])
    })

    it('retries user sync once when backend returns transient concurrency provisioning error', async () => {
        mockSignIn.mockResolvedValue(buildSignedInResult())
        mockFetchAuthSession.mockResolvedValue(buildSession('id-token-retry-sync'))
        mockGetCurrentUser.mockResolvedValue({ userId: 'u_retry', username: 'retry@example.com' })
        mockFetchUserAttributes.mockResolvedValue({ 'custom:role': 'LEARNER' })

        mockApiFetch
            .mockRejectedValueOnce(new Error('This session is provisioning a new connection; concurrent operations are not permitted (Background on this error at: https://sqlalche.me/e/20/isce)'))
            .mockResolvedValueOnce({ data: {} })

        const result = await login('retry@example.com', 'Password123!')

        expect(result.user?.role).toBe('member')
        const syncCalls = mockApiFetch.mock.calls.filter((call) => call[0] === '/user/sync')
        expect(syncCalls).toHaveLength(2)
    })

    it('deduplicates concurrent logout calls to a single Cognito signOut', async () => {
        let resolveSignOut: (() => void) | null = null
        const signOutPromise = new Promise<void>((resolve) => {
            resolveSignOut = resolve
        })
        mockSignOut.mockReturnValue(signOutPromise)

        const p1 = logout()
        const p2 = logout()

        expect(mockSignOut).toHaveBeenCalledTimes(1)
        resolveSignOut?.()
        await Promise.all([p1, p2])
    })

    it('resends sign-up confirmation code and returns code delivery info', async () => {
        mockResendSignUpCode.mockResolvedValue({
            codeDeliveryDetails: {
                destination: 'inv***@example.com',
                deliveryMedium: 'EMAIL',
            },
        })

        const result = await resendConfirmationCode('invitee@example.com')

        expect(mockResendSignUpCode).toHaveBeenCalledWith({
            username: 'invitee@example.com',
        })
        expect(result).toEqual({
            codeDeliveryDestination: 'inv***@example.com',
            codeDeliveryMedium: 'EMAIL',
        })
    })

    it('trims whitespace from email before calling Amplify resendSignUpCode', async () => {
        mockResendSignUpCode.mockResolvedValue({
            codeDeliveryDetails: {
                destination: 'inv***@example.com',
                deliveryMedium: 'EMAIL',
            },
        })

        await resendConfirmationCode(' invitee@example.com ')

        expect(mockResendSignUpCode).toHaveBeenCalledWith({
            username: 'invitee@example.com',
        })
    })
})
