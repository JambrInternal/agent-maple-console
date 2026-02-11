import { describe, expect, it } from 'vitest'
import {
    buildInvitationEmailMismatchMessage,
    buildLoginReturnState,
    clearInviteReauthCompleted,
    hasInviteReauthCompleted,
    inviteReauthKey,
    isInvitationEmailMismatchError,
    markInviteReauthCompleted,
} from '../acceptInvitationUtils'

describe('acceptInvitationUtils', () => {
    it('builds invite reauth key with fallback for empty token', () => {
        expect(inviteReauthKey('tok_1')).toMatch(/^am_invite_reauth_done_[a-z0-9]+_[a-z0-9]+$/)
        expect(inviteReauthKey('')).toBe('am_invite_reauth_done_unknown')
    })

    it('marks, reads, and clears invite reauth completion in session storage', () => {
        const token = 'tok_abc'
        expect(hasInviteReauthCompleted(token)).toBe(false)

        markInviteReauthCompleted(token)
        expect(hasInviteReauthCompleted(token)).toBe(true)

        clearInviteReauthCompleted(token)
        expect(hasInviteReauthCompleted(token)).toBe(false)
    })

    it('detects invitation email mismatch errors from message variants', () => {
        expect(isInvitationEmailMismatchError(new Error('User email does not match invitation email'))).toBe(true)
        expect(isInvitationEmailMismatchError({ details: { message: 'invitation_email_mismatch' } })).toBe(true)
        expect(isInvitationEmailMismatchError({ details: { detail: 'EMAIL does not match invitation email' } })).toBe(true)
        expect(isInvitationEmailMismatchError(new Error('something else failed'))).toBe(false)
    })

    it('builds mismatch message with signed-in email fallback', () => {
        expect(buildInvitationEmailMismatchMessage('jeremy@jambr.ca')).toContain('jeremy@jambr.ca')
        expect(buildInvitationEmailMismatchMessage('')).toContain('your current account')
    })

    it('builds login return state from location', () => {
        const state = buildLoginReturnState({
            pathname: '/accept-invitation',
            search: '?token=tok_1',
            hash: '',
        })

        expect(state).toEqual({
            from: {
                pathname: '/accept-invitation',
                search: '?token=tok_1',
                hash: '',
            },
        })
    })
})
