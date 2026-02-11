import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
    buildInvitationEmailMismatchMessage,
    buildLoginReturnState,
    clearInviteReauthCompleted,
    hasInviteReauthCompleted,
    isInvitationEmailMismatchError,
    markInviteReauthCompleted,
    SUCCESS_REDIRECT_DELAY_MS,
} from '../features/invitation/acceptInvitationUtils'
import { getInvitationToken } from '../features/invitation/invitationUtils'
import InvitationErrorCard from '../features/invitation/components/InvitationErrorCard'
import InvitationLoadingCard from '../features/invitation/components/InvitationLoadingCard'
import InvitationSuccessCard from '../features/invitation/components/InvitationSuccessCard'
import { acceptInvitation } from '../services/people'
import { withStatus } from '../utils/errors'
import { getAdminMode } from '../utils/admin'
import { applyThemeForAdminMode } from '../utils/theme'
const AcceptInvitation = () => {
    const { user, loading, logout } = useAuth()
    const location = useLocation()
    const navigate = useNavigate()
    const [error, setError] = useState('')
    const [status, setStatus] = useState('checking')
    const [isEmailMismatch, setIsEmailMismatch] = useState(false)
    const [isSigningOut, setIsSigningOut] = useState(false)
    const submissionStartedRef = useRef(false)
    const redirectTimeoutRef = useRef(null)
    const isSuperAdmin = getAdminMode()

    useEffect(() => {
        applyThemeForAdminMode(isSuperAdmin)
    }, [isSuperAdmin])

    const token = useMemo(
        () => getInvitationToken(location.search, location.hash),
        [location.search, location.hash]
    )

    const hasCompletedInviteReauth = useMemo(() => {
        return hasInviteReauthCompleted(token)
    }, [token])

    useEffect(() => {
        return () => {
            if (redirectTimeoutRef.current !== null) {
                window.clearTimeout(redirectTimeoutRef.current)
                redirectTimeoutRef.current = null
            }
        }
    }, [])

    const scheduleRedirect = useCallback((path) => {
        if (redirectTimeoutRef.current !== null) {
            window.clearTimeout(redirectTimeoutRef.current)
        }

        redirectTimeoutRef.current = window.setTimeout(() => {
            navigate(path, { replace: true })
            redirectTimeoutRef.current = null
        }, SUCCESS_REDIRECT_DELAY_MS)
    }, [navigate])

    const redirectToLoginWithReturnPath = useCallback(() => {
        navigate('/login', {
            replace: true,
            state: buildLoginReturnState(location),
        })
    }, [location.hash, location.pathname, location.search, navigate])

    const handleSignOutAndRetry = useCallback(async () => {
        setIsSigningOut(true)
        try {
            await logout()
            redirectToLoginWithReturnPath()
        } catch {
            setError('Could not sign out. Please sign out manually and continue with the invited email.')
        } finally {
            setIsSigningOut(false)
        }
    }, [logout, redirectToLoginWithReturnPath])

    useEffect(() => {
        if (loading) return

        if (!token) {
            setStatus('error')
            setError('Invitation token is missing. Open the full invite link from your email.')
            return
        }

        if (!user) {
            // Set reauth flag before redirecting unauthenticated users to avoid double-logout
            markInviteReauthCompleted(token)
            redirectToLoginWithReturnPath()
            return
        }

        if (!hasCompletedInviteReauth) {
            ;(async () => {
                try {
                    markInviteReauthCompleted(token)
                    await logout()
                } catch {
                    // Continue to login even if best-effort logout fails.
                } finally {
                    markInviteReauthCompleted(token)
                    redirectToLoginWithReturnPath()
                }
            })()
            return
        }

        if (submissionStartedRef.current) return
        submissionStartedRef.current = true
        setStatus('submitting')

        ;(async () => {
            try {
                const invitation = await acceptInvitation(token)
                setIsEmailMismatch(false)
                clearInviteReauthCompleted(token)
                setStatus('success')
                if (invitation.tenantId) {
                    localStorage.setItem('am_tenant_id', invitation.tenantId)
                    scheduleRedirect(`/${invitation.tenantId}/projects`)
                    return
                }
                scheduleRedirect('/')
            } catch (err) {
                setStatus('error')
                if (isInvitationEmailMismatchError(err)) {
                    setIsEmailMismatch(true)
                    setError(buildInvitationEmailMismatchMessage(user?.email))
                } else {
                    setIsEmailMismatch(false)
                    setError(withStatus('Failed to accept invitation.', err))
                }
                submissionStartedRef.current = false
            }
        })()
    }, [hasCompletedInviteReauth, loading, logout, token, user, scheduleRedirect, redirectToLoginWithReturnPath])

    if (loading || status === 'checking' || status === 'submitting') {
        return <InvitationLoadingCard />
    }

    if (status === 'error') {
        const goToLogin = () => {
            if (!token || (typeof error === 'string' && error.toLowerCase().includes('token'))) {
                navigate('/login', { replace: true })
                return
            }
            redirectToLoginWithReturnPath()
        }

        return (
            <InvitationErrorCard
                error={error}
                isEmailMismatch={isEmailMismatch}
                isSigningOut={isSigningOut}
                onSignOutAndRetry={handleSignOutAndRetry}
                onGoToLogin={goToLogin}
            />
        )
    }

    return <InvitationSuccessCard />
}

export default AcceptInvitation
