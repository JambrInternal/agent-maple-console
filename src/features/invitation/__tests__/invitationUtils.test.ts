import { describe, expect, it } from 'vitest'
import { getInvitationToken, isInvitationPath } from '../invitationUtils'

describe('invitationUtils', () => {
    describe('getInvitationToken', () => {
        it('returns token from query string', () => {
            expect(getInvitationToken('?token=tok_1', '')).toBe('tok_1')
        })

        it('preserves plus signs from raw query tokens', () => {
            expect(getInvitationToken('?token=abc+123%2Bxyz', '')).toBe('abc+123+xyz')
        })

        it('supports alternate query keys', () => {
            expect(getInvitationToken('?invitation_token=tok_2', '')).toBe('tok_2')
            expect(getInvitationToken('?invite_token=tok_3', '')).toBe('tok_3')
        })

        it('returns token from hash fragment when query is empty', () => {
            expect(getInvitationToken('', '#token=tok_4')).toBe('tok_4')
        })

        it('supports hash-router style invitation URLs', () => {
            expect(getInvitationToken('', '#/accept-invitation?token=tok_hash')).toBe('tok_hash')
        })

        it('returns null when no token key exists', () => {
            expect(getInvitationToken('?foo=bar', '#bar=baz')).toBeNull()
        })
    })

    describe('isInvitationPath', () => {
        it('detects supported invitation routes', () => {
            expect(isInvitationPath('/accept-invitation')).toBe(true)
            expect(isInvitationPath('/accept-invitation?token=abc')).toBe(true)
            expect(isInvitationPath('/user/accept-invitation')).toBe(true)
            expect(isInvitationPath('/user/accept-invitation?token=abc')).toBe(true)
        })

        it('returns false for non invitation routes', () => {
            expect(isInvitationPath('/login')).toBe(false)
            expect(isInvitationPath('/org_1/projects')).toBe(false)
            expect(isInvitationPath('')).toBe(false)
        })
    })
})
