import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { acceptInvitation } from '../services/people'
import { withStatus } from '../utils/errors'

const SUCCESS_REDIRECT_DELAY_MS = 300
const inviteReauthKey = (token) => `am_invite_reauth_done_${token || 'unknown'}`

const getInvitationToken = (search, hash) => {
    const params = new URLSearchParams(search || '')
    const fromQuery = params.get('token') || params.get('invitation_token') || params.get('invite_token')
    if (fromQuery) return fromQuery

    if (hash) {
        const hashValue = hash.startsWith('#') ? hash.slice(1) : hash
        const hashParams = new URLSearchParams(hashValue)
        return hashParams.get('token') || hashParams.get('invitation_token') || hashParams.get('invite_token')
    }

    return null
}

const isInvitationEmailMismatchError = (error) => {
    const details = typeof error === 'object' && error !== null
        ? error.details
        : null

    const candidates = []
    if (error instanceof Error && error.message) candidates.push(error.message)
    if (details && typeof details === 'object') {
        if (typeof details.message === 'string') candidates.push(details.message)
        if (typeof details.detail === 'string') candidates.push(details.detail)
    }

    const text = candidates.join(' ').toLowerCase()
    return (
        text.includes('invitation_email_mismatch') ||
        text.includes('user email does not match invitation email') ||
        text.includes('email does not match invitation email')
    )
}

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

    const token = useMemo(
        () => getInvitationToken(location.search, location.hash),
        [location.search, location.hash]
    )

    const hasCompletedInviteReauth = useMemo(() => {
        if (!token) return false
        return sessionStorage.getItem(inviteReauthKey(token)) === '1'
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
            state: {
                from: {
                    pathname: location.pathname,
                    search: location.search,
                    hash: location.hash,
                },
            },
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
            redirectToLoginWithReturnPath()
            return
        }

        if (!hasCompletedInviteReauth) {
            ;(async () => {
                try {
                    if (token) {
                        sessionStorage.setItem(inviteReauthKey(token), '1')
                    }
                    await logout()
                } catch {
                    // Continue to login even if best-effort logout fails.
                } finally {
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
                sessionStorage.removeItem(inviteReauthKey(token))
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
                    const signedInEmail = user?.email || 'your current account'
                    setError(`You are signed in as ${signedInEmail}, but this invite is for a different email. Sign out and continue with the invited email.`)
                } else {
                    setIsEmailMismatch(false)
                    setError(withStatus('Failed to accept invitation.', err))
                }
                submissionStartedRef.current = false
            }
        })()
    }, [hasCompletedInviteReauth, loading, logout, token, user, scheduleRedirect, redirectToLoginWithReturnPath])

    if (loading || status === 'checking' || status === 'submitting') {
        return (
            <div className="am-app-shell" style={{ alignItems: 'center', justifyContent: 'center' }}>
                <div className="am-card" style={{ width: 'min(520px, 92vw)', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <Loader2 size={18} className="animate-spin" />
                        <span style={{ fontWeight: 600 }}>Accepting Invitation</span>
                    </div>
                    <p className="am-text-2">Please wait while we verify your session and join your organization.</p>
                </div>
            </div>
        )
    }

    if (status === 'error') {
        return (
            <div className="am-app-shell" style={{ alignItems: 'center', justifyContent: 'center' }}>
                <div className="am-card" style={{ width: 'min(560px, 92vw)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', marginBottom: '0.75rem' }}>
                        <AlertCircle size={18} style={{ color: '#ef4444', marginTop: '2px' }} />
                        <div>
                            <h1 className="am-page-title" style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>
                                Invitation Could Not Be Accepted
                            </h1>
                            <p className="am-text-2" style={{ fontSize: '0.9rem' }}>{error}</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                        {isEmailMismatch ? (
                            <button
                                type="button"
                                className="am-btn-primary"
                                onClick={handleSignOutAndRetry}
                                disabled={isSigningOut}
                            >
                                {isSigningOut ? 'Signing Out...' : 'Sign Out & Continue'}
                            </button>
                        ) : (
                            <button type="button" className="am-btn-primary" onClick={redirectToLoginWithReturnPath}>
                                Go To Login
                            </button>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="am-app-shell" style={{ alignItems: 'center', justifyContent: 'center' }}>
            <div className="am-card" style={{ width: 'min(520px, 92vw)', textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <CheckCircle2 size={18} style={{ color: '#22c55e' }} />
                    <span style={{ fontWeight: 600 }}>Invitation Accepted</span>
                </div>
                <p className="am-text-2">Redirecting you now.</p>
            </div>
        </div>
    )
}

export default AcceptInvitation
