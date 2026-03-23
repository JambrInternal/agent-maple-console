import { KeyboardEvent, MouseEvent } from 'react'
import { X } from 'lucide-react'
import { Button, Input } from '../../../../components/ui'

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
  const canDismiss = !isInviting

  const handleBackdropKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onClose()
    }
  }
  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }
  const modalContent = (
    <div
      className="am-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="invite-member-title"
      style={{ maxWidth: '480px' }}
    >
      <div className="am-modal-header">
        <h2 id="invite-member-title" className="am-modal-title">Invite Team Member</h2>
        <Button
          type="button"
          variant="icon"
          size="icon"
          onClick={onClose}
          disabled={isInviting}
          aria-label="Close invite modal"
        >
          <X size={20} />
        </Button>
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
            <Input
              id="email"
              type="email"
              placeholder="colleague@company.com"
              value={inviteEmail}
              onChange={(event) => onEmailChange(event.target.value)}
              disabled={isInviting}
              required
            />
          </div>
        </div>
        <div className="am-modal-footer">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isInviting}
          >
                            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isInviting}
          >
            {isInviting ? 'Inviting...' : 'Send Invitation'}
          </Button>
        </div>
      </form>
    </div>
  )

  if (!canDismiss) {
    return <div className="am-modal-backdrop" role="presentation" aria-hidden="true">{modalContent}</div>
  }

  return (
    <div
      className="am-modal-backdrop"
      role="button"
      tabIndex={0}
      onClick={handleBackdropClick}
      onKeyDown={handleBackdropKeyDown}
    >
      {modalContent}
    </div>
  )
}
