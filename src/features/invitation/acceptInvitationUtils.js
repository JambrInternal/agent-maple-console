import { inviteReauthKey } from '../../utils/invitation'

export const SUCCESS_REDIRECT_DELAY_MS = 300

export const hasInviteReauthCompleted = (token, storage = sessionStorage) => {
    if (!token || !storage) return false

    try {
        return storage.getItem(inviteReauthKey(token)) === '1'
    } catch {
        return false
    }
}

export const markInviteReauthCompleted = (token, storage = sessionStorage) => {
    if (!token || !storage) return

    try {
        storage.setItem(inviteReauthKey(token), '1')
    } catch {
        // Storage availability should not block invite flow.
    }
}

export const clearInviteReauthCompleted = (token, storage = sessionStorage) => {
    if (!token || !storage) return

    try {
        storage.removeItem(inviteReauthKey(token))
    } catch {
        // Storage availability should not block invite flow.
    }
}

export const isInvitationEmailMismatchError = (error) => {
    const details = typeof error === 'object' && error !== null
        ? error.details
        : null

    const candidates = []
    if (error instanceof Error && error.message) {
        candidates.push(error.message)
    } else if (error && typeof error === 'object' && typeof error.message === 'string') {
        candidates.push(error.message)
    }
    if (details && typeof details === 'object') {
        if (typeof details.message === 'string') candidates.push(details.message)
        if (typeof details.detail === 'string') candidates.push(details.detail)

        if (Array.isArray(details.detail) && details.detail.length > 0) {
            const firstDetail = details.detail[0]
            if (firstDetail && typeof firstDetail === 'object') {
                if (typeof firstDetail.msg === 'string') candidates.push(firstDetail.msg)
                if (typeof firstDetail.message === 'string') candidates.push(firstDetail.message)
                if (typeof firstDetail.detail === 'string') candidates.push(firstDetail.detail)
            }
        }
    }

    const text = candidates.join(' ').toLowerCase()

    return (
        text.includes('invitation_email_mismatch') ||
        text.includes('user email does not match invitation email') ||
        text.includes('email does not match invitation email')
    )
}

export const buildInvitationEmailMismatchMessage = (signedInEmail) => {
    const account = signedInEmail || 'your current account'
    return `You are signed in as ${account}, but this invite is for a different email. Sign out and continue with the invited email.`
}

export const buildLoginReturnState = (location) => ({
    from: {
        pathname: location?.pathname || '',
        search: location?.search || '',
        hash: location?.hash || '',
    },
})
