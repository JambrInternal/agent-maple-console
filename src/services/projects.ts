// Projects Service
import { apiFetch } from '../api/client';
import type { Project, AgentStatus } from '../api/types';
import { mapProjectResponse, unwrapData, type ApiProject, type ApiResponse } from '../api/mappers';

/**
 * Get all projects for an organization
 */
export async function getProjects(organizationId: string): Promise<Project[]> {
    const response = await apiFetch<ApiResponse<ApiProject[]>>(`/organizations/${organizationId}/projects`);
    const data = unwrapData(response, []);
    return data.map(mapProjectResponse);
}

/**
 * Create a new project for an organization
 */
export async function createProject(
    organizationId: string,
    name: string
): Promise<Project> {
    const response = await apiFetch<ApiResponse<ApiProject>>(
        `/organizations/${organizationId}/projects`,
        {
            method: 'POST',
            body: JSON.stringify({ name }),
        }
    );
    const data = unwrapData(response);
    return mapProjectResponse(data);
}

/**
 * Get a single project by ID
 */
export async function getProject(id: string): Promise<Project> {
    const response = await apiFetch<ApiResponse<ApiProject>>(`/projects/${id}`);
    const data = unwrapData(response);
    return mapProjectResponse(data);
}

/**
 * Update project agent status
 */
export async function updateProjectStatus(
    id: string,
    status: AgentStatus
): Promise<Project> {
    const disabled = status === 'offline';
    await apiFetch(`/admin/tenants/${id}/disable`, {
        method: 'POST',
        body: JSON.stringify({ disabled }),
    });

    const response = await apiFetch<ApiResponse<ApiProject>>(`/projects/${id}`);
    const data = unwrapData(response);
    return mapProjectResponse(data);
}
