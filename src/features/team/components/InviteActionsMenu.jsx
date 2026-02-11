import React from 'react'
import { MoreHorizontal } from 'lucide-react'

export default function InviteActionsMenu({
    member,
    isOpen,
    openUpward,
    isBusy,
    onToggle,
    onResend,
    onCancel,
}) {
    return (
        <div
            className={`am-row-menu${isOpen ? ' is-open' : ''}`}
            data-invite-menu
        >
            <button
                type="button"
                className="am-icon-button"
                aria-label={`Invite actions for ${member.email}`}
                aria-haspopup="menu"
                aria-expanded={isOpen}
                onClick={onToggle}
                disabled={isBusy}
            >
                <MoreHorizontal size={16} />
            </button>
            {isOpen && (
                <div
                    className={`am-row-menu-dropdown${openUpward ? ' is-up' : ''}`}
                    role="menu"
                >
                    <button
                        type="button"
                        className="am-row-menu-item"
                        role="menuitem"
                        onClick={onResend}
                        disabled={isBusy}
                    >
                        {isBusy ? 'Resending...' : 'Resend invite'}
                    </button>
                    <button
                        type="button"
                        className="am-row-menu-item"
                        role="menuitem"
                        onClick={onCancel}
                        disabled={isBusy}
                    >
                        Cancel invite
                    </button>
                </div>
            )}
        </div>
    )
}
