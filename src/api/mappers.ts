import type {
    AgentStatus,
    Contact,
    Issue,
    IssueStatus,
    KnowledgeSource,
    KnowledgeSourceStatus,
    KnowledgeSourceType,
    Organization,
    Project,
    Thread,
    ThreadStatus,
    ThreadWithDetails,
    User,
    UserRole,
} from './types';

export type ApiResponse<T> = {
    code?: number;
    success?: boolean;
    message?: string;
    data?: T | null;
};

export type ApiOrganization = {
    id?: string | number | null;
    name?: string | null;
    project_count?: number | null;
    member_count?: number | null;
    created_at?: string | null;
};

export type ApiProject = {
    id?: string | number | null;
    tenant_id?: string | number | null;
    organization_id?: string | number | null;
    name?: string | null;
    thread_count?: number | null;
    issue_count?: number | null;
    last_activity_at?: string | null;
    created_at?: string | null;
    agent_status?: AgentStatus | string | null;
    agent?: {
        status?: AgentStatus | string | null;
    } | null;
};

export type ApiTenant = {
    id?: string | number | null;
    name?: string | null;
    description?: string | null;
    twilio_number?: string | null;
    is_disabled?: boolean | null;
    created_at?: string | null;
    updated_at?: string | null;
};

export type ApiThread = {
    id?: string | number | null;
    project_id?: string | number | null;
    user_id?: string | number | null;
    contact_id?: string | number | null;
    issue_id?: string | number | null;
    status?: ThreadStatus | string | null;
    subject?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    last_activity_at?: string | null;
};

export type ApiIssue = {
    id?: string | number | null;
    project_id?: string | number | null;
    title?: string | null;
    description?: string | null;
    status?: IssueStatus | string | null;
    thread_count?: number | null;
    resolved_at?: string | null;
    created_at?: string | null;
};

export type ApiUserResponse = {
    id?: string | null;
    username?: string | null;
    email?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    is_disabled?: boolean | null;
    is_supervisor?: boolean | null;
    thread_count?: number | null;
    reports_to_id?: string | null;
    reports_to?: unknown | null;
};

export type ApiTenantUser = {
    tenant_id?: number | string | null;
    user_id?: string | null;
    given_name?: string | null;
    family_name?: string | null;
    email?: string | null;
    phone_number?: string | null;
    role?: string | null;
    organization_role?: string | null;
    is_supervisor?: boolean | null;
    created_at?: string | null;
    updated_at?: string | null;
    company?: string | null;
};

export type ApiThreadDetail = ApiThread & {
    contact?: ApiUserResponse | null;
    issue?: ApiIssue | null;
};

export type ApiDatasource = {
    id?: number | string | null;
    tenant_id?: number | string | null;
    file_name?: string | null;
    content_type?: string | null;
    source?: string | null;
    embedding_status?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    file_hash?: string | null;
    file_size?: number | null;
    s3_url?: string | null;
    extra_metadata?: Record<string, any> | null;
    user_id?: string | null;
};

const toStringId = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    return String(value);
};

const toIsoString = (value: unknown): string => {
    if (typeof value !== 'string' || !value) return '';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return '';
    return parsed.toISOString();
};

const toIsoStringOrNull = (value: unknown): string | null => {
    const iso = toIsoString(value);
    return iso || null;
};

const toThreadStatus = (value: unknown): ThreadStatus => {
    switch (value) {
        case 'open':
        case 'needs_response':
        case 'waiting':
        case 'done':
            return value;
        default:
            return 'open';
    }
};

const toIssueStatus = (value: unknown): IssueStatus => {
    switch (value) {
        case 'open':
        case 'in_progress':
        case 'resolved':
            return value;
        default:
            return 'open';
    }
};

const toAgentStatus = (value: unknown): AgentStatus => {
    return value === 'online' ? 'online' : 'offline';
};

const toKnowledgeStatus = (value: unknown): KnowledgeSourceStatus => {
    switch (value) {
        case 'NOT_STARTED':
            return 'pending';
        case 'IN_PROGRESS':
            return 'indexing';
        case 'COMPLETED':
            return 'ready';
        case 'FAILED':
            return 'error';
        default:
            return 'pending';
    }
};

const toKnowledgeType = (source?: string | null, contentType?: string | null): KnowledgeSourceType => {
    const normalized = `${source || ''} ${contentType || ''}`.toLowerCase();
    if (normalized.includes('google')) return 'google_drive';
    if (normalized.includes('dropbox')) return 'dropbox';
    if (normalized.includes('pdf')) return 'pdf';
    if (normalized.includes('doc')) return 'doc';
    return 'pdf';
};

const toConsoleRole = (role: string | null | undefined): UserRole => {
    switch (role) {
        case 'ADMIN':
            return 'admin';
        case 'INSTRUCTOR':
            return 'member';
        case 'LEARNER':
            return 'viewer';
        default:
            return 'viewer';
    }
};

export function unwrapData<T>(response: ApiResponse<T> | T, fallback?: T): T {
    if (response && typeof response === 'object' && 'data' in (response as ApiResponse<T>)) {
        const data = (response as ApiResponse<T>).data;
        if (data === null || data === undefined) {
            if (fallback !== undefined) return fallback;
            throw new Error('API response contained no data');
        }
        return data;
    }

    if (response === null || response === undefined) {
        if (fallback !== undefined) return fallback;
        throw new Error('API response contained no data');
    }

    return response as T;
}

