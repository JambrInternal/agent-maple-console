import { apiFetch, getErrorStatus } from '../api/client';
import type { Organization } from '../api/types';
import { mapTenantToOrganization, unwrapData, type ApiResponse, type ApiProject, type ApiTenant } from '../api/mappers';
import { getAdminMode, setAdminMode } from '../utils/admin';

type OrganizationOptions = {
    includeProjectCounts?: boolean;
};

const listAdminTenants = async (): Promise<ApiTenant[] | null> => {
    try {
        const response = await apiFetch<ApiResponse<ApiTenant[]>>('/admin/tenants');
        const data = unwrapData(response, []);
        setAdminMode(true);
        return data;
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
export async function getOrganizations(options: OrganizationOptions = {}): Promise<Organization[]> {
    const includeProjectCounts = options.includeProjectCounts ?? true;
    const adminTenants = await listAdminTenants();
    const data = adminTenants ?? (await listUserTenants());
    const baseOrgs = data.map(mapTenantToOrganization);

    if (!includeProjectCounts) {
        return baseOrgs;
    }

    const counts = await Promise.all(
        baseOrgs.map(async (org) => {
            if (!org.id) return org;
            try {
                const projectsResponse = await apiFetch<ApiResponse<ApiProject[]>>(
                    `/projects/tenant/${org.id}`
                );
                const projects = unwrapData(projectsResponse, []);
                return { ...org, projectCount: projects.length };
            } catch (error) {
                console.warn(`Failed to load projects for organization ${org.id}:`, error);
                return org;
            }
        })
    );
    return counts;
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
            const org = mapTenantToOrganization(adminTenant);
            try {
                const projectsResponse = await apiFetch<ApiResponse<ApiProject[]>>(`/projects/tenant/${org.id}`);
                const projects = unwrapData(projectsResponse, []);
                return { ...org, projectCount: projects.length };
            } catch (error) {
                console.warn(`Failed to load projects for organization ${org.id}:`, error);
                return org;
            }
        } catch (error) {
            const status = getErrorStatus(error);
            if (status !== 401 && status !== 403) {
                throw error;
            }
        }
    }

    const data = await listUserTenants();
    const tenant = data.find((item) => String(item.id) === String(id));
    if (!tenant) {
        throw new Error(`Organization not found: ${id}`);
    }
    const org = mapTenantToOrganization(tenant);
    try {
        const projectsResponse = await apiFetch<ApiResponse<ApiProject[]>>(`/projects/tenant/${org.id}`);
        const projects = unwrapData(projectsResponse, []);
        return { ...org, projectCount: projects.length };
    } catch (error) {
        console.warn(`Failed to load projects for organization ${org.id}:`, error);
        return org;
    }
}

/**
 * Create a new organization
 */
export async function createOrganization(name: string): Promise<Organization> {
    const endpoint = getAdminMode() ? '/admin/tenants' : '/user/tenants';
    const response = await apiFetch<ApiResponse<ApiTenant>>(endpoint, {
        method: 'POST',
        body: JSON.stringify({ name }),
    });
    const data = unwrapData(response);
    return mapTenantToOrganization(data);
}
