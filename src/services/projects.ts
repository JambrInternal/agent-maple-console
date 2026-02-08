// Projects Service
import { apiFetch, getErrorStatus } from '../api/client';
import type { Project, AgentStatus } from '../api/types';
import { mapProjectResponse, mapTenantToProject, unwrapData, type ApiResponse, type ApiProject, type ApiTenant } from '../api/mappers';

/**
 * Get all projects for an organization.
 * Note: Uses the tenant-scoped projects list endpoint.
 */
export async function getProjects(organizationId: string): Promise<Project[]> {
    if (!organizationId) return [];
    const response = await apiFetch<ApiResponse<ApiProject[]>>(`/projects/tenant/${organizationId}`);
    const data = unwrapData(response, []);
    return data.map(mapProjectResponse);
}

/**
 * Create a new project for an organization.
 * Note: Uses the tenant-scoped project create endpoint.
 */
export async function createProject(
    organizationId: string,
    name: string
): Promise<Project> {
    if (!organizationId) {
        throw new Error('Organization ID is required to create a project');
    }
    const response = await apiFetch<ApiResponse<ApiProject>>(`/projects/tenant/${organizationId}`, {
        method: 'POST',
        body: JSON.stringify({ name }),
    });
    const data = unwrapData(response);
    return mapProjectResponse(data);
}

/**
 * Get a single project by ID
 */
export async function getProject(id: string): Promise<Project> {
    try {
        const response = await apiFetch<ApiResponse<ApiProject>>(`/projects/${id}`);
        const data = unwrapData(response);
        return mapProjectResponse(data);
    } catch (error) {
        const status = getErrorStatus(error);
        if (status && status !== 404 && status !== 501) {
            throw error;
        }
    }

    const response = await apiFetch<ApiResponse<ApiTenant[]>>('/user/tenants');
    const data = unwrapData(response, []);
    const tenant = data.find((item) => String(item.id) === String(id));
    if (!tenant) {
        throw new Error(`Project not found: ${id}`);
    }
    return mapTenantToProject(tenant);
}

/**
 * Update project agent status
 */
export async function updateProjectStatus(
    id: string,
    status: AgentStatus
): Promise<Project> {
    const disabled = status === 'offline';
    const project = await getProject(id);
    const tenantId = project.organizationId || id;
    await apiFetch(`/admin/tenants/${tenantId}/disable`, {
        method: 'POST',
        body: JSON.stringify({ disabled }),
    });

    try {
        return await getProject(id);
    } catch (error) {
        const response = await apiFetch<ApiResponse<ApiTenant>>(`/admin/tenants/${tenantId}`);
        const data = unwrapData(response);
        return mapTenantToProject(data);
    }
}
