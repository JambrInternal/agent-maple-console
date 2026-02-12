// People Service (Contacts + Console Users)
import { apiFetch } from '../api/client';
import type { Contact, User } from '../api/types';
import { resolveTenantIdOrThrow, type ProjectFacadeScope } from './projectFacade';
import {
    mapTenantUserToContact,
    mapTenantUserToConsoleUser,
    toConsoleRole,
    unwrapData,
    type ApiAcceptInvitationRequest,
    type ApiInvitationResponse,
    type ApiResponse,
    type ApiSendInvitationRequest,
    type ApiTenantUser,
} from '../api/mappers';

export type TeamInviteStatus = 'pending' | 'accepted' | 'expired';

const ACCEPT_INVITE_ALIAS_FIELDS = ['invitation_token', 'invite_token'] as const;
type ProjectScopedInput = string | ProjectFacadeScope;

export interface TeamInvite {
    id: string;
    email: string;
    tenantId: string | null;
    role: User['role'];
    status: TeamInviteStatus;
    isUsed: boolean;
    createdAt: string | null;
    expiresAt: string | null;
    usedAt: string | null;
}

const VALIDATION_RETRY_STATUSES = new Set([400, 422]);

const getErrorStatusCode = (error: unknown): number | null => {
    if (!error || typeof error !== 'object') return null;
    const status = (error as { status?: unknown }).status;
    return typeof status === 'number' ? status : null;
};

const getMissingBodyFields = (error: unknown): Set<string> => {
    const missingFields = new Set<string>();

    if (!error || typeof error !== 'object') return missingFields;

    const details = (error as { details?: unknown }).details;
    if (details && typeof details === 'object') {
        const detailEntries = (details as { detail?: unknown }).detail;
        if (Array.isArray(detailEntries)) {
            for (const entry of detailEntries) {
                if (!entry || typeof entry !== 'object') continue;
                const type = (entry as { type?: unknown }).type;
                if (type !== 'missing') continue;
                const loc = (entry as { loc?: unknown }).loc;
                if (!Array.isArray(loc) || loc.length < 2) continue;
                if (loc[0] !== 'body' || typeof loc[1] !== 'string') continue;
                missingFields.add(loc[1]);
            }
        }
    }

    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string') {
        const lower = message.toLowerCase();
        if (lower.includes('invitation_token')) missingFields.add('invitation_token');
        if (lower.includes('invite_token')) missingFields.add('invite_token');
        if (lower.includes('"token"') || lower.includes(' token ')) missingFields.add('token');
    }

    return missingFields;
};

const getAliasFieldsToRetry = (error: unknown): Array<typeof ACCEPT_INVITE_ALIAS_FIELDS[number]> => {
    const status = getErrorStatusCode(error);
    if (!status || !VALIDATION_RETRY_STATUSES.has(status)) return [];

    const missingFields = getMissingBodyFields(error);
    if (missingFields.size === 0) return [];

    return ACCEPT_INVITE_ALIAS_FIELDS.filter((field) => missingFields.has(field));
};

const toIsoStringOrNull = (value: string | null | undefined): string | null => {
    if (!value) return null;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed.toISOString();
};

const mapInvitationToTeamInvite = (
    invitation: ApiInvitationResponse,
    fallbackRole: string,
    fallbackEmail: string
): TeamInvite => {
    const expiresAt = toIsoStringOrNull(invitation.expires_at);
    const createdAt = toIsoStringOrNull(invitation.created_at);
    const usedAt = toIsoStringOrNull(invitation.used_at);
    const isUsed = invitation.is_used === true || !!usedAt;
    const isExpired = !isUsed && !!expiresAt && new Date(expiresAt).getTime() < Date.now();
    const status: TeamInviteStatus = isUsed ? 'accepted' : isExpired ? 'expired' : 'pending';

    return {
        id: invitation.id || invitation.email || fallbackEmail || `${Date.now()}`,
        email: invitation.email || fallbackEmail,
        tenantId: invitation.tenant_id === null || invitation.tenant_id === undefined
            ? null
            : String(invitation.tenant_id),
        role: toConsoleRole(invitation.role || fallbackRole),
        status,
        isUsed,
        createdAt,
        expiresAt,
        usedAt,
    };
};

