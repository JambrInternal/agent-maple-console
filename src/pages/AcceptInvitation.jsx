import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
    SUCCESS_REDIRECT_DELAY_MS,
    isInvitationEmailMismatchError,
} from '../features/invitation/acceptInvitationUtils'
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
import { dispatchTenantChange } from '../featureFlags/featureFlagService'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const AcceptInvitation = () => {
    const { user, loading, login, register, confirmRegistration, logout } = useAuth()
    const location = useLocation()
    const navigate = useNavigate()
    const [status, setStatus] = useState('checking')
    const [authMode, setAuthMode] = useState('password')
    const [email, setEmail] = useState('')
    const [givenName, setGivenName] = useState('')
    const [familyName, setFamilyName] = useState('')
    const [password, setPassword] = useState('')
    const [confirmationCode, setConfirmationCode] = useState('')
    const [error, setError] = useState('')
    const [info, setInfo] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const redirectTimeoutRef = useRef(null)
    const hasHandledInitialSessionRef = useRef(false)
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
        if (!inviteEmail) return
        setEmail((currentEmail) => currentEmail.trim() ? currentEmail : inviteEmail)
    }, [inviteEmail])

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

    const acceptWithCurrentSession = useCallback(async ({ allowMismatchLogout }) => {
        if (!token) return false

        setStatus('accepting')
        setError('')
        setInfo('')

        try {
            const invitation = await acceptInvitation(token)
            setStatus('success')
            if (invitation.tenantId) {
                localStorage.setItem('am_tenant_id', invitation.tenantId)
                dispatchTenantChange(invitation.tenantId)
                scheduleRedirect(`/${invitation.tenantId}/projects`)
                return true
            }
            scheduleRedirect('/')
            return true
        } catch (err) {
            if (isInvitationEmailMismatchError(err)) {
                try {
                    await logout()
                } catch {
                    // Continue without blocking the invite-auth flow.
                }

                setStatus('auth')
                setError(allowMismatchLogout ? '' : withStatus('Failed to accept invitation.', err))
                if (allowMismatchLogout && inviteEmail) {
                    setInfo(`This invite is for ${inviteEmail}. Enter that account password to continue.`)
                } else {
                    setInfo('This invite does not match the signed-in account. Enter the invited email and password to continue.')
                }
                return false
            }

            if (!allowMismatchLogout) {
                setStatus('auth')
                setError(withStatus('Failed to accept invitation.', err))
                return false
            }

            setStatus('error')
            setError(withStatus('Failed to accept invitation.', err))
            return false
        }
    }, [inviteEmail, logout, scheduleRedirect, token])

    const getValidatedEmail = useCallback(() => {
        const normalizedEmail = email.trim().toLowerCase()
        if (!normalizedEmail) {
            setError('Email is required')
            return null
        }
        if (!EMAIL_PATTERN.test(normalizedEmail)) {
            setError('Enter a valid email address')
            return null
        }
        return normalizedEmail
    }, [email])

    const getValidatedRegisterProfile = useCallback(() => {
        const normalizedGivenName = givenName.trim()
        const normalizedFamilyName = familyName.trim()

        if (!normalizedGivenName) {
            setError('First name is required to create your account')
            return null
        }

        if (!normalizedFamilyName) {
            setError('Last name is required to create your account')
            return null
        }

        setGivenName(normalizedGivenName)
        setFamilyName(normalizedFamilyName)

        return {
            givenName: normalizedGivenName,
            familyName: normalizedFamilyName,
        }
    }, [familyName, givenName])

    useEffect(() => {
        if (loading) return

        if (!token) {
            setStatus('error')
            setError('Invitation token is missing. Open the full invite link from your email.')
            return
        }

        if (hasHandledInitialSessionRef.current) return
        hasHandledInitialSessionRef.current = true

        if (user) {
            void acceptWithCurrentSession({ allowMismatchLogout: true })
            return
        }

        setStatus('auth')
        setInfo('Enter your email and password to continue.')
    }, [acceptWithCurrentSession, loading, token, user])

    const handlePasswordSubmit = async (event) => {
        event.preventDefault()

        if (!token) {
            setStatus('error')
            setError('Invitation token is missing. Open the full invite link from your email.')
            return
        }

        const normalizedEmail = getValidatedEmail()
        if (!normalizedEmail) {
            return
        }
        setEmail(normalizedEmail)

        if (!password.trim()) {
            setError('Password is required')
            return
        }

        setIsSubmitting(true)
        setError('')
        setInfo('')
        setStatus('auth')

        try {
            await login(normalizedEmail, password)
            await acceptWithCurrentSession({ allowMismatchLogout: false })
        } catch (signInError) {
            const signInReason = getSignInErrorReason(signInError)

            if (signInReason === 'user_unconfirmed') {
                setAuthMode('confirm')
                setInfo('Account not confirmed yet. Enter your confirmation code to continue.')
                return
            }

            // Cognito can return NotAuthorizedException ("Incorrect username or password")
            // for users that do not exist. For invite onboarding, attempt registration once.
            if (signInReason === 'user_not_found' || signInReason === 'invalid_credentials') {
                try {
                    const registerProfile = getValidatedRegisterProfile()
                    if (!registerProfile) {
                        return
                    }

                    const registerResult = await register(normalizedEmail, password, registerProfile)

                    if (registerResult.isComplete) {
                        await login(normalizedEmail, password)
                        await acceptWithCurrentSession({ allowMismatchLogout: false })
                        return
                    }

                    setAuthMode('confirm')
                    const destination = registerResult.codeDeliveryDestination ? ` at ${registerResult.codeDeliveryDestination}` : ''
                    setInfo(`Account created. Enter the confirmation code sent${destination}.`)
                    return
                } catch (registerError) {
                    if (signInReason === 'invalid_credentials') {
                        const registerMessage = String(
                            registerError && typeof registerError === 'object' && 'message' in registerError
                                ? registerError.message
                                : ''
                        ).toLowerCase()

                        if (registerMessage.includes('exist')) {
                            setError('Sign in failed. The account may already exist with a different password. Reset your password and try again.')
                            return
                        }
                    }
                    setError(getRegisterErrorMessage(registerError))
                    return
                }
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

        const normalizedEmail = getValidatedEmail()
        if (!normalizedEmail) {
            return
        }
        setEmail(normalizedEmail)

        if (!password.trim()) {
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
            await login(normalizedEmail, password)
            await acceptWithCurrentSession({ allowMismatchLogout: false })
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
            givenName={givenName}
            familyName={familyName}
            authMode={authMode}
            password={password}
            confirmationCode={confirmationCode}
            info={info}
            error={error}
            isSubmitting={isSubmitting}
            onEmailChange={setEmail}
            onGivenNameChange={setGivenName}
            onFamilyNameChange={setFamilyName}
            onPasswordChange={setPassword}
            onConfirmationCodeChange={setConfirmationCode}
            onSubmitPassword={handlePasswordSubmit}
            onSubmitConfirmation={handleConfirmSubmit}
        />
    )
}

export default AcceptInvitation
