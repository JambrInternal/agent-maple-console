import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import InviteMemberModal from '../../features/team/components/InviteMemberModal/InviteMemberModal'
import TeamManagementHeader from '../../features/team/components/TeamManagementHeader/TeamManagementHeader'
import TeamMembersTable from '../../features/team/components/TeamMembersTable/TeamMembersTable'
import {
  filterOutKnownMemberInvites,
  normalizeEmail,
  readPendingInvites,
  removeInviteByEmail,
  upsertInviteByEmail,
  writePendingInvites,
} from '../../features/team/teamInviteStorage'
import {
  buildTeamRows,
} from '../../features/team/teamRowUtils'
import { getUsers, inviteUser } from '../../services/people'
import { useApiQuery } from '../../hooks/useApiQuery'
import { withStatus } from '../../utils/errors'
import QueryError from '../../components/QueryError/QueryError'
import logger from '../../utils/verboseLogger'

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
    const filtered = filterOutKnownMemberInvites(pendingInvites, memberEmailSet)
    if (filtered.length === pendingInvites.length) return
    setPendingInvites(filtered)
    pendingInvitesOrgIdRef.current = orgId
  }, [memberEmailSet, orgId, pendingInvites])

  useEffect(() => {
    if (!orgId) return
    if (pendingInvitesOrgIdRef.current !== orgId) return
    writePendingInvites(orgId, pendingInvites)
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
    return buildTeamRows({ members, pendingInvites, memberEmailSet })
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
      setPendingInvites((prev) => upsertInviteByEmail(prev, invitation))
      pendingInvitesOrgIdRef.current = orgId
      setInviteEmail('')
      setIsInviteOpen(false)
      refetch()
    } catch (err) {
      logger.error('Failed to invite user:', err)
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
      setPendingInvites((prev) => upsertInviteByEmail(prev, invitation))
      pendingInvitesOrgIdRef.current = orgId
      refetch()
    } catch (err) {
      logger.error('Failed to resend invite:', err)
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
    setPendingInvites((prev) => removeInviteByEmail(prev, email))
    pendingInvitesOrgIdRef.current = orgId
  }

  const handleOpenInviteModal = () => {
    setInviteEmail('')
    setInviteError('')
    setIsInviteOpen(true)
  }

  const handleToggleInviteMenu = (memberId) => {
    setOpenInviteMenuId((current) => current === memberId ? null : memberId)
  }

  return (
    <div className="am-page-content">
      <div className="am-contacts-container">
        <TeamManagementHeader onInviteClick={handleOpenInviteModal} />

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
          <TeamMembersTable
            rows={rows}
            inviteActionError={inviteActionError}
            openInviteMenuId={openInviteMenuId}
            isInviteActionBusy={isInviteActionBusy}
            onToggleInviteMenu={handleToggleInviteMenu}
            onResendInvite={handleResendInvite}
            onCancelInvite={handleCancelInvite}
          />
        )}
      </div>

      <InviteMemberModal
        isOpen={isInviteOpen}
        isInviting={isInviting}
        inviteEmail={inviteEmail}
        inviteError={inviteError}
        onEmailChange={setInviteEmail}
        onClose={() => setIsInviteOpen(false)}
        onSubmit={handleInvite}
      />
    </div>
  )
}

export default OrgTeam