const listTenantUsers = async (tenantId?: string): Promise<ApiTenantUser[]> => {
    const response = await apiFetch<ApiResponse<ApiTenantUser[]>>('/tenants/users', {
        headers: tenantId ? { 'x-tenant-id': tenantId } : undefined,
    });
    return unwrapData(response, []);
};

const resolveTenantId = (input: ProjectScopedInput, context: string): string => {
    if (typeof input === 'string') {
        const tenantId = input.trim();
        if (!tenantId) {
            throw new Error(`Organization ID is required for ${context}.`);
        }
        return tenantId;
    }

    return resolveTenantIdOrThrow(input, context);
};

const resolveTenantIdOptional = (
    input: ProjectScopedInput | undefined,
    context: string
): string | undefined => {
    if (input === undefined) return undefined;
    return resolveTenantId(input, context);
};

export async function getContacts(scope: ProjectScopedInput): Promise<Contact[]> {
    const tenantId = resolveTenantId(scope, 'contact list');
    const data = await listTenantUsers(tenantId);
    return data.map(mapTenantUserToContact);
}

export async function getContact(id: string, scope?: ProjectScopedInput): Promise<Contact> {
    const tenantId = resolveTenantIdOptional(scope, 'contact lookup');
    const data = await listTenantUsers(tenantId);
    const contact = data.map(mapTenantUserToContact).find((item) => item.id === id);

    if (!contact) {
        throw new Error(`Contact not found: ${id}`);
    }

    return contact;
}

export async function getUsers(tenantId?: string): Promise<User[]> {
    const data = await listTenantUsers(tenantId);
    return data.map(mapTenantUserToConsoleUser);
}

export async function getUser(id: string, tenantId?: string): Promise<User> {
    const data = await listTenantUsers(tenantId);
    const user = data.map(mapTenantUserToConsoleUser).find((item) => item.id === id);

    if (!user) {
        throw new Error(`User not found: ${id}`);
    }

    return user;
}

/**
 * Invite a new user to the organization
 */
export async function inviteUser(email: string, tenantId: string): Promise<TeamInvite> {
    // All invited users are now assigned the INSTRUCTOR role by default
    const backendRole = 'INSTRUCTOR';

    const payload: ApiSendInvitationRequest = { email, role: backendRole };
    const response = await apiFetch<ApiResponse<ApiInvitationResponse> | ApiInvitationResponse>('/tenants/send-invitation', {
        method: 'POST',
        headers: { 'x-tenant-id': tenantId },
        body: JSON.stringify(payload),
    });

    const invitation = unwrapData<ApiInvitationResponse>(response);
    return mapInvitationToTeamInvite(invitation, backendRole, email);
}

export async function acceptInvitation(token: string): Promise<TeamInvite> {
    const normalizedToken = token.trim();
    const acceptWithPayload = async (payload: ApiAcceptInvitationRequest): Promise<TeamInvite> => {
        const response = await apiFetch<ApiResponse<ApiInvitationResponse> | ApiInvitationResponse>('/user/accept-invitation', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
        const invitation = unwrapData<ApiInvitationResponse>(response);
        return mapInvitationToTeamInvite(invitation, 'LEARNER', '');
    };

    if (!normalizedToken) {
        throw new Error('Invitation token is required.');
    }

    try {
        return await acceptWithPayload({ token: normalizedToken });
    } catch (error) {
        const aliasFieldsToRetry = getAliasFieldsToRetry(error);
        if (aliasFieldsToRetry.length === 0) {
            throw error;
        }

        let lastError: unknown = error;
        for (const field of aliasFieldsToRetry) {
            try {
                return await acceptWithPayload({ [field]: normalizedToken });
            } catch (retryError) {
                lastError = retryError;
            }
        }

        throw (lastError instanceof Error ? lastError : new Error('Failed to accept invitation.'));
    }
}

/**
 * Remove a user from the organization
 */
export async function removeUser(userId: string, tenantId: string): Promise<void> {
    await apiFetch(`/tenants/users/${userId}`, {
        method: 'DELETE',
        headers: { 'x-tenant-id': tenantId },
    });
}
