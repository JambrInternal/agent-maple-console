import type { Contact, User } from '../types'
import { toConsoleRole, toIsoString, toStringId } from './shared'
import type { ApiTenantUser, ApiUserResponse } from './types'

export function mapUserResponseToContact(user: ApiUserResponse, projectId: string): Contact {
    const name = user.username || user.email || toStringId(user.id) || 'Unknown Contact'
    return {
        id: toStringId(user.id),
        projectId,
        name,
        phone: '',
        email: user.email || '',
        company: undefined,
        createdAt: toIsoString(user.created_at),
    }
}

export function mapTenantUserToContact(user: ApiTenantUser): Contact {
    const nameParts = [user.given_name, user.family_name].filter(Boolean).join(' ').trim()
    const name = nameParts || user.email || user.user_id || 'Unknown Contact'
    return {
        id: toStringId(user.user_id),
        projectId: toStringId(user.tenant_id),
        name,
        phone: user.phone_number || '',
        email: user.email || '',
        company: user.company || undefined,
        createdAt: toIsoString(user.created_at),
    }
}

export function mapTenantUserToConsoleUser(user: ApiTenantUser): User {
    const nameParts = [user.given_name, user.family_name].filter(Boolean).join(' ').trim()
    const name = nameParts || user.email || user.user_id || 'Unknown User'
    return {
        id: toStringId(user.user_id),
        email: user.email || '',
        name,
        role: toConsoleRole(user.role),
        organizationId: null,
        tenantId: toStringId(user.tenant_id) || null,
        mfaEnabled: false,
        createdAt: toIsoString(user.created_at),
    }
}

export function mapUserRecordResponse(user: ApiUserResponse, fallback?: User): User {
    const name = user.username || user.email || fallback?.name || fallback?.email || 'Unknown User'
    const role = fallback?.role || 'viewer'
    const organizationId = fallback?.organizationId || fallback?.tenantId || null
    const createdAt = toIsoString(user.created_at) || fallback?.createdAt || ''

    return {
        id: toStringId(user.id) || fallback?.id || '',
        email: user.email || fallback?.email || '',
        name,
        role,
        organizationId,
        tenantId: fallback?.tenantId || null,
        avatarUrl: fallback?.avatarUrl,
        mfaEnabled: fallback?.mfaEnabled ?? false,
        createdAt,
    }
}
