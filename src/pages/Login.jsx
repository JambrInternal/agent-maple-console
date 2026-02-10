import React, { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Lock, Mail, Loader2, AlertCircle } from 'lucide-react'
import { getOrganizations } from '../services/organizations'
import { getProjects } from '../services/projects'
import { getErrorStatus } from '../api/client'
import { getAmplifyAuthConfig } from '../amplify-config'
import { getAdminMode } from '../utils/admin'
import { setTheme } from '../utils/theme'

// Logo assets
const LOGO_LIGHT = '/agent-maple-lockup-mono-white.png';
const LOGO_DARK = '/agent-maple-lockup-mono-dark.png';

const Login = () => {
    // Always set theme to dark mode on login page mount
    useEffect(() => {
        setTheme('dark');
    }, []);

    // Track theme for dynamic logo
    const [theme, setThemeState] = useState(() => {
        if (typeof document !== 'undefined') {
            return document.documentElement.dataset.theme || 'dark';
        }
        return 'dark';
    });
    useEffect(() => {
        const observer = new MutationObserver(() => {
            setThemeState(document.documentElement.dataset.theme || 'dark');
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
        return () => observer.disconnect();
    }, []);
    const { login, logout, user, loading } = useAuth();

    // On mount, if Cognito session exists but app user is null, force logout to clear stale session
    useEffect(() => {
        if (loading || user) return;

        (async () => {
            try {
                const { getCurrentUser } = await import('aws-amplify/auth');
                await getCurrentUser();     // if this succeeds, Cognito has a session
                await logout();             // clear Cognito + local state
            } catch {
                // no session; ignore
            }
        })();
    }, [loading, user, logout]);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [debugEvents, setDebugEvents] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const loginInProgressRef = useRef(false);

    const redirectTo = (() => {
        const from = location.state?.from
        if (!from) return '/'
        const search = from.search || ''
        const hash = from.hash || ''
        return `${from.pathname}${search}${hash}`
    })()

    const [debugEnabled, setDebugEnabled] = useState(() => {
        if (import.meta.env.VITE_DEBUG_AUTH === 'true') return true
        const stored = localStorage.getItem('am_debug_auth')
        if (stored === 'true') return true
        if (stored === 'false') return false
        const params = new URLSearchParams(location.search || '')
        return params.get('debug') === 'auth'
    })

    useEffect(() => {
        const params = new URLSearchParams(location.search || '')
        if (params.get('debug') !== 'auth') return
        if (localStorage.getItem('am_debug_auth') === 'false') return
        setDebugEnabled(true)
    }, [location.search])

    const formatDebugError = (err) => {
        if (!err) return 'Unknown error'
        if (typeof err === 'string') return err
        if (typeof err === 'object' && 'message' in err) {
            const message = String(err.message || '')
            return message || String(err)
        }
        try {
            return JSON.stringify(err)
        } catch (jsonError) {
            return String(err)
        }
    }

    const pushDebug = (label, err) => {
        if (!debugEnabled) return
        const status = getErrorStatus(err)
        const detail = formatDebugError(err)
        const prefix = status ? `${label} (Status ${status})` : label
        setDebugEvents((prev) => [...prev, `${prefix}: ${detail}`])
    }

    const getErrorMessage = (err) => {
        if (err && typeof err === 'object' && 'message' in err) {
            const message = String(err.message).toLowerCase()
            if (message.includes('invalid') || message.includes('password') || message.includes('username')) {
                return 'Sign in failed. Check your email and password and try again.'
            }
            if (message.includes('confirmed')) {
                return 'Your account is not active yet. Contact your administrator.'
            }
        }
        return 'Sign in failed. Try again or contact support.'
    }

    useEffect(() => {
        if (!loading && user && !loginInProgressRef.current) {
            navigate(redirectTo, { replace: true })
        }
    }, [loading, user, navigate, redirectTo])

    const resolvePostLoginRoute = async () => {
        try {
            const orgs = await getOrganizations({ includeProjectCounts: false })
            const isAdmin = getAdminMode()
            setTheme(isAdmin ? 'light' : 'dark')

            if (isAdmin) {
                return '/'
            }

            if (redirectTo !== '/') {
                return redirectTo
            }

            if (orgs.length !== 1) {
                return '/'
            }

            const orgId = orgs[0].id
            try {
                const projects = await getProjects(orgId)
                if (projects.length === 1) {
                    return `/${orgId}/${projects[0].id}`
                }
            } catch (projectError) {
                console.warn('Post-login project lookup failed:', projectError)
                pushDebug('Post-login project lookup failed', projectError)
            }

            return `/${orgId}/projects`
        } catch (orgError) {
            console.warn('Post-login organization lookup failed:', orgError)
            pushDebug('Post-login organization lookup failed', orgError)
            setTheme('dark')
            return redirectTo !== '/' ? redirectTo : '/'
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setIsSubmitting(true)
        loginInProgressRef.current = true

        try {
            await login(email, password)
            const targetRoute = await resolvePostLoginRoute()
            navigate(targetRoute, { replace: true })
        } catch (err) {
            setError(getErrorMessage(err))
            pushDebug('Login failed', err)
        } finally {
            loginInProgressRef.current = false
            setIsSubmitting(false)
        }
    }

    const toggleDebug = () => {
        setDebugEvents([])
        setDebugEnabled((prev) => {
            const next = !prev
            localStorage.setItem('am_debug_auth', String(next))
            return next
        })
    }

    return (
        <div className="am-app-shell" style={{ alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ maxWidth: '400px', width: '90%', textAlign: 'center' }}>
                <div style={{ marginBottom: '2.5rem' }}>
                    {/* Dynamic Agent Maple Logo (light in dark theme, dark in light theme) */}
                    <img
                        src={theme === 'light' ? LOGO_DARK : LOGO_LIGHT}
                        alt="Agent Maple Logo"
                        style={{
                            width: '120px',
                            height: 'auto',
                            margin: '0 auto 1.5rem',
                            display: 'block',
                            borderRadius: '12px',
                            background: 'none',
                            objectFit: 'contain',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                        }}
                    />
                    <p className="am-text-2" style={{ fontSize: '0.9375rem' }}>
                        Console
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
                        {debugEnabled && (
                            <div
                                style={{
                                    padding: '0.75rem',
                                    backgroundColor: 'rgba(15, 23, 42, 0.6)',
                                    border: '1px solid rgba(148, 163, 184, 0.3)',
                                    borderRadius: 'var(--radius-sm)',
                                    color: 'var(--am-text-2)',
                                    fontSize: '0.75rem',
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word',
                                }}
                            >
                                {(() => {
                                    const config = getAmplifyAuthConfig()
                                    const lines = [
                                        `Cognito region: ${config.region}`,
                                        `Cognito user pool: ${config.userPoolId}`,
                                        `Cognito app client: ${config.userPoolClientId}`,
                                    ]
                                    if (debugEvents.length > 0) {
                                        lines.push('', ...debugEvents)
                                    }
                                    return lines.join('\n')
                                })()}
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
                    Need help? <span style={{ color: 'var(--am-accent)' }}>Contact support</span>
                </p>
                <button
                    type="button"
                    onClick={toggleDebug}
                    className="am-text-2"
                    style={{
                        marginTop: '0.75rem',
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.12em',
                        background: 'none',
                        border: '1px solid transparent',
                        padding: '0.35rem 0.6rem',
                        borderRadius: '999px',
                        cursor: 'pointer',
                        color: debugEnabled ? 'var(--am-accent)' : 'var(--am-text-2)',
                    }}
                >
                    {debugEnabled ? 'Disable Debug' : 'Enable Debug'}
                </button>
            </div>
        </div>
    )
}

export default Login
