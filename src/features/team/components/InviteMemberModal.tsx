import React from 'react'
import { X } from 'lucide-react'

export default function InviteMemberModal({
    isOpen,
    isInviting,
    inviteEmail,
    inviteError,
    onEmailChange,
    onClose,
    onSubmit,
}) {
    if (!isOpen) return null

    return (
        <div
            className="am-modal-backdrop"
            role="presentation"
            onClick={() => !isInviting && onClose()}
        >
            <div
                className="am-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="invite-member-title"
                onClick={(event) => event.stopPropagation()}
                style={{ maxWidth: '480px' }}
            >
                <div className="am-modal-header">
                    <h2 id="invite-member-title" className="am-modal-title">Invite Team Member</h2>
                    <button
                        type="button"
                        className="am-icon-button"
                        onClick={onClose}
                        disabled={isInviting}
                        aria-label="Close invite modal"
                    >
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={onSubmit}>
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
                                onChange={(event) => onEmailChange(event.target.value)}
                                disabled={isInviting}
                                required
                            />
                        </div>
                    </div>
                    <div className="am-modal-footer">
                        <button
                            type="button"
                            className="am-btn-secondary"
                            onClick={onClose}
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
    )
}
