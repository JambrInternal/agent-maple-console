import type {
  AgentStatus,
  IssueStatus,
  KnowledgeSourceStatus,
  KnowledgeSourceType,
  ThreadStatus,
  UserRole,
} from '../types'
import type { ApiResponse } from './types'

export const toStringId = (value: unknown): string => {
  if (value === null || value === undefined) return ''
  return String(value)
}

export const toIsoString = (value: unknown): string => {
  if (typeof value !== 'string' || !value) return ''
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return ''
  return parsed.toISOString()
}

export const toIsoStringOrNull = (value: unknown): string | null => {
  const iso = toIsoString(value)
  return iso || null
}

export const toThreadStatus = (value: unknown): ThreadStatus => {
  switch (value) {
    case 'open':
    case 'needs_response':
    case 'waiting':
    case 'done':
      return value
    default:
      return 'open'
  }
}

export const toIssueStatus = (value: unknown): IssueStatus => {
  switch (value) {
    case 'open':
    case 'in_progress':
    case 'resolved':
      return value
    default:
      return 'open'
  }
}

export const toAgentStatus = (value: unknown): AgentStatus => {
  return value === 'online' ? 'online' : 'offline'
}

export const toKnowledgeStatus = (value: unknown): KnowledgeSourceStatus => {
  switch (value) {
    case 'NOT_STARTED':
      return 'pending'
    case 'IN_PROGRESS':
      return 'indexing'
    case 'COMPLETED':
      return 'ready'
    case 'FAILED':
      return 'error'
    default:
      return 'pending'
  }
}

export const toKnowledgeType = (source?: string | null, contentType?: string | null): KnowledgeSourceType => {
  const normalized = `${source || ''} ${contentType || ''}`.toLowerCase()
  if (normalized.includes('google')) return 'google_drive'
  if (normalized.includes('sharepoint') || normalized.includes('onedrive')) return 'sharepoint'
  if (normalized.includes('dropbox')) return 'dropbox'
  if (normalized.includes('pdf')) return 'pdf'
  if (normalized.includes('doc')) return 'doc'
  return 'pdf'
}

export const toConsoleRole = (role: string | null | undefined): UserRole => {
  switch (role) {
    case 'ADMIN':
      return 'admin'
    case 'INSTRUCTOR':
      return 'member'
    case 'LEARNER':
      return 'viewer'
    default:
      return 'viewer'
  }
}

export function unwrapData<T>(response: ApiResponse<T> | T, fallback?: T): T {
  if (response && typeof response === 'object' && 'data' in (response as ApiResponse<T>)) {
    const data = (response as ApiResponse<T>).data
    if (data === null || data === undefined) {
      if (fallback !== undefined) return fallback
      throw new Error('API response contained no data')
    }
    return data
  }

  if (response === null || response === undefined) {
    if (fallback !== undefined) return fallback
    throw new Error('API response contained no data')
  }

  return response as T
}
