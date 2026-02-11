import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Plus, User as UserIcon, Shield, Trash2, X } from 'lucide-react'
import { getUsers, inviteUser, removeUser } from '../services/people'
import { useApiQuery } from '../hooks/useApiQuery'
import { withStatus } from '../utils/errors'
import QueryError from '../components/QueryError'

const pendingInvitesKey = (orgId) => `am_pending_team_invites_${orgId || 'unknown'}`

const normalizeEmail = (email) => (email || '').trim().toLowerCase()

const readPendingInvites = (orgId) => {
    if (!orgId) return []
    try {
        const raw = localStorage.getItem(pendingInvitesKey(orgId))
        if (!raw) return []
        const parsed = JSON.parse(raw)
        if (!Array.isArray(parsed)) return []
        return parsed.filter((invite) => typeof invite?.email === 'string')
    } catch {
        return []
    }
}

const OrgTeam = () => {
    const { orgId } = useParams()
    const [isInviteOpen, setIsInviteOpen] = useState(false)
    const [inviteEmail, setInviteEmail] = useState('')
    const [inviteRole, setInviteRole] = useState('instructor')
    const [inviteError, setInviteError] = useState('')
    const [isInviting, setIsInviting] = useState(false)
    const [pendingInvites, setPendingInvites] = useState(() => readPendingInvites(orgId))

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
    }, [memberEmailSet, orgId, pendingInvites])

    useEffect(() => {
        if (!orgId) return
        localStorage.setItem(pendingInvitesKey(orgId), JSON.stringify(pendingInvites))
    }, [orgId, pendingInvites])

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
                mfaEnabled: false,
                inviteStatus: invite.status || 'pending',
                isInviteOnly: true,
            }))

        return [...memberRows, ...inviteRows]
    }, [memberEmailSet, members, pendingInvites])

    const handleInvite = async (e) => {
        e.preventDefault()
        if (!inviteEmail.trim()) {
            setInviteError('Email is required')
            return
        }
        setInviteError('')
        setIsInviting(true)
        try {
            const invitation = await inviteUser(inviteEmail.trim(), inviteRole, orgId)
            setPendingInvites((prev) => {
                const next = prev.filter((item) => normalizeEmail(item.email) !== normalizeEmail(invitation.email))
                return [...next, invitation]
            })
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

    const handleRemove = async (userId, userName) => {
        if (!window.confirm(`Are you sure you want to remove ${userName}?`)) return
        try {
            await removeUser(userId, orgId)
            refetch()
        } catch (err) {
            console.error('Failed to remove user:', err)
            alert(withStatus('Failed to remove member.', err))
        }
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

    const getRolePillClass = (role) => {
        switch (role?.toLowerCase()) {
            case 'owner': return 'am-status-pill is-active' // Green-ish
            case 'admin': return 'am-status-pill is-on-break' // Amber-ish
            case 'member': return 'am-pill is-ready' // Also green-ish
            default: return 'am-pill is-pending' // Gray-ish
        }
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
                            setInviteRole('instructor')
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
                        <table className="am-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Invite Status</th>
                                    <th>MFA Status</th>
                                    <th className="am-table-action">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((member) => (
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
                                            <span className={getRolePillClass(member.role)}>
                                                {member.role || 'viewer'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={getInviteStatusPillClass(member.inviteStatus)}>
                                                {getInviteStatusLabel(member.inviteStatus)}
                                            </span>
                                        </td>
                                        <td>
                                            {member.isInviteOnly ? (
                                                <span className="am-text-2" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                                                    N/A
                                                </span>
                                            ) : (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: member.mfaEnabled ? '#22c55e' : 'var(--am-text-2)' }}>
                                                <Shield size={14} />
                                                <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                                                    {member.mfaEnabled ? 'Enabled' : 'Disabled'}
                                                </span>
                                            </div>
                                            )}
                                        </td>
                                        <td className="am-table-action">
                                            {member.isInviteOnly ? (
                                                <span className="am-text-2" style={{ fontSize: '0.75rem' }}>
                                                    Pending
                                                </span>
                                            ) : (
                                                <button
                                                    className="am-icon-button"
                                                    style={{ color: '#ef4444' }}
                                                    onClick={() => handleRemove(member.id, member.name)}
                                                    title="Remove member"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {rows.length === 0 && (
                            <div className="am-text-2" style={{ padding: '2rem 0', textAlign: 'center' }}>
                                No team members found.
                            </div>
                        )}
                    </div>
                )}
            </div>

            {isInviteOpen && (
                <div className="am-modal-backdrop" onClick={() => !isInviting && setIsInviteOpen(false)}>
                    <div
                        className="am-modal"
                        onClick={(e) => e.stopPropagation()}
                        style={{ maxWidth: '480px' }}
                    >
                        <div className="am-modal-header">
                            <h2 className="am-modal-title">Invite Team Member</h2>
                            <button
                                className="am-icon-button"
                                onClick={() => setIsInviteOpen(false)}
                                disabled={isInviting}
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
