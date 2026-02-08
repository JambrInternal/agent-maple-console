// Threads Service
import { apiFetch } from '../api/client';
import type { Thread, ThreadWithDetails, ThreadFilters } from '../api/types';
import { mapThreadDetailResponse, mapThreadResponse, unwrapData, type ApiResponse, type ApiThread, type ApiThreadDetail, type ApiIssue } from '../api/mappers';

/**
 * Get all threads for a project with optional filters
 */
export async function getThreads(
    projectId: string,
    filters?: ThreadFilters
): Promise<Thread[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.issueId) params.set('issue_id', filters.issueId);
    if (filters?.contactId) params.set('user_id', filters.contactId);
    const query = params.toString();

    const response = await apiFetch<ApiResponse<ApiThread[]>>(
        `/projects/${projectId}/threads${query ? `?${query}` : ''}`
    );
    const data = unwrapData(response, []);
    return data.map(mapThreadResponse);
}

/**
 * Get a single thread with full details (contact, issue)
 */
export async function getThread(id: string): Promise<ThreadWithDetails> {
    const response = await apiFetch<ApiResponse<ApiThreadDetail>>(`/threads/${id}`);
    const data = unwrapData(response);
    return mapThreadDetailResponse(data);
}

/**
 * Get threads linked to a specific issue
 */
export async function getThreadsByIssue(issueId: string): Promise<Thread[]> {
    const issueResponse = await apiFetch<ApiResponse<ApiIssue>>(`/issues/${issueId}`);
    const issue = unwrapData(issueResponse);
    const projectId = issue?.project_id ? String(issue.project_id) : '';

    if (!projectId) {
        throw new Error(`Issue ${issueId} missing project_id for thread lookup`);
    }

    return getThreads(projectId, { issueId });
}
