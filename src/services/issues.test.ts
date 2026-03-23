import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getIssue, getIssues } from './issues';
import { apiFetch } from '../api/client';

vi.mock('../api/client', () => ({
  API_CONFIG: { baseUrl: '' },
  apiFetch: vi.fn(),
}));

describe('issues service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists issues for a project', async () => {
    vi.mocked(apiFetch).mockResolvedValue({
      data: [
        {
          id: 'issue_1',
          project_id: 'proj_1',
          title: 'Issue A',
          status: 'open',
          created_at: '2026-02-01T00:00:00Z',
        },
      ],
    });

    const result = await getIssues('proj_1');

    expect(apiFetch).toHaveBeenCalledWith('/projects/proj_1/issues');
    expect(result[0].title).toBe('Issue A');
  });

  it('gets an issue with threads', async () => {
    vi.mocked(apiFetch)
      .mockResolvedValueOnce({
        data: {
          id: 'issue_2',
          project_id: 'proj_2',
          title: 'Issue B',
          status: 'open',
          created_at: '2026-02-01T00:00:00Z',
        },
      })
      .mockResolvedValueOnce({
        data: [
          {
            id: 'thread_1',
            project_id: 'proj_2',
            user_id: 'user_2',
            issue_id: 'issue_2',
            status: 'open',
            subject: 'Thread B',
            created_at: '2026-02-01T00:00:00Z',
            updated_at: '2026-02-02T00:00:00Z',
          },
        ],
      });

    const result = await getIssue('issue_2');

    expect(apiFetch).toHaveBeenNthCalledWith(1, '/issues/issue_2');
    expect(apiFetch).toHaveBeenNthCalledWith(
      2,
      '/projects/proj_2/threads?issue_id=issue_2'
    );
    expect(result.threads[0].id).toBe('thread_1');
  });
});
