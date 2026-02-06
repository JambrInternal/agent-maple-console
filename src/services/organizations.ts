import { apiFetch } from '../api/client';
import type { Organization } from '../api/types';
import { mapOrganizationResponse, unwrapData, type ApiOrganization, type ApiResponse } from '../api/mappers';

/**
 * Get all organizations for the current user
 */
export async function getOrganizations(): Promise<Organization[]> {
    const response = await apiFetch<ApiResponse<ApiOrganization[]>>('/organizations');
    const data = unwrapData(response, []);
    return data.map(mapOrganizationResponse);
}

/**
 * Get a single organization by ID
 */
export async function getOrganization(id: string): Promise<Organization> {
    const response = await apiFetch<ApiResponse<ApiOrganization>>(`/organizations/${id}`);
    const data = unwrapData(response);
    return mapOrganizationResponse(data);
}
