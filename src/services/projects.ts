// Projects Service
import { mockFetch } from '../api/client';
import type { Project, AgentStatus } from '../api/types';
import { mockProjects, getMockProject, getMockProjectsByOrg } from '../mocks/projects';

/**
 * Get all projects for an organization
 */
export async function getProjects(organizationId: string): Promise<Project[]> {
    const projects = getMockProjectsByOrg(organizationId);
    return mockFetch(projects);
}

/**
 * Get a single project by ID
 */
export async function getProject(id: string): Promise<Project> {
    const project = getMockProject(id);
    if (!project) {
        throw new Error(`Project not found: ${id}`);
    }
    return mockFetch(project);
}

/**
 * Update project agent status
 */
export async function updateProjectStatus(
    id: string,
    status: AgentStatus
): Promise<Project> {
    const project = getMockProject(id);
    if (!project) {
        throw new Error(`Project not found: ${id}`);
    }
    // In mock, just return with updated status
    const updated = { ...project, agentStatus: status };
    return mockFetch(updated);
}
