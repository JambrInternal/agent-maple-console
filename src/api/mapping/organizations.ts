import type { Organization } from '../types'
import { toIsoString, toStringId } from './shared'
import type { ApiOrganization, ApiTenant } from './types'

export function mapOrganizationResponse(org: ApiOrganization): Organization {
    return {
        id: toStringId(org.id),
        name: org.name || 'Unnamed Organization',
        projectCount: org.project_count,
        memberCount: typeof org.member_count === 'number' ? org.member_count : undefined,
        createdAt: toIsoString(org.created_at),
    }
}

export function mapTenantToOrganization(tenant: ApiTenant): Organization {
    const id = toStringId(tenant.id)
    return {
        id,
        name: tenant.name || 'Unnamed Organization',
        projectCount: typeof tenant.projects_count === 'number' ? tenant.projects_count : undefined,
        memberCount: undefined,
        createdAt: toIsoString(tenant.created_at),
    }
}
