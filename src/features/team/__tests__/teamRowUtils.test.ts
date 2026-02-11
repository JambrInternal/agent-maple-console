import { describe, expect, it } from 'vitest'
import {
    buildTeamRows,
    getInviteStatusLabel,
    getInviteStatusPillClass,
    getRoleLabel,
    getRolePillClass,
} from '../teamRowUtils'

describe('teamRowUtils', () => {
    it('builds rows by merging active members and non-duplicate invites', () => {
        const rows = buildTeamRows({
            members: [
                { id: 'u1', email: 'member@example.com', name: 'Member', role: 'member' },
            ] as any[],
            pendingInvites: [
                { id: 'inv1', email: 'member@example.com', role: 'member', status: 'pending' },
                { id: 'inv2', email: 'invitee@example.com', role: 'viewer', status: 'pending' },
            ] as any[],
            memberEmailSet: new Set(['member@example.com']),
        })

        expect(rows).toHaveLength(2)
        expect(rows[0].isInviteOnly).toBe(false)
        expect(rows[1].isInviteOnly).toBe(true)
        expect(rows[1].id).toBe('invite-inv2')
    })

    it('returns expected invite status label and pill class', () => {
        expect(getInviteStatusLabel('pending')).toBe('Pending')
        expect(getInviteStatusLabel('accepted')).toBe('Accepted')
        expect(getInviteStatusPillClass('pending')).toBe('am-pill is-pending')
        expect(getInviteStatusPillClass('expired')).toBe('am-status-pill is-inactive')
    })

    it('returns role label and class for invite-only and active members', () => {
        const invited = { isInviteOnly: true, inviteStatus: 'pending', role: 'viewer' } as any
        const acceptedInvite = { isInviteOnly: true, inviteStatus: 'accepted', role: 'member' } as any
        const admin = { isInviteOnly: false, role: 'admin' } as any

        expect(getRoleLabel(invited)).toBe('Invited')
        expect(getRoleLabel(acceptedInvite)).toBe('member')
        expect(getRolePillClass(invited)).toBe('am-pill is-pending')
        expect(getRolePillClass(admin)).toBe('am-status-pill is-on-break')
    })
})

