// Issues Service
import { mockFetch } from '../api/client';
import type { Issue, IssueWithThreads } from '../api/types';
import { mockIssues, getMockIssue, getMockIssuesByProject } from '../mocks/issues';
import { getMockUser } from '../mocks/users';
import { getMockThreadsByIssue } from '../mocks/threads';

/**
 * Get all issues for a project
 */
export async function getIssues(projectId: string): Promise<Issue[]> {
    const issues = getMockIssuesByProject(projectId);
    return mockFetch(issues);
}

/**
 * Get a single issue with linked threads and owner
 */
export async function getIssue(id: string): Promise<IssueWithThreads> {
    const issue = getMockIssue(id);
    if (!issue) {
        throw new Error(`Issue not found: ${id}`);
    }

    const threads = getMockThreadsByIssue(id);
    const owner = issue.ownerId ? getMockUser(issue.ownerId) : null;

    const issueWithThreads: IssueWithThreads = {
        ...issue,
        threads,
        owner: owner || null,
    };

    return mockFetch(issueWithThreads);
}


