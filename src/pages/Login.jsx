import React, { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Lock, Mail, Loader2, AlertCircle } from 'lucide-react'
import { getOrganizations } from '../services/organizations'
import { getProjects } from '../services/projects'

const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { login, user, loading } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const loginInProgressRef = useRef(false)

    const redirectTo = (() => {
        const from = location.state?.from
        if (!from) return '/'
        const search = from.search || ''
        const hash = from.hash || ''
        return `${from.pathname}${search}${hash}`
    })()

    const getErrorMessage = (err) => {
        if (err && typeof err === 'object' && 'message' in err) {
            const message = String(err.message).toLowerCase()
            if (message.includes('invalid') || message.includes('password') || message.includes('username')) {
                return 'Sign in failed. Check your email and password and try again.'
            }
            if (message.includes('confirmed')) {
                return 'Your account needs confirmation. Contact your administrator.'
            }
        }
        return 'Sign in failed. Try again or contact support.'
    }

    useEffect(() => {
        if (!loading && user && !loginInProgressRef.current) {
            navigate(redirectTo, { replace: true })
        }
    }, [loading, user, navigate, redirectTo])

    const resolvePostLoginRoute = async (loggedInUser) => {
        if (redirectTo !== '/') {
            return redirectTo
        }

        try {
            const orgId = loggedInUser?.organizationId
            if (orgId) {
                try {
                    const projects = await getProjects(orgId)
                    if (projects.length === 1) {
                        return `/${orgId}/${projects[0].id}`
                    }
                } catch (projectError) {
                    console.warn('Post-login project lookup failed:', projectError)
                }
                return `/${orgId}/projects`
            }

            const orgs = await getOrganizations()
            if (orgs.length !== 1) {
                return '/'
            }

            const fallbackOrgId = orgs[0].id
            try {
                const projects = await getProjects(fallbackOrgId)
                if (projects.length === 1) {
                    return `/${fallbackOrgId}/${projects[0].id}`
                }
            } catch (projectError) {
                console.warn('Post-login project lookup failed:', projectError)
            }

            return `/${fallbackOrgId}/projects`
        } catch (orgError) {
            console.warn('Post-login organization lookup failed:', orgError)
            return '/'
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setIsSubmitting(true)
        loginInProgressRef.current = true

        try {
            const loggedInUser = await login(email, password)
            const targetRoute = await resolvePostLoginRoute(loggedInUser)
            navigate(targetRoute, { replace: true })
        } catch (err) {
            setError(getErrorMessage(err))
        } finally {
            loginInProgressRef.current = false
            setIsSubmitting(false)
        }
    }

    return (
        <div className="am-app-shell" style={{ alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ maxWidth: '400px', width: '90%', textAlign: 'center' }}>
                <div style={{ marginBottom: '2.5rem' }}>
                    {/* Placeholder for Logo */}
                    <div style={{
                        width: '48px',
                        height: '48px',
                        backgroundColor: 'var(--am-accent)',
                        borderRadius: '12px',
                        margin: '0 auto 1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <div style={{ width: '24px', height: '24px', border: '3px solid white', borderRadius: '4px' }} />
                    </div>
                    <h1 className="am-text-1" style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                        Agent Maple
                    </h1>
                    <p className="am-text-2" style={{ fontSize: '0.9375rem' }}>
                        Management Console
                    </p>
                </div>

                <div className="am-card" style={{ padding: '2rem', textAlign: 'left' }}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {error && (
                            <div style={{
                                display: 'flex',
                                gap: '8px',
                                padding: '0.75rem',
                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                borderRadius: 'var(--radius-sm)',
                                color: '#ef4444',
                                fontSize: '0.875rem'
                            }}>
                                <AlertCircle size={18} flexShrink={0} />
                                <span>{error}</span>
                            </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label className="am-text-2" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                                Email Address
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--am-text-2)' }} />
                                <input
                                    type="email"
                                    className="am-input"
                                    style={{ width: '100%', paddingLeft: '2.5rem' }}
                                    placeholder="name@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoComplete="username"
                                    required
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label className="am-text-2" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                                Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--am-text-2)' }} />
                                <input
                                    type="password"
                                    className="am-input"
                                    style={{ width: '100%', paddingLeft: '2.5rem' }}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="current-password"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="am-btn-primary"
                            style={{ padding: '0.75rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Sign In'}
                        </button>
                    </form>
                </div>

                <p className="am-text-2" style={{ marginTop: '2rem', fontSize: '0.875rem' }}>
                    Don't have an account? <span style={{ color: 'var(--am-accent)' }}>Contact support</span>
                </p>
            </div>
        </div>
    )
}

export default Login
