import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import useStaleSessionGuard from '../useStaleSessionGuard'

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

    it('can run again after being re-enabled', async () => {
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

        // Re-enable - should run
        rerender({ enabled: true })

        await waitFor(() => {
            expect(loadCurrentUser).toHaveBeenCalledTimes(1)
            expect(getCurrentUser).toHaveBeenCalledTimes(1)
            expect(logout).toHaveBeenCalledTimes(1)
        })
    })
})
