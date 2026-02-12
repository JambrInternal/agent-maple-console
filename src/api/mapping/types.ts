import type { AgentStatus, IssueStatus, ThreadStatus } from '../types'

export type ApiId = string | number | null | undefined
export type ApiTimestamp = string | null | undefined
export type ApiNullableString = string | null | undefined
export type ApiNullableNumber = number | null | undefined
export type ApiNullableBoolean = boolean | null | undefined

export type ApiResponse<T> = {
    code?: number
    success?: boolean
    message?: string
    data?: T | null
}

export type ApiCreateTenantRequest = {
    name: string
    description?: string
    twilio_number?: string
    obtain_twilio_phone_number?: boolean
}

export type ApiCreateProjectRequest = {
    name: string
}

export type ApiTenantDisableRequest = {
    disabled: boolean
}

export type ApiSendInvitationRequest = {
    email: string
    role: string
}

export type ApiAcceptInvitationRequest = {
    token?: string
    invitation_token?: string
    invite_token?: string
}

export type ApiOrganization = {
    id?: ApiId
    name?: ApiNullableString
    project_count?: ApiNullableNumber
    member_count?: ApiNullableNumber
    twilio_number?: ApiNullableString
    created_at?: ApiTimestamp
}

export type ApiProject = {
    id?: ApiId
    tenant_id?: ApiId
    organization_id?: ApiId
    name?: ApiNullableString
    thread_count?: ApiNullableNumber
    issue_count?: ApiNullableNumber
    last_activity_at?: ApiTimestamp
    created_at?: ApiTimestamp
    agent_status?: AgentStatus | ApiNullableString
    agent?: {
        status?: AgentStatus | ApiNullableString
    } | null
}

export type ApiTenant = {
    id?: ApiId
    name?: ApiNullableString
    description?: ApiNullableString
    twilio_number?: ApiNullableString
    is_disabled?: ApiNullableBoolean
    projects_count?: ApiNullableNumber
    created_at?: ApiTimestamp
    updated_at?: ApiTimestamp
}

export type ApiThread = {
    id?: ApiId
    project_id?: ApiId
    user_id?: ApiId
    contact_id?: ApiId
    issue_id?: ApiId
    status?: ThreadStatus | ApiNullableString
    subject?: ApiNullableString
    created_at?: ApiTimestamp
    updated_at?: ApiTimestamp
    last_activity_at?: ApiTimestamp
}

export type ApiIssue = {
    id?: ApiId
    project_id?: ApiId
    title?: ApiNullableString
    description?: ApiNullableString
    status?: IssueStatus | ApiNullableString
    thread_count?: ApiNullableNumber
    resolved_at?: ApiTimestamp
    created_at?: ApiTimestamp
}

export type ApiUserResponse = {
    id?: ApiNullableString
    username?: ApiNullableString
    email?: ApiNullableString
    created_at?: ApiTimestamp
    updated_at?: ApiTimestamp
    is_disabled?: ApiNullableBoolean
    is_supervisor?: ApiNullableBoolean
    thread_count?: ApiNullableNumber
    reports_to_id?: ApiNullableString
    reports_to?: unknown | null
}

export type ApiTenantUser = {
    tenant_id?: ApiId
    user_id?: ApiNullableString
    given_name?: ApiNullableString
    family_name?: ApiNullableString
    email?: ApiNullableString
    phone_number?: ApiNullableString
    role?: ApiNullableString
    organization_role?: ApiNullableString
    is_supervisor?: ApiNullableBoolean
    created_at?: ApiTimestamp
    updated_at?: ApiTimestamp
    company?: ApiNullableString
}

export type ApiThreadDetail = ApiThread & {
    contact?: ApiUserResponse | null
    issue?: ApiIssue | null
}

export type ApiDatasource = {
    id?: ApiId
    tenant_id?: ApiId
    file_name?: ApiNullableString
    content_type?: ApiNullableString
    source?: ApiNullableString
    embedding_status?: ApiNullableString
    created_at?: ApiTimestamp
    updated_at?: ApiTimestamp
    file_hash?: ApiNullableString
    file_size?: ApiNullableNumber
    s3_url?: ApiNullableString
    extra_metadata?: Record<string, unknown> | null
    user_id?: ApiNullableString
}

export type ApiInvitationResponse = {
    id?: ApiNullableString
    email?: ApiNullableString
    tenant_id?: ApiId
    role?: ApiNullableString
    is_used?: ApiNullableBoolean
    expires_at?: ApiTimestamp
    used_at?: ApiTimestamp
    created_at?: ApiTimestamp
}
