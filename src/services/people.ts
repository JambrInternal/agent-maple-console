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

const listTenantUsers = async (projectId?: string): Promise<ApiTenantUser[]> => {
    const response = await apiFetch<ApiResponse<ApiTenantUser[]>>('/tenants/users', {
        headers: projectId ? { 'x-tenant-id': projectId } : undefined,
    });
    return unwrapData(response, []);
};

export async function getContacts(projectId: string): Promise<Contact[]> {
    const data = await listTenantUsers(projectId);
    return data.map(mapTenantUserToContact);
}

export async function getContact(id: string, projectId?: string): Promise<Contact> {
    const data = await listTenantUsers(projectId);
    const contact = data.map(mapTenantUserToContact).find((item) => item.id === id);

    if (!contact) {
        throw new Error(`Contact not found: ${id}`);
    }

    return contact;
}

export async function getUsers(projectId?: string): Promise<User[]> {
    const data = await listTenantUsers(projectId);
    return data.map(mapTenantUserToConsoleUser);
}

export async function getUser(id: string, projectId?: string): Promise<User> {
    const data = await listTenantUsers(projectId);
    const user = data.map(mapTenantUserToConsoleUser).find((item) => item.id === id);

    if (!user) {
        throw new Error(`User not found: ${id}`);
    }

    return user;
}
