import React from 'react'
import { Plus } from 'lucide-react'
import { Button } from '../../../../components/ui'

export default function TeamManagementHeader({ onInviteClick }) {
  return (
    <div className="am-page-header">
      <div>
        <h1 className="am-page-title">Team Management</h1>
        <p className="am-page-subtitle">
                    Manage roles and access for your organization.
        </p>
      </div>
      <Button
        type="button"
        variant="primary"
        onClick={onInviteClick}
      >
        <Plus size={16} />
        <span>Invite Member</span>
      </Button>
    </div>
  )
}
