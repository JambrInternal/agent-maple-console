import { apiFetch, getErrorStatus } from '../api/client';
import type { CreateOrganizationRequest, Organization } from '../api/types';
import { mapTenantToOrganization, unwrapData, type ApiResponse, type ApiProject, type ApiTenant } from '../api/mappers';
import { getAdminMode, setAdminMode } from '../utils/admin';

type OrganizationOptions = {
    includeProjectCounts?: boolean;
};

const listAdminTenants = async (): Promise<ApiTenant[] | null> => {
    try {
        const response = await apiFetch<ApiResponse<ApiTenant[]>>('/admin/tenants');
        return unwrapData(response, []);
    } catch (error) {
        const status = getErrorStatus(error);
        if (status === 401 || status === 403) {
            setAdminMode(false);
            return null;
        }
        throw error;
    }
};

const listUserTenants = async (): Promise<ApiTenant[]> => {
    const response = await apiFetch<ApiResponse<ApiTenant[]>>('/user/tenants');
    return unwrapData(response, []);
};

/**
 * Get all organizations for the current user
 */
export async function getOrganizations(_options: OrganizationOptions = {}): Promise<Organization[]> {
    if (getAdminMode()) {
        const adminTenants = await listAdminTenants();
        if (adminTenants !== null) {
            return adminTenants.map(mapTenantToOrganization);
        }
    }

    const userTenants = await listUserTenants();
    return userTenants.map(mapTenantToOrganization);
}

/**
 * Get a single organization by ID
 */
export async function getOrganization(id: string): Promise<Organization> {
    const isAdmin = getAdminMode();
    if (isAdmin) {
        try {
            const adminResponse = await apiFetch<ApiResponse<ApiTenant>>(`/admin/tenants/${id}`);
            const adminTenant = unwrapData(adminResponse);
            return mapTenantToOrganization(adminTenant);
        } catch (error) {
            const status = getErrorStatus(error);
            if (status === 401 || status === 403) {
                setAdminMode(false);
            } else {
                throw error;
            }
        }
    }

    const data = await listUserTenants();
    const tenant = data.find((item) => String(item.id) === String(id));
    if (!tenant) {
        throw new Error(`Organization not found: ${id}`);
    }
    return mapTenantToOrganization(tenant);
}

/**
 * Create a new organization
 */
export async function createOrganization(request: CreateOrganizationRequest | string): Promise<Organization> {
    const isAdmin = getAdminMode();
    const endpoint = isAdmin ? '/admin/tenants' : '/user/tenants';

    const body = typeof request === 'string'
        ? { name: request }
        : {
            name: request.name,
            description: request.description,
            twilio_number: request.twilioNumber,
            obtain_twilio_phone_number: request.obtainTwilioPhoneNumber,
        };

    const response = await apiFetch<ApiResponse<ApiTenant>>(endpoint, {
        method: 'POST',
        body: JSON.stringify(body),
    });
    const data = unwrapData(response);
    return mapTenantToOrganization(data);
}
