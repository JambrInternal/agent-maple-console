import { mockFetch, apiFetch, API_CONFIG } from '../api/client';
import type { Organization } from '../api/types';
import { mockOrganizations, getMockOrganization } from '../mocks/organizations';

/**
 * Get all organizations for the current user
 */
export async function getOrganizations(): Promise<Organization[]> {
    if (API_CONFIG.useMocks) {
        return mockFetch(mockOrganizations);
    }

    // Real API call to Certly
    const response = await apiFetch<any>('/user/tenants');
    // Map Certly TenantResponse to our Organization type
    return response.data.map((tenant: any) => ({
        id: tenant.id.toString(),
        name: tenant.name || 'Unnamed Organization',
        projectCount: 0, // Need to fetch projects separately or use estimate
        createdAt: tenant.created_at
    }));
}

/**
 * Get a single organization by ID
 */
export async function getOrganization(id: string): Promise<Organization> {
    if (API_CONFIG.useMocks) {
        const org = getMockOrganization(id);
        if (!org) {
            throw new Error(`Organization not found: ${id}`);
        }
        return mockFetch(org);
    }

    // Real API call
    const response = await apiFetch<any>(`/admin/tenants/${id}`);
    const tenant = response.data;
    return {
        id: tenant.id.toString(),
        name: tenant.name,
        projectCount: 0,
        createdAt: tenant.created_at
    };
}
