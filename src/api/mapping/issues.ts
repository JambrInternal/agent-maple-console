import type { Issue } from '../types'
import { toIsoString, toIsoStringOrNull, toIssueStatus, toStringId } from './shared'
import type { ApiIssue } from './types'

export function mapIssueResponse(issue: ApiIssue): Issue {
    const createdAt = toIsoString(issue.created_at)
    const resolvedAt = toIsoStringOrNull(issue.resolved_at)

    return {
        id: toStringId(issue.id),
        projectId: toStringId(issue.project_id),
        title: issue.title || 'Untitled Issue',
        description: issue.description || '',
        status: toIssueStatus(issue.status),
        ownerId: null,
        threadCount: typeof issue.thread_count === 'number' ? issue.thread_count : 0,
        firstOccurrenceAt: createdAt,
        lastOccurrenceAt: resolvedAt || createdAt,
        resolvedAt,
        createdAt,
    }
}
