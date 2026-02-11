import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { MoreHorizontal, Plus, User as UserIcon, X } from 'lucide-react'
import { getUsers, inviteUser } from '../services/people'
import { useApiQuery } from '../hooks/useApiQuery'
import { withStatus } from '../utils/errors'
import QueryError from '../components/QueryError'

const pendingInvitesKey = (orgId) => `am_pending_team_invites_${orgId || 'unknown'}`

const normalizeEmail = (email) => (email || '').trim().toLowerCase()

const normalizeInviteStatus = (invite) => {
    const isUsed = invite.isUsed === true || !!invite.usedAt
    const isExpired = !!invite.expiresAt && new Date(invite.expiresAt).getTime() < Date.now()
    
    if (isUsed) return 'accepted'
    if (isExpired) return 'expired'
    return 'pending'
}

const readPendingInvites = (orgId) => {
    if (!orgId) return []
    try {
        const raw = localStorage.getItem(pendingInvitesKey(orgId))
        if (!raw) return []
        const parsed = JSON.parse(raw)
        if (!Array.isArray(parsed)) return []
        return parsed
            .filter((invite) => typeof invite?.email === 'string')
            .map((invite) => ({
                ...invite,
                status: normalizeInviteStatus(invite)
            }))
    } catch {
        return []
    }
}

