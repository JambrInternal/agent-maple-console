// Issues Service
import { apiFetch } from '../api/client';
import type { Issue, IssueWithThreads } from '../api/types';
import { mapIssueResponse, unwrapData, type ApiIssue, type ApiResponse } from '../api/mappers';
import { getThreads } from './threads';

/**
 * Get all issues for a project
 */
export async function getIssues(projectId: string): Promise<Issue[]> {
  const response = await apiFetch<ApiResponse<ApiIssue[]>>(`/projects/${projectId}/issues`);
  const data = unwrapData(response, []);
  return data.map(mapIssueResponse);
}

/**
 * Get a single issue with linked threads and owner
 */
export async function getIssue(id: string): Promise<IssueWithThreads> {
  const response = await apiFetch<ApiResponse<ApiIssue>>(`/issues/${id}`);
  const data = unwrapData(response);
  const issue = mapIssueResponse(data);
  const threads = await getThreads(issue.projectId, { issueId: issue.id });

  return {
    ...issue,
    threads,
    owner: null,
  };
}
