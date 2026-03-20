export const pendingInvitesKey = (orgId) => `am_pending_team_invites_${orgId || 'unknown'}`

export const normalizeEmail = (email) => (email || '').trim().toLowerCase()

export const normalizeInviteStatus = (invite) => {
    const isUsed = invite.isUsed === true || !!invite.usedAt
    const isExpired = !!invite.expiresAt && new Date(invite.expiresAt).getTime() < Date.now()

    if (isUsed) return 'accepted'
    if (isExpired) return 'expired'
    return 'pending'
}

export const readPendingInvites = (orgId, storage = localStorage) => {
    if (!orgId) return []
    try {
        const raw = storage.getItem(pendingInvitesKey(orgId))
        if (!raw) return []
        const parsed = JSON.parse(raw)
        if (!Array.isArray(parsed)) return []
        return parsed
            .filter((invite) => typeof invite?.email === 'string')
            .map((invite) => ({
                ...invite,
                status: normalizeInviteStatus(invite),
            }))
    } catch {
        return []
    }
}

export const writePendingInvites = (orgId, pendingInvites, storage = localStorage) => {
    if (!orgId) return
    storage.setItem(pendingInvitesKey(orgId), JSON.stringify(pendingInvites))
}

export const filterOutKnownMemberInvites = (pendingInvites, memberEmailSet) => {
    return pendingInvites.filter((invite) => !memberEmailSet.has(normalizeEmail(invite.email)))
}

export const upsertInviteByEmail = (pendingInvites, invitation) => {
    const invitationEmail = normalizeEmail(invitation.email)
    const next = pendingInvites.filter((item) => normalizeEmail(item.email) !== invitationEmail)
    return [...next, invitation]
}

export const removeInviteByEmail = (pendingInvites, email) => {
    const normalizedEmail = normalizeEmail(email)
    return pendingInvites.filter((invite) => normalizeEmail(invite.email) !== normalizedEmail)
}

