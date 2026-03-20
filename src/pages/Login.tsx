import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Authenticator, Button, Heading, Text, useAuthenticator, View } from '@aws-amplify/ui-react'
import { confirmResetPassword, resetPassword, signIn } from 'aws-amplify/auth'
import { useAuth } from '../contexts/AuthContext'
import { getOrganizations } from '../services/organizations'
import { getProjects } from '../services/projects'
import {
    getRedirectToFromLocation,
    getSignInErrorMessage,
} from '../features/auth/loginUtils'
import { resolvePostLoginRoute } from '../features/auth/postLoginRoute'
import useAuthDebug from '../features/auth/useAuthDebug'
import useLoginTheme from '../features/auth/useLoginTheme'
import useStaleSessionGuard from '../features/auth/useStaleSessionGuard'
import AuthDebugToggle from '../features/auth/components/AuthDebugToggle'
import AuthStatusPanels from '../features/auth/components/AuthStatusPanels'
import { getAdminMode } from '../utils/admin'
import { setTheme } from '../utils/theme'

const LOGO_LIGHT = '/agent-maple-wordmark-1line-white-textHalf.png'
const LOGO_DARK = '/agent-maple-wordmark-1line-black-textHalf.png'

const ROUTE_INFO_COPY = {
    forgotPassword: 'Enter your account email to receive a password reset code.',
    confirmResetPassword: 'Enter the reset code you received and choose a new password.',
    forceNewPassword: 'Set a new password to finish signing in.',
    confirmSignIn: 'Complete the verification step to continue.',
    selectMfaType: 'Choose the verification method you want to use.',
    setupTotp: 'Set up your authenticator app to continue.',
    setupEmail: 'Set up email verification to continue.',
}

const AUTH_FORM_FIELDS = {
    signIn: {
        username: {
            label: 'Email Address',
            placeholder: 'name@company.com',
            isRequired: true,
            autocomplete: 'username',
        },
        password: {
            label: 'Password',
            placeholder: '••••••••',
            isRequired: true,
            autocomplete: 'current-password',
        },
    },
    forgotPassword: {
        username: {
            label: 'Email Address',
            placeholder: 'name@company.com',
            isRequired: true,
            autocomplete: 'username',
        },
    },
    confirmResetPassword: {
        confirmation_code: {
            label: 'Confirmation Code',
            placeholder: '123456',
            isRequired: true,
            autocomplete: 'one-time-code',
        },
        password: {
            label: 'New Password',
            placeholder: '••••••••',
            isRequired: true,
            autocomplete: 'new-password',
        },
        confirm_password: {
            label: 'Confirm Password',
            placeholder: '••••••••',
            isRequired: true,
            autocomplete: 'new-password',
        },
    },
    forceNewPassword: {
        password: {
            label: 'New Password',
            placeholder: '••••••••',
            isRequired: true,
            autocomplete: 'new-password',
        },
    },
}

const normalizeAuthError = (error) => {
    if (!error) return ''
    if (typeof error === 'string') return error
    if (typeof error === 'object' && 'message' in error) {
        return getSignInErrorMessage(error)
    }
    return String(error)
}

function AuthenticatorStatusHeader({ error, info, debugEnabled, debugEvents }) {
    const { route, error: routeError } = useAuthenticator((context) => [context.route, context.error])

    return (
        <AuthStatusPanels
            error={error || normalizeAuthError(routeError)}
            info={info || ROUTE_INFO_COPY[route] || ''}
            debugEnabled={debugEnabled}
            debugEvents={debugEvents}
        />
    )
}

function SignInFooter() {
    const { toForgotPassword } = useAuthenticator((context) => [context.toForgotPassword])

    return (
        <Button className="am-auth-secondary-action" type="button" onClick={toForgotPassword}>
            Forgot Password?
        </Button>
    )
}

function ForgotPasswordFooter() {
    const { toSignIn } = useAuthenticator((context) => [context.toSignIn])

    return (
        <Button className="am-auth-secondary-action" type="button" onClick={toSignIn}>
            Back To Sign In
        </Button>
    )
}

function AuthenticatedLoginRedirect({
    redirectTo,
    pushDebug,
    syncCurrentUser,
    onRouteResolutionStart,
    onRouteResolutionError,
}) {
    const navigate = useNavigate()
    const hasResolvedRef = useRef(false)

    useEffect(() => {
        if (hasResolvedRef.current) {
            return undefined
        }

        hasResolvedRef.current = true
        onRouteResolutionStart()
        let cancelled = false

        ;(async () => {
            try {
                const currentUser = await syncCurrentUser()
                if (!currentUser) {
                    throw new Error('Unable to load the current user after authentication.')
                }

                const targetRoute = await resolvePostLoginRoute({
                    redirectTo,
                    getOrganizations,
                    getProjects,
                    getAdminMode,
                    setTheme,
                    pushDebug,
                })

                if (!cancelled) {
                    navigate(targetRoute, { replace: true })
                }
            } catch (error) {
                if (cancelled) {
                    return
                }
                onRouteResolutionError(error)
                pushDebug('Post-authentication session sync failed', error)
                hasResolvedRef.current = false
            }
        })()

        return () => {
            cancelled = true
        }
    }, [navigate, onRouteResolutionError, onRouteResolutionStart, pushDebug, redirectTo, syncCurrentUser])

    return (
        <View className="am-authenticator-complete" data-testid="am-authenticated-redirect">
            <Heading level={4}>Signing you in…</Heading>
            <Text>We&apos;re syncing your access and preparing the right project view.</Text>
        </View>
    )
}