const OrgTeam = () => {
    const { orgId } = useParams()
    const [isInviteOpen, setIsInviteOpen] = useState(false)
    const [inviteEmail, setInviteEmail] = useState('')
    const [inviteError, setInviteError] = useState('')
    const [isInviting, setIsInviting] = useState(false)
    const [inviteActionError, setInviteActionError] = useState('')
    const [inviteActionEmail, setInviteActionEmail] = useState('')
    const [openInviteMenuId, setOpenInviteMenuId] = useState(null)
    const [pendingInvites, setPendingInvites] = useState(() => readPendingInvites(orgId))
    const pendingInvitesOrgIdRef = useRef(orgId)

    const {
        data: members = [],
        isLoading: loading,
        error,
        refetch
    } = useApiQuery(
        ['org-members', orgId],
        () => getUsers(orgId),
        { enabled: !!orgId }
    )

    useEffect(() => {
        setPendingInvites(readPendingInvites(orgId))
        pendingInvitesOrgIdRef.current = orgId
        setOpenInviteMenuId(null)
        setInviteActionEmail('')
        setInviteActionError('')
    }, [orgId])

    const memberEmailSet = useMemo(
        () => new Set(members.map((member) => normalizeEmail(member.email)).filter(Boolean)),
        [members]
    )

    useEffect(() => {
        if (!orgId) return
        const filtered = pendingInvites.filter((invite) => !memberEmailSet.has(normalizeEmail(invite.email)))
        if (filtered.length === pendingInvites.length) return
        setPendingInvites(filtered)
        pendingInvitesOrgIdRef.current = orgId
    }, [memberEmailSet, orgId, pendingInvites])

    useEffect(() => {
        if (!orgId) return
        if (pendingInvitesOrgIdRef.current !== orgId) return
        localStorage.setItem(pendingInvitesKey(orgId), JSON.stringify(pendingInvites))
    }, [orgId, pendingInvites])

    useEffect(() => {
        if (!openInviteMenuId) return

        const handlePointerDown = (event) => {
            if (event.target instanceof Element && event.target.closest('[data-invite-menu]')) return
            setOpenInviteMenuId(null)
        }

        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                setOpenInviteMenuId(null)
            }
        }

        document.addEventListener('pointerdown', handlePointerDown)
        document.addEventListener('keydown', handleEscape)

        return () => {
            document.removeEventListener('pointerdown', handlePointerDown)
            document.removeEventListener('keydown', handleEscape)
        }
    }, [openInviteMenuId])

    const rows = useMemo(() => {
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
    }, [memberEmailSet, members, pendingInvites])

    const handleInvite = async (e) => {
        e.preventDefault()
        if (!orgId) {
            setInviteError('Organization ID is missing')
            return
        }
        if (!inviteEmail.trim()) {
            setInviteError('Email is required')
            return
        }
        setInviteError('')
        setInviteActionError('')
        setIsInviting(true)
        try {
            const invitation = await inviteUser(inviteEmail.trim(), orgId)
            setPendingInvites((prev) => {
                const next = prev.filter((item) => normalizeEmail(item.email) !== normalizeEmail(invitation.email))
                return [...next, invitation]
            })
            pendingInvitesOrgIdRef.current = orgId
            setInviteEmail('')
            setIsInviteOpen(false)
            refetch()
        } catch (err) {
            console.error('Failed to invite user:', err)
            setInviteError(withStatus('Failed to send invitation.', err))
        } finally {
            setIsInviting(false)
        }
    }

    const isInviteActionBusy = (email) => (
        normalizeEmail(inviteActionEmail) !== '' &&
        normalizeEmail(inviteActionEmail) === normalizeEmail(email)
    )

    const handleResendInvite = async (inviteMember) => {
        if (!orgId) {
            setInviteActionError('Organization ID is missing')
            return
        }

        const email = inviteMember.email?.trim()
        if (!email) {
            setInviteActionError('Invite email is missing')
            return
        }

        setOpenInviteMenuId(null)
        setInviteActionError('')
        setInviteActionEmail(email)

        try {
            const invitation = await inviteUser(email, orgId)
            setPendingInvites((prev) => {
                const next = prev.filter((item) => normalizeEmail(item.email) !== normalizeEmail(invitation.email))
                return [...next, invitation]
            })
            pendingInvitesOrgIdRef.current = orgId
            refetch()
        } catch (err) {
            console.error('Failed to resend invite:', err)
            setInviteActionError(withStatus('Failed to resend invitation.', err))
        } finally {
            setInviteActionEmail('')
        }
    }

    const handleCancelInvite = (inviteMember) => {
        const email = inviteMember.email?.trim()
        if (!email) {
            setInviteActionError('Invite email is missing')
            return
        }

        if (!window.confirm(`Cancel invitation for ${email}?`)) return

        setInviteActionError('')
        setOpenInviteMenuId(null)
        setPendingInvites((prev) => prev.filter((invite) => normalizeEmail(invite.email) !== normalizeEmail(email)))
        pendingInvitesOrgIdRef.current = orgId
    }

    const getInviteStatusPillClass = (status) => {
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

    const getInviteStatusLabel = (status) => {
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

    const getRolePillClass = (member) => {
        if (member.isInviteOnly) {
            return getInviteStatusPillClass(member.inviteStatus)
        }

        const role = member.role
        switch (role?.toLowerCase()) {
            case 'owner': return 'am-status-pill is-active' // Green-ish
            case 'admin': return 'am-status-pill is-on-break' // Amber-ish
            case 'member': return 'am-pill is-ready' // Also green-ish
            default: return 'am-pill is-pending' // Gray-ish
        }
    }

    const getRoleLabel = (member) => {
        if (member.isInviteOnly && member.inviteStatus !== 'accepted') {
            return 'Invited'
        }
        return member.role || 'viewer'
    }

    return (
        <div className="am-page-content">
            <div className="am-contacts-container">
                <div className="am-page-header">
                    <div>
                        <h1 className="am-page-title">Team Management</h1>
                        <p className="am-page-subtitle">
                            Manage roles and access for your organization.
                        </p>
                    </div>
                    <button
                        className="am-btn-primary"
                        type="button"
                        onClick={() => {
                            setInviteEmail('')
                            setInviteError('')
                            setIsInviteOpen(true)
                        }}
                    >
                        <Plus size={16} />
                        <span>Invite Member</span>
                    </button>
                </div>

                {loading && (
                    <div className="am-text-2" style={{ padding: '2rem 0' }}>
                        Loading team members...
                    </div>
                )}

                {!loading && error && (
                    <div className="am-text-2" style={{ padding: '2rem 0', color: '#ef4444' }}>
                        <QueryError message="Failed to load team members." error={error} onRetry={refetch} />
                    </div>
                )}

                {!loading && !error && (
                    <div className="am-table-card">
                        {inviteActionError && (
                            <div className="am-text-2" style={{ color: '#ef4444', fontSize: '0.85rem', padding: '1rem 1rem 0' }}>
                                {inviteActionError}
                            </div>
                        )}
                        <table className="am-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((member, rowIndex) => (
                                    <tr key={member.id}>
                                        <td className="am-contact-name">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div className="am-avatar" style={{ cursor: 'default' }}>
                                                    {member.name?.charAt(0) || <UserIcon size={14} />}
                                                </div>
                                                <span>{member.name}</span>
                                            </div>
                                        </td>
                                        <td className="am-contact-info">{member.email}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                                                <span
                                                    className={getRolePillClass(member)}
                                                    aria-label={member.isInviteOnly ? `Invite status ${getInviteStatusLabel(member.inviteStatus).toLowerCase()}` : undefined}
                                                >
                                                    {getRoleLabel(member)}
                                                </span>
                                                {member.isInviteOnly && member.inviteStatus !== 'accepted' && (
                                                    <div
                                                        className={`am-row-menu${openInviteMenuId === member.id ? ' is-open' : ''}`}
                                                        data-invite-menu
                                                    >
                                                        <button
                                                            type="button"
                                                            className="am-icon-button"
                                                            aria-label={`Invite actions for ${member.email}`}
                                                            aria-haspopup="menu"
                                                            aria-expanded={openInviteMenuId === member.id}
                                                            onClick={() => setOpenInviteMenuId((current) => current === member.id ? null : member.id)}
                                                            disabled={isInviteActionBusy(member.email)}
                                                        >
                                                            <MoreHorizontal size={16} />
                                                        </button>
                                                        {openInviteMenuId === member.id && (
                                                            <div
                                                                className={`am-row-menu-dropdown${rowIndex >= rows.length - 2 ? ' is-up' : ''}`}
                                                                role="menu"
                                                            >
                                                                <button
                                                                    type="button"
                                                                    className="am-row-menu-item"
                                                                    role="menuitem"
                                                                    onClick={() => handleResendInvite(member)}
                                                                    disabled={isInviteActionBusy(member.email)}
                                                                >
                                                                    {isInviteActionBusy(member.email) ? 'Resending...' : 'Resend invite'}
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="am-row-menu-item"
                                                                    role="menuitem"
                                                                    onClick={() => handleCancelInvite(member)}
                                                                    disabled={isInviteActionBusy(member.email)}
                                                                >
                                                                    Cancel invite
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {rows.length === 0 && (
                            <div className="am-text-2 am-table-empty">
                                No team members found.
                            </div>
                        )}
                    </div>
                )}
            </div>

            {isInviteOpen && (
                <div
                    className="am-modal-backdrop"
                    role="presentation"
                    onClick={() => !isInviting && setIsInviteOpen(false)}
                >
                    <div
                        className="am-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="invite-member-title"
                        onClick={(e) => e.stopPropagation()}
                        style={{ maxWidth: '480px' }}
                    >
                        <div className="am-modal-header">
                            <h2 id="invite-member-title" className="am-modal-title">Invite Team Member</h2>
                            <button
                                type="button"
                                className="am-icon-button"
                                onClick={() => setIsInviteOpen(false)}
                                disabled={isInviting}
                                aria-label="Close invite modal"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleInvite}>
                            <div className="am-form">
                                {inviteError && (
                                    <div className="am-text-2" style={{ color: '#ef4444', fontSize: '0.85rem' }}>
                                        {inviteError}
                                    </div>
                                )}
                                <div className="am-form-field">
                                    <label className="am-label" htmlFor="email">Email Address</label>
                                    <input
                                        id="email"
                                        type="email"
                                        className="am-input"
                                        placeholder="colleague@company.com"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        disabled={isInviting}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="am-modal-footer">
                                <button
                                    type="button"
                                    className="am-btn-secondary"
                                    onClick={() => setIsInviteOpen(false)}
                                    disabled={isInviting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="am-btn-primary"
                                    disabled={isInviting}
                                >
                                    {isInviting ? 'Inviting...' : 'Send Invitation'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default OrgTeam
