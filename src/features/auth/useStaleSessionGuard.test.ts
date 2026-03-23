import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import useStaleSessionGuard from './useStaleSessionGuard'

describe('useStaleSessionGuard', () => {
    it('does not run when auth is loading', () => {
        const loadCurrentUser = vi.fn()
        const logout = vi.fn()

        renderHook(() => useStaleSessionGuard({
            loading: true,
            user: null,
            logout,
            loadCurrentUser,
        }))

        expect(loadCurrentUser).not.toHaveBeenCalled()
        expect(logout).not.toHaveBeenCalled()
    })

    it('logs out when a stale session exists', async () => {
        const getCurrentUser = vi.fn().mockResolvedValue({ id: 'u_1' })
        const loadCurrentUser = vi.fn().mockResolvedValue(getCurrentUser)
        const logout = vi.fn().mockResolvedValue(undefined)

        renderHook(() => useStaleSessionGuard({
            loading: false,
            user: null,
            logout,
            loadCurrentUser,
        }))

        await waitFor(() => {
            expect(loadCurrentUser).toHaveBeenCalledTimes(1)
            expect(getCurrentUser).toHaveBeenCalledTimes(1)
            expect(logout).toHaveBeenCalledTimes(1)
        })
    })

    it('does not log out when no stale session exists', async () => {
        const getCurrentUser = vi.fn().mockRejectedValue(new Error('no session'))
        const loadCurrentUser = vi.fn().mockResolvedValue(getCurrentUser)
        const logout = vi.fn()

        renderHook(() => useStaleSessionGuard({
            loading: false,
            user: null,
            logout,
            loadCurrentUser,
        }))

        await waitFor(() => {
            expect(loadCurrentUser).toHaveBeenCalledTimes(1)
            expect(getCurrentUser).toHaveBeenCalledTimes(1)
        })
        expect(logout).not.toHaveBeenCalled()
    })

    it('logs out when Cognito reports revoked access token', async () => {
        const getCurrentUser = vi
            .fn()
            .mockRejectedValue(new Error('NotAuthorizedException: Access Token has been revoked'))
        const loadCurrentUser = vi.fn().mockResolvedValue(getCurrentUser)
        const logout = vi.fn().mockResolvedValue(undefined)

        renderHook(() => useStaleSessionGuard({
            loading: false,
            user: null,
            logout,
            loadCurrentUser,
        }))

        await waitFor(() => {
            expect(loadCurrentUser).toHaveBeenCalledTimes(1)
            expect(getCurrentUser).toHaveBeenCalledTimes(1)
            expect(logout).toHaveBeenCalledTimes(1)
        })
    })

    it('does not run when explicitly disabled', () => {
        const loadCurrentUser = vi.fn()
        const logout = vi.fn()

        renderHook(() => useStaleSessionGuard({
            loading: false,
            user: null,
            logout,
            loadCurrentUser,
            enabled: false,
        }))

        expect(loadCurrentUser).not.toHaveBeenCalled()
        expect(logout).not.toHaveBeenCalled()
    })

    it('does not re-run only because enabled toggles false -> true', async () => {
        const getCurrentUser = vi.fn().mockResolvedValue({ id: 'u_1' })
        const loadCurrentUser = vi.fn().mockResolvedValue(getCurrentUser)
        const logout = vi.fn().mockResolvedValue(undefined)

        const { rerender } = renderHook(
            ({ enabled }) => useStaleSessionGuard({
                loading: false,
                user: null,
                logout,
                loadCurrentUser,
                enabled,
            }),
            { initialProps: { enabled: false } }
        )

        // Initially disabled - should not run
        expect(loadCurrentUser).not.toHaveBeenCalled()

        // Re-enable - should run once.
        rerender({ enabled: true })

        await waitFor(() => {
            expect(loadCurrentUser).toHaveBeenCalledTimes(1)
            expect(getCurrentUser).toHaveBeenCalledTimes(1)
            expect(logout).toHaveBeenCalledTimes(1)
        })

        // Disable and re-enable should not re-arm within the same stale session.
        rerender({ enabled: false })
        rerender({ enabled: true })

        await waitFor(() => {
            expect(loadCurrentUser).toHaveBeenCalledTimes(1)
            expect(getCurrentUser).toHaveBeenCalledTimes(1)
            expect(logout).toHaveBeenCalledTimes(1)
        })
    })

    it('can run again after authenticated -> unauthenticated transition', async () => {
        const getCurrentUser = vi.fn().mockResolvedValue({ id: 'u_1' })
        const loadCurrentUser = vi.fn().mockResolvedValue(getCurrentUser)
        const logout = vi.fn().mockResolvedValue(undefined)

        const { rerender } = renderHook(
            ({ user }) => useStaleSessionGuard({
                loading: false,
                user,
                logout,
                loadCurrentUser,
            }),
            { initialProps: { user: null } }
        )

        await waitFor(() => {
            expect(loadCurrentUser).toHaveBeenCalledTimes(1)
            expect(getCurrentUser).toHaveBeenCalledTimes(1)
            expect(logout).toHaveBeenCalledTimes(1)
        })

        rerender({ user: { id: 'active-user' } })
        rerender({ user: null })

        await waitFor(() => {
            expect(loadCurrentUser).toHaveBeenCalledTimes(2)
            expect(getCurrentUser).toHaveBeenCalledTimes(2)
            expect(logout).toHaveBeenCalledTimes(2)
        })
    })

    it('does not start concurrent stale-session checks while temporarily disabled in flight', async () => {
        const getCurrentUser = vi.fn()
        let resolveCurrentUser: ((value: { id: string }) => void) | null = null
        const currentUserPromise = new Promise((resolve) => {
            resolveCurrentUser = resolve
        })
        getCurrentUser.mockReturnValue(currentUserPromise)

        const loadCurrentUser = vi.fn().mockResolvedValue(getCurrentUser)
        const logout = vi.fn().mockResolvedValue(undefined)

        const { rerender } = renderHook(
            ({ enabled }) => useStaleSessionGuard({
                loading: false,
                user: null,
                logout,
                loadCurrentUser,
                enabled,
            }),
            { initialProps: { enabled: true } }
        )

        await waitFor(() => {
            expect(loadCurrentUser).toHaveBeenCalledTimes(1)
            expect(getCurrentUser).toHaveBeenCalledTimes(1)
        })

        // Disable and re-enable while first check is unresolved.
        rerender({ enabled: false })
        rerender({ enabled: true })

        await waitFor(() => {
            expect(loadCurrentUser).toHaveBeenCalledTimes(1)
            expect(getCurrentUser).toHaveBeenCalledTimes(1)
        })

        resolveCurrentUser?.({ id: 'stale-user' })
        await Promise.resolve()

        expect(loadCurrentUser).toHaveBeenCalledTimes(1)
        expect(getCurrentUser).toHaveBeenCalledTimes(1)
    })
})
