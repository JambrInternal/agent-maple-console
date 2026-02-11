import { describe, expect, it } from 'vitest'
import {
    filterOutKnownMemberInvites,
    normalizeEmail,
    normalizeInviteStatus,
    readPendingInvites,
    removeInviteByEmail,
    upsertInviteByEmail,
} from '../teamInviteStorage'

describe('teamInviteStorage', () => {
    it('normalizes email consistently', () => {
        expect(normalizeEmail('  USER@Example.com ')).toBe('user@example.com')
        expect(normalizeEmail(null as unknown as string)).toBe('')
    })

    it('normalizes invite status using used/expired fields', () => {
        expect(normalizeInviteStatus({ isUsed: true, usedAt: null, expiresAt: null })).toBe('accepted')
        expect(normalizeInviteStatus({
            isUsed: false,
            usedAt: null,
            expiresAt: new Date(Date.now() - 60_000).toISOString(),
        })).toBe('expired')
        expect(normalizeInviteStatus({
            isUsed: false,
            usedAt: null,
            expiresAt: new Date(Date.now() + 60_000).toISOString(),
        })).toBe('pending')
    })

    it('reads and normalizes pending invites from storage', () => {
        const storage = {
            getItem: (key: string) => (
                key === 'am_pending_team_invites_org_1'
                    ? JSON.stringify([{ email: 'test@example.com', isUsed: false, expiresAt: null, usedAt: null }])
                    : null
            ),
        } as Storage

        const invites = readPendingInvites('org_1', storage)
        expect(invites).toHaveLength(1)
        expect(invites[0].status).toBe('pending')
    })

    it('filters out invites already represented by active members', () => {
        const invites = [
            { email: 'member@example.com' },
            { email: 'invitee@example.com' },
        ]
        const set = new Set(['member@example.com'])
        const filtered = filterOutKnownMemberInvites(invites as any[], set)
        expect(filtered).toHaveLength(1)
        expect(filtered[0].email).toBe('invitee@example.com')
    })

    it('upserts and removes invites by normalized email', () => {
        const initial = [
            { email: 'first@example.com', id: '1' },
            { email: 'second@example.com', id: '2' },
        ]

        const upserted = upsertInviteByEmail(initial as any[], { email: 'SECOND@example.com', id: '3' } as any)
        expect(upserted).toHaveLength(2)
        expect(upserted.find((x: any) => x.email.toLowerCase() === 'second@example.com')?.id).toBe('3')

        const removed = removeInviteByEmail(upserted as any[], ' First@Example.com ')
        expect(removed).toHaveLength(1)
        expect(removed[0].email.toLowerCase()).toBe('second@example.com')
    })
})

