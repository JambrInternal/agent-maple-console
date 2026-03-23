import { describe, expect, it } from 'vitest'
import {
  buildTeamRows,
  getInviteStatusLabel,
  getInviteStatusPillClass,
  getRoleLabel,
  getRolePillClass,
} from './teamRowUtils'

interface TeamMember {
    id: string
    email: string
    name: string
    role: string
}

interface PendingInviteRow {
    id: string
    email: string
    role?: string
    status?: 'pending' | 'accepted' | 'expired'
}

interface TeamRowLike {
    isInviteOnly: boolean
    inviteStatus?: string
    role?: string
}

describe('teamRowUtils', () => {
  it('builds rows by merging active members and non-duplicate invites', () => {
    const rows = buildTeamRows({
      members: [
        { id: 'u1', email: 'member@example.com', name: 'Member', role: 'member' },
      ] as TeamMember[],
      pendingInvites: [
        { id: 'inv1', email: 'member@example.com', role: 'member', status: 'pending' },
        { id: 'inv2', email: 'invitee@example.com', role: 'viewer', status: 'pending' },
      ] as PendingInviteRow[],
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
    const invited: TeamRowLike = { isInviteOnly: true, inviteStatus: 'pending', role: 'viewer' }
    const acceptedInvite: TeamRowLike = { isInviteOnly: true, inviteStatus: 'accepted', role: 'member' }
    const admin: TeamRowLike = { isInviteOnly: false, role: 'admin' }

    expect(getRoleLabel(invited)).toBe('Invited')
    expect(getRoleLabel(acceptedInvite)).toBe('member')
    expect(getRolePillClass(invited)).toBe('am-pill is-pending')
    expect(getRolePillClass(admin)).toBe('am-status-pill is-on-break')
  })
})
