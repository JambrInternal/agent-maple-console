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
    const inFlightRef = useRef(false)

    useEffect(() => {
        // Do not reset guard state while temporarily disabled (e.g. submit in-flight),
        // otherwise the check can re-arm immediately after submit and race with login.
        if (!enabled) {
            return
        }

        if (loading || user) {
            hasCheckedRef.current = false
            inFlightRef.current = false
            return
        }

        if (hasCheckedRef.current || inFlightRef.current) return
        hasCheckedRef.current = true
        inFlightRef.current = true

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
            } finally {
                inFlightRef.current = false
            }
        })()

        return () => {
            cancelled = true
        }
    }, [enabled, loading, user, logout, loadCurrentUser])
}
