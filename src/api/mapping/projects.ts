import type { Project } from '../types'
import { toAgentStatus, toIsoString, toStringId } from './shared'
import type { ApiProject, ApiTenant } from './types'

export function mapProjectResponse(project: ApiProject): Project {
  const status = project.agent?.status ?? project.agent_status
  return {
    id: toStringId(project.id),
    organizationId: toStringId(project.tenant_id) || toStringId(project.organization_id),
    name: project.name || 'Unnamed Project',
    agentStatus: toAgentStatus(status),
    threadCount: typeof project.thread_count === 'number' ? project.thread_count : 0,
    issueCount: typeof project.issue_count === 'number' ? project.issue_count : 0,
    lastActivityAt: toIsoString(project.last_activity_at),
    createdAt: toIsoString(project.created_at),
  }
}

export function mapTenantToProject(tenant: ApiTenant): Project {
  const id = toStringId(tenant.id)
  const createdAt = toIsoString(tenant.created_at)
  const lastActivityAt = toIsoString(tenant.updated_at) || createdAt

  return {
    id,
    organizationId: id,
    name: tenant.name || 'Unnamed Project',
    agentStatus: tenant.is_disabled ? 'offline' : 'online',
    threadCount: 0,
    issueCount: 0,
    lastActivityAt,
    createdAt,
  }
}
