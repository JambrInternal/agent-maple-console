import { useEffect } from 'react'

const defaultLoadCurrentUser = async () => {
    const module = await import('aws-amplify/auth')
    return module.getCurrentUser
}

export default function useStaleSessionGuard({
    loading,
    user,
    logout,
    loadCurrentUser = defaultLoadCurrentUser,
}) {
    useEffect(() => {
        if (loading || user) return

        let cancelled = false

        ;(async () => {
            try {
                const getCurrentUser = await loadCurrentUser()
                if (cancelled) return
                await getCurrentUser()
                if (cancelled) return
                await logout()
            } catch {
                // No stale session found.
            }
        })()

        return () => {
            cancelled = true
        }
    }, [loading, user, logout, loadCurrentUser])
}
