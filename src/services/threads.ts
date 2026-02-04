// Threads Service
import { mockFetch } from '../api/client';
import type { Thread, ThreadWithDetails, ThreadFilters } from '../api/types';
import { mockThreads, getMockThread, getMockThreadsByProject, getMockThreadsByIssue } from '../mocks/threads';
import { getMockContact } from '../mocks/contacts';
import { getMockIssue } from '../mocks/issues';
import { getMockMessagesByThread } from '../mocks/messages';

/**
 * Get all threads for a project with optional filters
 */
export async function getThreads(
    projectId: string,
    filters?: ThreadFilters
): Promise<Thread[]> {
    let threads = getMockThreadsByProject(projectId);

    if (filters?.status) {
        threads = threads.filter((t) => t.status === filters.status);
    }
    if (filters?.issueId) {
        threads = threads.filter((t) => t.issueId === filters.issueId);
    }
    if (filters?.contactId) {
        threads = threads.filter((t) => t.contactId === filters.contactId);
    }
    if (filters?.channel) {
        threads = threads.filter((t) => t.channels.includes(filters.channel!));
    }

    return mockFetch(threads);
}

/**
 * Get a single thread with full details (contact, issue, messages)
 */
export async function getThread(id: string): Promise<ThreadWithDetails> {
    const thread = getMockThread(id);
    if (!thread) {
        throw new Error(`Thread not found: ${id}`);
    }

    const contact = getMockContact(thread.contactId);
    const issue = getMockIssue(thread.issueId);
    const messages = getMockMessagesByThread(id);

    if (!contact || !issue) {
        throw new Error(`Thread data incomplete: ${id}`);
    }

    const threadWithDetails: ThreadWithDetails = {
        ...thread,
        contact,
        issue,
        messages,
    };

    return mockFetch(threadWithDetails);
}

/**
 * Get threads linked to a specific issue
 */
export async function getThreadsByIssue(issueId: string): Promise<Thread[]> {
    const threads = getMockThreadsByIssue(issueId);
    return mockFetch(threads);
}
