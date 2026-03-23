import type { Thread, ThreadWithDetails } from '../types'
import { mapIssueResponse } from './issues'
import { mapUserResponseToContact } from './people'
import { toIsoString, toStringId, toThreadStatus } from './shared'
import type { ApiThread, ApiThreadDetail } from './types'

export function mapThreadResponse(thread: ApiThread): Thread {
  const lastMessageAt = toIsoString(thread.last_activity_at)
        || toIsoString(thread.updated_at)
        || toIsoString(thread.created_at)
  const contactId = toStringId(thread.user_id) || toStringId(thread.contact_id)

  return {
    id: toStringId(thread.id),
    projectId: toStringId(thread.project_id),
    contactId,
    issueId: toStringId(thread.issue_id),
    status: toThreadStatus(thread.status),
    subject: thread.subject || 'Untitled Thread',
    lastMessageAt,
    createdAt: toIsoString(thread.created_at),
    updatedAt: toIsoString(thread.updated_at),
  }
}

export function mapThreadDetailResponse(thread: ApiThreadDetail): ThreadWithDetails {
  if (!thread.contact || !thread.issue) {
    throw new Error('Thread detail response missing contact or issue')
  }

  const base = mapThreadResponse(thread)

  return {
    ...base,
    contact: mapUserResponseToContact(thread.contact, base.projectId),
    issue: mapIssueResponse(thread.issue),
  }
}