const Login = () => {
    const theme = useLoginTheme({ defaultTheme: getAdminMode() ? 'light' : 'dark' })
    const { user, loading, logout, syncCurrentUser } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const redirectFlowInProgressRef = useRef(false)
    const handledAuthenticatorRouteRef = useRef(false)
    const [authError, setAuthError] = useState('')
    const [authInfo, setAuthInfo] = useState('')

    useStaleSessionGuard({
        loading,
        user,
        logout,
        enabled: !redirectFlowInProgressRef.current,
    })

    const redirectTo = getRedirectToFromLocation(location)

    const {
        debugEnabled,
        debugEvents,
        pushDebug,
        toggleDebug,
    } = useAuthDebug({ search: location.search })

    useEffect(() => {
        if (!loading && user && !handledAuthenticatorRouteRef.current) {
            navigate(redirectTo, { replace: true })
        }
    }, [loading, navigate, redirectTo, user])

    const authenticatorComponents = useMemo(() => ({
        Header: () => (
            <AuthenticatorStatusHeader
                error={authError}
                info={authInfo}
                debugEnabled={debugEnabled}
                debugEvents={debugEvents}
            />
        ),
        SignIn: {
            Header: () => null,
            Footer: SignInFooter,
        },
        ForgotPassword: {
            Header: () => null,
            Footer: ForgotPasswordFooter,
        },
    }), [authError, authInfo, debugEnabled, debugEvents])

    const authenticatorServices = useMemo(() => ({
        async handleSignIn({ username, password, options }) {
            setAuthError('')
            setAuthInfo('')
            return signIn({
                username: username.trim().toLowerCase(),
                password,
                options,
            })
        },
        async handleForgotPassword({ username }) {
            setAuthError('')
            return resetPassword({ username: username.trim().toLowerCase() })
        },
        async handleForgotPasswordSubmit({ username, confirmationCode, newPassword }) {
            setAuthError('')
            return confirmResetPassword({
                username: username.trim().toLowerCase(),
                confirmationCode: confirmationCode.trim(),
                newPassword,
            })
        },
    }), [])

    return (
        <div className="am-app-shell" style={{ alignItems: 'center', justifyContent: 'center' }}>
            <div className="am-authenticator-shell" style={{ maxWidth: '400px', width: '90%', textAlign: 'center' }}>
                <div style={{ marginBottom: '2.5rem' }}>
                    <img
                        src={theme === 'dark' ? LOGO_LIGHT : LOGO_DARK}
                        alt="Agent Maple Logo"
                        style={{
                            width: '220px',
                            height: 'auto',
                            margin: '0 auto 2.5rem',
                            display: 'block',
                            objectFit: 'contain',
                        }}
                    />
                </div>

                <div className="am-card am-authenticator-card" style={{ padding: '2rem', textAlign: 'left' }}>
                    <Authenticator
                        className="am-authenticator-frame"
                        components={authenticatorComponents}
                        formFields={AUTH_FORM_FIELDS}
                        hideSignUp
                        loginMechanisms={['email']}
                        services={authenticatorServices}
                    >
                        {() => (
                            <AuthenticatedLoginRedirect
                                redirectTo={redirectTo}
                                pushDebug={pushDebug}
                                syncCurrentUser={syncCurrentUser}
                                onRouteResolutionStart={() => {
                                    redirectFlowInProgressRef.current = true
                                    handledAuthenticatorRouteRef.current = true
                                    setAuthError('')
                                    setAuthInfo('')
                                }}
                                onRouteResolutionError={(error) => {
                                    redirectFlowInProgressRef.current = false
                                    setAuthError(normalizeAuthError(error))
                                    setAuthInfo('Sign-in completed, but we could not finish loading your console. Try again.')
                                }}
                            />
                        )}
                    </Authenticator>
                </div>

                <p className="am-text-2" style={{ marginTop: '2rem', fontSize: '0.875rem' }}>
                    Need help? <span style={{ color: 'var(--am-accent)' }}>Contact support</span>
                </p>
                <AuthDebugToggle debugEnabled={debugEnabled} onToggle={toggleDebug} />
            </div>
        </div>
    )
}

export default Login
