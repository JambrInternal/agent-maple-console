import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getThread, getThreads, getThreadsByIssue } from '../threads';
import { apiFetch } from '../../api/client';

vi.mock('../../api/client', () => ({
    API_CONFIG: { baseUrl: '' },
    apiFetch: vi.fn(),
}));

describe('threads service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('lists threads with filters', async () => {
        vi.mocked(apiFetch).mockResolvedValue({
            data: [
                {
                    id: 'thread_1',
                    project_id: 'proj_1',
                    user_id: 'user_1',
                    issue_id: 'issue_1',
                    status: 'open',
                    subject: 'Question',
                    created_at: '2026-02-01T00:00:00Z',
                    updated_at: '2026-02-02T00:00:00Z',
                    last_activity_at: '2026-02-02T00:00:00Z',
                },
            ],
        });

        const result = await getThreads('proj_1', {
            status: 'open',
            issueId: 'issue_1',
            contactId: 'user_1',
        });

        expect(apiFetch).toHaveBeenCalledWith(
            '/projects/proj_1/threads?status=open&issue_id=issue_1&user_id=user_1',
            { headers: { 'x-tenant-id': 'proj_1' } }
        );
        expect(result[0].id).toBe('thread_1');
        expect(result[0].projectId).toBe('proj_1');
        expect(result[0].contactId).toBe('user_1');
    });

    it('gets a thread with details', async () => {
        vi.mocked(apiFetch).mockResolvedValue({
            data: {
                id: 'thread_2',
                project_id: 'proj_2',
                user_id: 'user_2',
                issue_id: 'issue_2',
                status: 'open',
                subject: 'Details',
                created_at: '2026-02-01T00:00:00Z',
                updated_at: '2026-02-02T00:00:00Z',
                last_activity_at: '2026-02-02T00:00:00Z',
                contact: {
                    id: 'user_2',
                    username: 'Alex Carter',
                    email: 'alex@site.com',
                    created_at: '2026-02-01T00:00:00Z',
                },
                issue: {
                    id: 'issue_2',
                    project_id: 'proj_2',
                    title: 'Gate Access',
                    status: 'open',
                    created_at: '2026-02-01T00:00:00Z',
                },
            },
        });

        const result = await getThread('thread_2');

        expect(apiFetch).toHaveBeenCalledWith('/threads/thread_2');
        expect(result.contact.name).toBe('Alex Carter');
        expect(result.issue.title).toBe('Gate Access');
        expect(result.contactId).toBe('user_2');
    });

    it('lists threads by issue', async () => {
        vi.mocked(apiFetch)
            .mockResolvedValueOnce({
                data: {
                    id: 'issue_3',
                    project_id: 'proj_3',
                    title: 'Safety',
                    status: 'open',
                    created_at: '2026-02-01T00:00:00Z',
                },
            })
            .mockResolvedValueOnce({
                data: [
                    {
                        id: 'thread_3',
                        project_id: 'proj_3',
                        user_id: 'user_3',
                        issue_id: 'issue_3',
                        status: 'waiting',
                        subject: 'Follow up',
                        created_at: '2026-02-01T00:00:00Z',
                        updated_at: '2026-02-02T00:00:00Z',
                    },
                ],
            });

        const result = await getThreadsByIssue('issue_3');

        expect(apiFetch).toHaveBeenNthCalledWith(1, '/issues/issue_3');
        expect(apiFetch).toHaveBeenNthCalledWith(
            2,
            '/projects/proj_3/threads?issue_id=issue_3',
            { headers: { 'x-tenant-id': 'proj_3' } }
        );
        expect(result[0].issueId).toBe('issue_3');
    });
});
