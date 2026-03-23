import React from 'react'
import { MoreHorizontal } from 'lucide-react'
import { Button } from '../../../../components/ui'

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
      <Button
        type="button"
        variant="icon"
        size="icon"
        aria-label={`Invite actions for ${member.email}`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={onToggle}
        disabled={isBusy}
      >
        <MoreHorizontal size={16} />
      </Button>
      {isOpen && (
        <div
          className={`am-row-menu-dropdown${openUpward ? ' is-up' : ''}`}
          role="menu"
        >
          <Button
            type="button"
            variant="ghost"
            className="am-row-menu-item"
            role="menuitem"
            onClick={onResend}
            disabled={isBusy}
          >
            {isBusy ? 'Resending...' : 'Resend invite'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="am-row-menu-item"
            role="menuitem"
            onClick={onCancel}
            disabled={isBusy}
          >
                        Cancel invite
          </Button>
        </div>
      )}
    </div>
  )
}
