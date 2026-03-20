import React from 'react'
import { User as UserIcon } from 'lucide-react'
import InviteActionsMenu from './InviteActionsMenu'
import {
    getInviteStatusLabel,
    getRoleLabel,
    getRolePillClass,
} from '../teamRowUtils'

export default function TeamMembersTable({
    rows,
    inviteActionError,
    openInviteMenuId,
    isInviteActionBusy,
    onToggleInviteMenu,
    onResendInvite,
    onCancelInvite,
}) {
    return (
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
                                        <InviteActionsMenu
                                            member={member}
                                            isOpen={openInviteMenuId === member.id}
                                            openUpward={rowIndex >= rows.length - 2}
                                            isBusy={isInviteActionBusy(member.email)}
                                            onToggle={() => onToggleInviteMenu(member.id)}
                                            onResend={() => onResendInvite(member)}
                                            onCancel={() => onCancelInvite(member)}
                                        />
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
    )
}
