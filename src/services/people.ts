// People Service (Contacts + Console Users)
import { apiFetch } from '../api/client';
import type { Contact, User } from '../api/types';
import {
    mapTenantUserToContact,
    mapTenantUserToConsoleUser,
    toConsoleRole,
    unwrapData,
    type ApiResponse,
    type ApiTenantUser,
} from '../api/mappers';

export type TeamInviteStatus = 'pending' | 'accepted' | 'expired';

export interface TeamInvite {
    id: string;
    email: string;
    role: User['role'];
    status: TeamInviteStatus;
    isUsed: boolean;
    createdAt: string | null;
    expiresAt: string | null;
    usedAt: string | null;
}

type ApiInvitationResponse = {
    id?: string | null;
    email?: string | null;
    role?: string | null;
    is_used?: boolean | null;
    expires_at?: string | null;
    used_at?: string | null;
    created_at?: string | null;
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
    const isUsed = invitation.is_used === true;
    const isExpired = !!expiresAt && new Date(expiresAt).getTime() < Date.now();
    const status: TeamInviteStatus = isUsed ? 'accepted' : isExpired ? 'expired' : 'pending';

    return {
        id: invitation.id || invitation.email || fallbackEmail || `${Date.now()}`,
        email: invitation.email || fallbackEmail,
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

export async function getContacts(tenantId: string): Promise<Contact[]> {
    const data = await listTenantUsers(tenantId);
    return data.map(mapTenantUserToContact);
}

export async function getContact(id: string, tenantId?: string): Promise<Contact> {
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

    const response = await apiFetch<ApiResponse<ApiInvitationResponse> | ApiInvitationResponse>('/tenants/send-invitation', {
        method: 'POST',
        headers: { 'x-tenant-id': tenantId },
        body: JSON.stringify({ email, role: backendRole }),
    });

    const invitation = unwrapData<ApiInvitationResponse>(response);
    return mapInvitationToTeamInvite(invitation, backendRole, email);
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
