// People Service (Contacts + Console Users)
import { apiFetch } from '../api/client';
import type { Contact, User } from '../api/types';
import {
    mapTenantUserToContact,
    mapTenantUserToConsoleUser,
    unwrapData,
    type ApiResponse,
    type ApiTenantUser,
} from '../api/mappers';

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
export async function inviteUser(email: string, _role: string, tenantId: string): Promise<void> {
    // All invited users are now assigned the INSTRUCTOR role by default
    const backendRole = 'INSTRUCTOR';

    await apiFetch('/tenants/send-invitation', {
        method: 'POST',
        headers: { 'x-tenant-id': tenantId },
        body: JSON.stringify({ email, role: backendRole }),
    });
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
