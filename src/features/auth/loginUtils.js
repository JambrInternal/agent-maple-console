import { isInvitationPath } from '../invitation/invitationUtils'

export const getRedirectToFromLocation = (location) => {
    const from = location?.state?.from
    if (!from) return '/'
    const search = from.search || ''
    const hash = from.hash || ''
    return `${from.pathname}${search}${hash}`
}

export const hasInviteContext = ({ invitationToken, redirectTo }) => {
    return !!invitationToken || isInvitationPath(redirectTo)
}

export const getInitialDebugEnabled = ({ envDebugFlag, storedValue, search }) => {
    if (envDebugFlag === 'true') return true
    if (storedValue === 'true') return true
    if (storedValue === 'false') return false
    const params = new URLSearchParams(search || '')
    return params.get('debug') === 'auth'
}

export const shouldEnableDebugFromSearch = ({ search, storedValue }) => {
    const params = new URLSearchParams(search || '')
    if (params.get('debug') !== 'auth') return false
    return storedValue !== 'false'
}

export const formatDebugError = (err) => {
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

export const buildDebugEvent = ({ label, error, getErrorStatus }) => {
    const status = getErrorStatus(error)
    const detail = formatDebugError(error)
    const prefix = status ? `${label} (Status ${status})` : label
    return `${prefix}: ${detail}`
}

const getAuthErrorText = (err) => {
    const parts = []

    if (err && typeof err === 'object') {
        const name = 'name' in err ? String(err.name || '') : ''
        const code = 'code' in err ? String(err.code || '') : ''
        const message = 'message' in err ? String(err.message || '') : ''
        parts.push(name, code, message)

        if ('details' in err && err.details && typeof err.details === 'object') {
            const detailMessage = typeof err.details.message === 'string' ? err.details.message : ''
            const detail = typeof err.details.detail === 'string' ? err.details.detail : ''
            parts.push(detailMessage, detail)
        }
    } else if (typeof err === 'string') {
        parts.push(err)
    }

    return parts.join(' ').toLowerCase()
}

export const getSignInErrorReason = (err) => {
    const text = getAuthErrorText(err)
    if (!text) return 'unknown'

    if (
        text.includes('usernotfoundexception') ||
        text.includes('user does not exist') ||
        text.includes('user not found')
    ) {
        return 'user_not_found'
    }

    if (
        text.includes('usernotconfirmedexception') ||
        text.includes('not confirmed') ||
        text.includes('confirm sign up')
    ) {
        return 'user_unconfirmed'
    }

    if (
        text.includes('invalid') ||
        text.includes('incorrect') ||
        text.includes('password') ||
        text.includes('username') ||
        text.includes('not authorized')
    ) {
        return 'invalid_credentials'
    }

    return 'unknown'
}

export const getSignInErrorMessage = (err) => {
    const reason = getSignInErrorReason(err)

    if (reason === 'user_not_found') {
        return 'No account exists for this email yet. Create your account to continue.'
    }

    if (reason === 'user_unconfirmed') {
        return 'Your account is not confirmed yet. Enter your confirmation code to continue.'
    }

    if (reason === 'invalid_credentials') {
        return 'Sign in failed. Check your email and password and try again.'
    }

    return 'Sign in failed. Try again or contact support.'
}

export const getRegisterErrorMessage = (err) => {
    if (err && typeof err === 'object' && 'message' in err) {
        const message = String(err.message).toLowerCase()
        if (message.includes('exist')) {
            return 'An account already exists for this email. Confirm your account or sign in.'
        }
        if (message.includes('password')) {
            return 'Password does not meet requirements. Use a stronger password and try again.'
        }
        if (message.includes('invitation')) {
            return 'Registration is invite-only. Open the invite link from your email and try again.'
        }
    }
    return 'Failed to create account. Try again or contact support.'
}

export const getConfirmationErrorMessage = (err) => {
    if (err && typeof err === 'object' && 'message' in err) {
        const message = String(err.message).toLowerCase()
        if (message.includes('code')) {
            return 'Invalid confirmation code. Check the code and try again.'
        }
        if (message.includes('expired')) {
            return 'Confirmation code expired. Request a new invite and try again.'
        }
    }
    return 'Failed to confirm account. Try again or contact support.'
}
