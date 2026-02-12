import React, { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getOrganizations } from '../services/organizations'
import { getProjects } from '../services/projects'
import {
    getConfirmationErrorMessage,
    getForgotPasswordConfirmErrorMessage,
    getForgotPasswordErrorMessage,
    getRedirectToFromLocation,
    getRegisterErrorMessage,
    getSignInErrorMessage,
} from '../features/auth/loginUtils'
import { resolvePostLoginRoute } from '../features/auth/postLoginRoute'
import useAuthDebug from '../features/auth/useAuthDebug'
import useLoginTheme from '../features/auth/useLoginTheme'
import useStaleSessionGuard from '../features/auth/useStaleSessionGuard'
import AuthDebugToggle from '../features/auth/components/AuthDebugToggle'
import AuthForms from '../features/auth/components/AuthForms'
import AuthStatusPanels from '../features/auth/components/AuthStatusPanels'
import { getAdminMode } from '../utils/admin'
import { setTheme } from '../utils/theme'

// Logo assets (one-liner)
const LOGO_LIGHT = '/agent-maple-wordmark-1line-white-textHalf.png';
const LOGO_DARK = '/agent-maple-wordmark-1line-black-textHalf.png';

const Login = () => {
    const theme = useLoginTheme({ defaultTheme: getAdminMode() ? 'light' : 'dark' })

    const {
        login,
        register,
        confirmRegistration,
        forgotPassword,
        confirmForgotPassword,
        logout,
        user,
        loading,
    } = useAuth();

    const [authMode, setAuthMode] = useState('signin')
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('')
    const [confirmationCode, setConfirmationCode] = useState('')
    const [error, setError] = useState('');
    const [info, setInfo] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [suppressStaleGuard, setSuppressStaleGuard] = useState(false)
    const navigate = useNavigate();
    const location = useLocation();
    const loginInProgressRef = useRef(false);

    useStaleSessionGuard({
        loading,
        user,
        logout,
        enabled: !suppressStaleGuard && !isSubmitting,
    })

    const redirectTo = getRedirectToFromLocation(location)

    const {
        debugEnabled,
        debugEvents,
        pushDebug,
        toggleDebug,
    } = useAuthDebug({ search: location.search })

    useEffect(() => {
        if (!loading && user && !loginInProgressRef.current) {
            navigate(redirectTo, { replace: true })
        }
    }, [loading, user, navigate, redirectTo])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setInfo('')
        setSuppressStaleGuard(true)
        setIsSubmitting(true)
        loginInProgressRef.current = true

        try {
            await login(email.trim(), password)
            const targetRoute = await resolvePostLoginRoute({
                redirectTo,
                getOrganizations,
                getProjects,
                getAdminMode,
                setTheme,
                pushDebug,
            })
            navigate(targetRoute, { replace: true })
        } catch (err) {
            setError(getSignInErrorMessage(err))
            pushDebug('Login failed', err)
        } finally {
            loginInProgressRef.current = false
            setIsSubmitting(false)
        }
    }

    const handleRegister = async (e) => {
        e.preventDefault()
        const normalizedEmail = email.trim()
        if (!normalizedEmail) {
            setError('Email is required')
            return
        }
        if (!password) {
            setError('Password is required')
            return
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        setError('')
        setInfo('')
        setSuppressStaleGuard(true)
        setIsSubmitting(true)
        try {
            const result = await register(normalizedEmail, password)
            if (result.isComplete) {
                setInfo('Account created. Sign in to continue.')
                setAuthMode('signin')
                setConfirmPassword('')
                return
            }

            setAuthMode('confirm')
            const destination = result.codeDeliveryDestination ? ` at ${result.codeDeliveryDestination}` : ''
            setInfo(`Enter the confirmation code sent${destination}.`)
        } catch (err) {
            setError(getRegisterErrorMessage(err))
            pushDebug('Register failed', err)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleConfirmRegistration = async (e) => {
        e.preventDefault()
        const normalizedEmail = email.trim()
        const normalizedCode = confirmationCode.trim()

        if (!normalizedEmail) {
            setError('Email is required')
            return
        }
        if (!normalizedCode) {
            setError('Confirmation code is required')
            return
        }

        setError('')
        setInfo('')
        setSuppressStaleGuard(true)
        setIsSubmitting(true)
        try {
            await confirmRegistration(normalizedEmail, normalizedCode)
            setAuthMode('signin')
            setConfirmationCode('')
            setConfirmPassword('')
            setPassword('')
            setInfo('Account confirmed. Sign in to accept your invitation.')
        } catch (err) {
            setError(getConfirmationErrorMessage(err))
            pushDebug('Confirm registration failed', err)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleForgotPasswordRequest = async (e) => {
        e.preventDefault()
        const normalizedEmail = email.trim()

        if (!normalizedEmail) {
            setError('Email is required')
            return
        }

        setError('')
        setInfo('')
        setSuppressStaleGuard(true)
        setIsSubmitting(true)
        try {
            const result = await forgotPassword(normalizedEmail)
            setAuthMode('reset-confirm')
            const destination = result.codeDeliveryDestination ? ` at ${result.codeDeliveryDestination}` : ''
            setInfo(`Enter the reset code sent${destination} and choose a new password.`)
        } catch (err) {
            setError(getForgotPasswordErrorMessage(err))
            pushDebug('Forgot password request failed', err)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleForgotPasswordConfirm = async (e) => {
        e.preventDefault()
        const normalizedEmail = email.trim()
        const normalizedCode = confirmationCode.trim()

        if (!normalizedEmail) {
            setError('Email is required')
            return
        }
        if (!normalizedCode) {
            setError('Confirmation code is required')
            return
        }
        if (!password) {
            setError('Password is required')
            return
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        setError('')
        setInfo('')
        setSuppressStaleGuard(true)
        setIsSubmitting(true)
        try {
            await confirmForgotPassword(normalizedEmail, normalizedCode, password)
            setAuthMode('signin')
            setPassword('')
            setConfirmPassword('')
            setConfirmationCode('')
            setInfo('Password reset successful. Sign in with your new password.')
        } catch (err) {
            setError(getForgotPasswordConfirmErrorMessage(err))
            pushDebug('Forgot password confirmation failed', err)
        } finally {
            setIsSubmitting(false)
        }
    }

    const switchToSignIn = () => {
        setAuthMode('signin')
        setError('')
        setInfo('')
        setPassword('')
        setConfirmPassword('')
        setConfirmationCode('')
    }

    const switchToResetRequest = () => {
        setAuthMode('reset-request')
        setError('')
        setInfo('Enter your account email to receive a password reset code.')
        setPassword('')
        setConfirmPassword('')
        setConfirmationCode('')
    }

    return (
        <div className="am-app-shell" style={{ alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ maxWidth: '400px', width: '90%', textAlign: 'center' }}>
                <div style={{ marginBottom: '2.5rem' }}>
                    {/* One-line Agent Maple Logo (light in dark theme, dark in light theme) */}
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

                <div className="am-card" style={{ padding: '2rem', textAlign: 'left' }}>
                    <AuthStatusPanels
                        error={error}
                        info={info}
                        debugEnabled={debugEnabled}
                        debugEvents={debugEvents}
                    />

                    <AuthForms
                        authMode={authMode}
                        email={email}
                        password={password}
                        confirmPassword={confirmPassword}
                        confirmationCode={confirmationCode}
                        isSubmitting={isSubmitting}
                        onSubmitSignIn={handleSubmit}
                        onSubmitRegister={handleRegister}
                        onSubmitConfirm={handleConfirmRegistration}
                        onSubmitResetRequest={handleForgotPasswordRequest}
                        onSubmitResetConfirm={handleForgotPasswordConfirm}
                        onEmailChange={setEmail}
                        onPasswordChange={setPassword}
                        onConfirmPasswordChange={setConfirmPassword}
                        onConfirmationCodeChange={setConfirmationCode}
                        onForgotPassword={switchToResetRequest}
                        onBackToSignIn={switchToSignIn}
                    />
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
