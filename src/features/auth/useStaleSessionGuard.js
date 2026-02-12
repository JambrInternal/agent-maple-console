import { useEffect } from 'react'
import { useRef } from 'react'

const defaultLoadCurrentUser = async () => {
    const module = await import('aws-amplify/auth')
    return module.getCurrentUser
}

export default function useStaleSessionGuard({
    loading,
    user,
    logout,
    loadCurrentUser = defaultLoadCurrentUser,
    enabled = true,
}) {
    const hasCheckedRef = useRef(false)

    useEffect(() => {
        if (!enabled || loading || user) {
            return
        }
        if (hasCheckedRef.current) return
        hasCheckedRef.current = true

        let cancelled = false

        ;(async () => {
            try {
                const getCurrentUser = await loadCurrentUser()
                if (cancelled) return
                await getCurrentUser()
                if (cancelled) return
                await logout()
            } catch (error) {
                const message = String(
                    error && typeof error === 'object' && 'message' in error
                        ? error.message
                        : error ?? ''
                ).toLowerCase()

                // Revoked token means stale Cognito state; clear it.
                if (message.includes('access token has been revoked')) {
                    if (cancelled) return
                    await logout()
                }
            }
        })()

        return () => {
            cancelled = true
        }
    }, [enabled, loading, user, logout, loadCurrentUser])
}
