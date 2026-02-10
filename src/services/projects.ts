// Projects Service
import { apiFetch, getErrorStatus } from '../api/client';
import logger from '../utils/verboseLogger';
import type { Project, AgentStatus } from '../api/types';
import { mapProjectResponse, mapTenantToProject, unwrapData, type ApiResponse, type ApiProject, type ApiTenant } from '../api/mappers';

/**
 * Get all projects for an organization.
 * Note: Uses the tenant-scoped projects list endpoint.
 */
export async function getProjects(organizationId: string): Promise<Project[]> {
    if (!organizationId) {
        logger.error('getProjects called without organizationId');
        return [];
    }
    logger.info('Fetching projects for organization', { organizationId });
    // Endpoint capability detection: probe
    try {
        const response = await apiFetch<ApiResponse<ApiProject[]>>(`/projects/tenant/${organizationId}`);
        logger.debug('Raw projects response', response);
        const data = unwrapData(response, []);
        logger.info('Projects fetched', { count: data.length });
        return data.map(mapProjectResponse);
    } catch (error) {
        const status = getErrorStatus(error);
        if (status === 404) {
            logger.warn('Projects endpoint not supported, returning empty list');
            return [];
        }
        throw error;
    }
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
        logger.error('createProject called without organizationId');
        throw new Error('Organization ID is required to create a project');
    }
    logger.info('Creating project via API', { organizationId, name });
    const response = await apiFetch<ApiResponse<ApiProject>>(`/projects/tenant/${organizationId}`, {
        method: 'POST',
        body: JSON.stringify({ name }),
    });
    logger.debug('Raw createProject response', response);
    const data = unwrapData(response);
    logger.info('Project created via API', { id: data?.id, name: data?.name });
    return mapProjectResponse(data);
}

/**
 * Get a single project by ID
 */
export async function getProject(id: string): Promise<Project> {
    logger.info('Fetching project by ID', { id });
    try {
        const response = await apiFetch<ApiResponse<ApiProject>>(`/projects/${id}`);
        logger.debug('Raw getProject response', response);
        const data = unwrapData(response);
        logger.info('Project fetched', { id: data?.id, name: data?.name });
        return mapProjectResponse(data);
    } catch (error) {
        const status = getErrorStatus(error);
        logger.error('Error fetching project by ID', { id, error, status });
        if (status && status !== 404 && status !== 501) {
            throw error;
        }
    }

    logger.info('Fallback: fetching user tenants to find project', { id });
    const response = await apiFetch<ApiResponse<ApiTenant[]>>('/user/tenants');
    logger.debug('Raw tenants response', response);
    const data = unwrapData(response, []);
    const tenant = data.find((item) => String(item.id) === String(id));
    if (!tenant) {
        logger.error('Project not found in tenants', { id });
        throw new Error(`Project not found: ${id}`);
    }
    logger.info('Project found in tenants', { id: tenant.id, name: tenant.name });
    return mapTenantToProject(tenant);
}

/**
 * Update project agent status
 */
export async function updateProjectStatus(
    id: string,
    status: AgentStatus
): Promise<Project> {
    logger.info('Updating project status', { id, status });
    const disabled = status === 'offline';
    const project = await getProject(id);
    const tenantId = project.organizationId || id;
    logger.debug('Disabling/enabling tenant', { tenantId, disabled });
    await apiFetch(`/admin/tenants/${tenantId}/disable`, {
        method: 'POST',
        body: JSON.stringify({ disabled }),
    });

    try {
        const updated = await getProject(id);
        logger.info('Project status updated', { id, status });
        return updated;
    } catch (error) {
        logger.error('Error updating project status, fallback to admin/tenants', { id, error });
        const response = await apiFetch<ApiResponse<ApiTenant>>(`/admin/tenants/${tenantId}`);
        logger.debug('Raw admin/tenants response', response);
        const data = unwrapData(response);
        return mapTenantToProject(data);
    }
}
