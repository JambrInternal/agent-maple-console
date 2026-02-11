import { normalizeEmail } from './teamInviteStorage'

export const buildTeamRows = ({ members, pendingInvites, memberEmailSet }) => {
    const memberRows = members.map((member) => ({
        ...member,
        inviteStatus: 'active',
        isInviteOnly: false,
    }))

    const inviteRows = pendingInvites
        .filter((invite) => !memberEmailSet.has(normalizeEmail(invite.email)))
        .map((invite) => ({
            id: `invite-${invite.id}`,
            email: invite.email,
            name: invite.email,
            role: invite.role || 'viewer',
            inviteStatus: invite.status || 'pending',
            isInviteOnly: true,
        }))

    return [...memberRows, ...inviteRows]
}

export const getInviteStatusPillClass = (status) => {
    switch (status) {
        case 'active':
        case 'accepted':
            return 'am-pill is-ready'
        case 'expired':
            return 'am-status-pill is-inactive'
        case 'pending':
        default:
            return 'am-pill is-pending'
    }
}

export const getInviteStatusLabel = (status) => {
    switch (status) {
        case 'active':
            return 'Active'
        case 'accepted':
            return 'Accepted'
        case 'expired':
            return 'Expired'
        case 'pending':
        default:
            return 'Pending'
    }
}

export const getRolePillClass = (member) => {
    if (member.isInviteOnly) {
        return getInviteStatusPillClass(member.inviteStatus)
    }

    const role = member.role
    switch (role?.toLowerCase()) {
        case 'owner': return 'am-status-pill is-active'
        case 'admin': return 'am-status-pill is-on-break'
        case 'member': return 'am-pill is-ready'
        default: return 'am-pill is-pending'
    }
}

export const getRoleLabel = (member) => {
    if (member.isInviteOnly && member.inviteStatus !== 'accepted') {
        return 'Invited'
    }
    return member.role || 'viewer'
}

