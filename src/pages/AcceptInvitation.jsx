import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { SUCCESS_REDIRECT_DELAY_MS } from '../features/invitation/acceptInvitationUtils'
import { getInvitationEmail, getInvitationToken } from '../features/invitation/invitationUtils'
import InvitationAuthCard from '../features/invitation/components/InvitationAuthCard'
import InvitationErrorCard from '../features/invitation/components/InvitationErrorCard'
import InvitationLoadingCard from '../features/invitation/components/InvitationLoadingCard'
import InvitationSuccessCard from '../features/invitation/components/InvitationSuccessCard'
import {
    getConfirmationErrorMessage,
    getRegisterErrorMessage,
    getSignInErrorMessage,
    getSignInErrorReason,
} from '../features/auth/loginUtils'
import { acceptInvitation } from '../services/people'
import { withStatus } from '../utils/errors'
import { getAdminMode } from '../utils/admin'
import { applyThemeForAdminMode } from '../utils/theme'

const AcceptInvitation = () => {
    const { user, loading, login, register, confirmRegistration, logout } = useAuth()
    const location = useLocation()
    const navigate = useNavigate()
    const [status, setStatus] = useState('checking')
    const [authMode, setAuthMode] = useState('password')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmationCode, setConfirmationCode] = useState('')
    const [error, setError] = useState('')
    const [info, setInfo] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const redirectTimeoutRef = useRef(null)
    const hasInitializedRef = useRef(false)
    const isSuperAdmin = getAdminMode()

    useEffect(() => {
        applyThemeForAdminMode(isSuperAdmin)
    }, [isSuperAdmin])

    const token = useMemo(() => {
        const from = location.state?.from
        const fromToken = getInvitationToken(from?.search || '', from?.hash || '')
        if (fromToken) return fromToken
        return getInvitationToken(location.search, location.hash)
    }, [location.hash, location.search, location.state])

    const inviteEmail = useMemo(() => {
        const from = location.state?.from
        const fromEmail = getInvitationEmail(from?.search || '', from?.hash || '')
        if (fromEmail) return fromEmail
        return getInvitationEmail(location.search, location.hash)
    }, [location.hash, location.search, location.state])

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

    const acceptWithCurrentSession = useCallback(async () => {
        if (!token) return false

        setStatus('accepting')
        setError('')

        try {
            const invitation = await acceptInvitation(token)
            setStatus('success')
            if (invitation.tenantId) {
                localStorage.setItem('am_tenant_id', invitation.tenantId)
                scheduleRedirect(`/${invitation.tenantId}/projects`)
                return true
            }
            scheduleRedirect('/')
            return true
        } catch (err) {
            try {
                await logout()
            } catch {
                // Best-effort logout to clear mismatched/failed session context.
            }

            setStatus('auth')
            setError(withStatus('Failed to accept invitation.', err))
            return false
        }
    }, [logout, scheduleRedirect, token])

    useEffect(() => {
        if (loading) return

        if (!token) {
            setStatus('error')
            setError('Invitation token is missing. Open the full invite link from your email.')
            return
        }

        if (hasInitializedRef.current) return
        hasInitializedRef.current = true

        ;(async () => {
            if (user) {
                try {
                    await logout()
                } catch {
                    // Continue and let user sign in again.
                }
            }

            if (inviteEmail) {
                setEmail(inviteEmail)
            }

            setStatus('auth')
            setInfo('Enter your email and password to continue.')
        })()
    }, [inviteEmail, loading, logout, token, user])

    const handlePasswordSubmit = async (event) => {
        event.preventDefault()

        if (!token) {
            setStatus('error')
            setError('Invitation token is missing. Open the full invite link from your email.')
            return
        }

        const normalizedEmail = email.trim().toLowerCase()
        if (!normalizedEmail) {
            setError('Email is required')
            return
        }

        const normalizedPassword = password.trim()
        if (!normalizedPassword) {
            setError('Password is required')
            return
        }

        setIsSubmitting(true)
        setError('')
        setInfo('')
        setStatus('auth')

        try {
            await login(normalizedEmail, normalizedPassword)
            await acceptWithCurrentSession()
            return
        } catch (signInError) {
            const signInReason = getSignInErrorReason(signInError)

            if (signInReason === 'user_not_found') {
                try {
                    const registerResult = await register(normalizedEmail, normalizedPassword)

                    if (registerResult.isComplete) {
                        await login(normalizedEmail, normalizedPassword)
                        await acceptWithCurrentSession()
                        return
                    }

                    setAuthMode('confirm')
                    const destination = registerResult.codeDeliveryDestination ? ` at ${registerResult.codeDeliveryDestination}` : ''
                    setInfo(`Account created. Enter the confirmation code sent${destination}.`)
                    return
                } catch (registerError) {
                    setError(getRegisterErrorMessage(registerError))
                    return
                }
            }

            if (signInReason === 'user_unconfirmed') {
                setAuthMode('confirm')
                setInfo('Account not confirmed yet. Enter your confirmation code to continue.')
                return
            }

            setError(getSignInErrorMessage(signInError))
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleConfirmSubmit = async (event) => {
        event.preventDefault()

        if (!token) {
            setStatus('error')
            setError('Invitation token is missing. Open the full invite link from your email.')
            return
        }

        const normalizedEmail = email.trim().toLowerCase()
        if (!normalizedEmail) {
            setError('Email is required')
            return
        }

        const normalizedPassword = password.trim()
        if (!normalizedPassword) {
            setError('Password is required')
            return
        }

        const normalizedCode = confirmationCode.trim()
        if (!normalizedCode) {
            setError('Confirmation code is required')
            return
        }

        setIsSubmitting(true)
        setError('')
        setInfo('')
        setStatus('auth')

        try {
            await confirmRegistration(normalizedEmail, normalizedCode)
            await login(normalizedEmail, normalizedPassword)
            await acceptWithCurrentSession()
        } catch (err) {
            setError(getConfirmationErrorMessage(err))
        } finally {
            setIsSubmitting(false)
        }
    }

    if (loading || status === 'checking' || status === 'accepting') {
        return <InvitationLoadingCard />
    }

    if (status === 'error') {
        return (
            <InvitationErrorCard
                error={error}
                isEmailMismatch={false}
                isSigningOut={false}
                onSignOutAndRetry={() => {}}
                onGoToLogin={() => navigate('/login', { replace: true })}
            />
        )
    }

    if (status === 'success') {
        return <InvitationSuccessCard />
    }

    return (
        <InvitationAuthCard
            email={email}
            authMode={authMode}
            password={password}
            confirmationCode={confirmationCode}
            info={info}
            error={error}
            isSubmitting={isSubmitting}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onConfirmationCodeChange={setConfirmationCode}
            onSubmitPassword={handlePasswordSubmit}
            onSubmitConfirmation={handleConfirmSubmit}
        />
    )
}

export default AcceptInvitation
