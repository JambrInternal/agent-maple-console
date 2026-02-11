import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { acceptInvitation } from '../services/people'
import { withStatus } from '../utils/errors'

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

const AcceptInvitation = () => {
    const { user, loading } = useAuth()
    const location = useLocation()
    const navigate = useNavigate()
    const [error, setError] = useState('')
    const [status, setStatus] = useState('checking')
    const submissionStartedRef = useRef(false)

    const token = useMemo(
        () => getInvitationToken(location.search, location.hash),
        [location.search, location.hash]
    )

    useEffect(() => {
        if (loading) return

        if (!token) {
            setStatus('error')
            setError('Invitation token is missing. Open the full invite link from your email.')
            return
        }

        if (!user) {
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
            return
        }

        if (submissionStartedRef.current) return
        submissionStartedRef.current = true
        setStatus('submitting')

        ;(async () => {
            try {
                const invitation = await acceptInvitation(token)
                if (invitation.tenantId) {
                    localStorage.setItem('am_tenant_id', invitation.tenantId)
                    navigate(`/${invitation.tenantId}/projects`, { replace: true })
                    return
                }
                navigate('/', { replace: true })
            } catch (err) {
                setStatus('error')
                setError(withStatus('Failed to accept invitation.', err))
                submissionStartedRef.current = false
            }
        })()
    }, [loading, token, user, navigate, location.pathname, location.search, location.hash])

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
                        <button type="button" className="am-btn-primary" onClick={() => navigate('/login', { replace: true })}>
                            Go To Login
                        </button>
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