export function mapOrganizationResponse(org: ApiOrganization): Organization {
    return {
        id: toStringId(org.id),
        name: org.name || 'Unnamed Organization',
        projectCount: typeof org.project_count === 'number' ? org.project_count : undefined,
        memberCount: typeof org.member_count === 'number' ? org.member_count : undefined,
        createdAt: toIsoString(org.created_at),
    };
}

export function mapTenantToOrganization(tenant: ApiTenant): Organization {
    const id = toStringId(tenant.id);
    return {
        id,
        name: tenant.name || 'Unnamed Organization',
        projectCount: undefined,
        memberCount: undefined,
        createdAt: toIsoString(tenant.created_at),
    };
}

export function mapProjectResponse(project: ApiProject): Project {
    const status = project.agent?.status ?? project.agent_status;
    return {
        id: toStringId(project.id),
        organizationId: toStringId(project.tenant_id) || toStringId(project.organization_id),
        name: project.name || 'Unnamed Project',
        agentStatus: toAgentStatus(status),
        threadCount: typeof project.thread_count === 'number' ? project.thread_count : 0,
        issueCount: typeof project.issue_count === 'number' ? project.issue_count : 0,
        lastActivityAt: toIsoString(project.last_activity_at),
        createdAt: toIsoString(project.created_at),
    };
}

export function mapTenantToProject(tenant: ApiTenant): Project {
    const id = toStringId(tenant.id);
    const createdAt = toIsoString(tenant.created_at);
    const lastActivityAt = toIsoString(tenant.updated_at) || createdAt;

    return {
        id,
        organizationId: id,
        name: tenant.name || 'Unnamed Project',
        agentStatus: tenant.is_disabled ? 'offline' : 'online',
        threadCount: 0,
        issueCount: 0,
        lastActivityAt,
        createdAt,
    };
}

export function mapThreadResponse(thread: ApiThread): Thread {
    const lastMessageAt = toIsoString(thread.last_activity_at)
        || toIsoString(thread.updated_at)
        || toIsoString(thread.created_at);
    const contactId = toStringId(thread.user_id) || toStringId(thread.contact_id);

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
    };
}

export function mapIssueResponse(issue: ApiIssue): Issue {
    const createdAt = toIsoString(issue.created_at);
    const resolvedAt = toIsoStringOrNull(issue.resolved_at);

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
    };
}

export function mapUserResponseToContact(user: ApiUserResponse, projectId: string): Contact {
    const name = user.username || user.email || toStringId(user.id) || 'Unknown Contact';
    return {
        id: toStringId(user.id),
        projectId,
        name,
        phone: '',
        email: user.email || '',
        company: undefined,
        createdAt: toIsoString(user.created_at),
    };
}

export function mapTenantUserToContact(user: ApiTenantUser): Contact {
    const nameParts = [user.given_name, user.family_name].filter(Boolean).join(' ').trim();
    const name = nameParts || user.email || user.user_id || 'Unknown Contact';
    return {
        id: toStringId(user.user_id),
        projectId: toStringId(user.tenant_id),
        name,
        phone: user.phone_number || '',
        email: user.email || '',
        company: user.company || undefined,
        createdAt: toIsoString(user.created_at),
    };
}

export function mapTenantUserToConsoleUser(user: ApiTenantUser): User {
    const nameParts = [user.given_name, user.family_name].filter(Boolean).join(' ').trim();
    const name = nameParts || user.email || user.user_id || 'Unknown User';
    return {
        id: toStringId(user.user_id),
        email: user.email || '',
        name,
        role: toConsoleRole(user.role),
        organizationId: null,
        tenantId: toStringId(user.tenant_id) || null,
        mfaEnabled: false,
        createdAt: toIsoString(user.created_at),
    };
}

export function mapUserRecordResponse(user: ApiUserResponse, fallback?: User): User {
    const name = user.username || user.email || fallback?.name || fallback?.email || 'Unknown User';
    const role = fallback?.role || 'viewer';
    const organizationId = fallback?.organizationId || fallback?.tenantId || null;
    const createdAt = toIsoString(user.created_at) || fallback?.createdAt || '';

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
    };
}

export function mapThreadDetailResponse(thread: ApiThreadDetail): ThreadWithDetails {
    if (!thread.contact || !thread.issue) {
        throw new Error('Thread detail response missing contact or issue');
    }

    const base = mapThreadResponse(thread);

    return {
        ...base,
        contact: mapUserResponseToContact(thread.contact, base.projectId),
        issue: mapIssueResponse(thread.issue),
    };
}

export function mapDatasourceResponse(datasource: ApiDatasource): KnowledgeSource {
    return {
        id: toStringId(datasource.id),
        projectId: toStringId(datasource.tenant_id),
        name: datasource.file_name || 'Untitled Source',
        type: toKnowledgeType(datasource.source, datasource.content_type),
        status: toKnowledgeStatus(datasource.embedding_status),
        documentCount: 0,
        lastSyncAt: toIsoStringOrNull(datasource.updated_at),
        createdAt: toIsoString(datasource.created_at),
    };
}
