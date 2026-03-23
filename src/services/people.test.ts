import { beforeEach, describe, expect, it, vi } from 'vitest';
import { acceptInvitation, getContact, getContacts, getUser, getUsers, inviteUser, removeUser } from './people';
import { ApiError, apiFetch } from '../api/client';
import { PROJECT_TENANT_MAP_STORAGE_KEY } from './projectFacade';

vi.mock('../api/client', () => ({
  API_CONFIG: { baseUrl: '' },
  apiFetch: vi.fn(),
  ApiError: class ApiError extends Error {
    status: number;
    statusText: string;
    details?: unknown;

    constructor(status: number, statusText: string, message: string, details?: unknown) {
      super(message);
      this.name = 'ApiError';
      this.status = status;
      this.statusText = statusText;
      this.details = details;
    }
  },
}));

describe('people service', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('lists contacts for a project', async () => {
    vi.mocked(apiFetch).mockResolvedValue({
      data: [
        {
          tenant_id: 1,
          user_id: 'user_1',
          given_name: 'Jamie',
          family_name: 'Ng',
          email: 'jamie@example.com',
          phone_number: '+1-555-0101',
          created_at: '2026-02-01T00:00:00Z',
        },
      ],
    });

    const result = await getContacts('1');

    expect(apiFetch).toHaveBeenCalledWith('/tenants/users', {
      headers: { 'x-tenant-id': '1' },
    });
    expect(result[0].name).toBe('Jamie Ng');
  });

  it('lists contacts using project facade scope and stores project mapping', async () => {
    vi.mocked(apiFetch).mockResolvedValue({
      data: [],
    });

    await getContacts({
      organizationId: 'tenant_9',
      projectId: 'proj_9',
    });

    expect(apiFetch).toHaveBeenCalledWith('/tenants/users', {
      headers: { 'x-tenant-id': 'tenant_9' },
    });
    expect(localStorage.getItem(PROJECT_TENANT_MAP_STORAGE_KEY)).toContain('"proj_9":"tenant_9"');
  });

  it('gets a contact by id', async () => {
    vi.mocked(apiFetch).mockResolvedValue({
      data: [
        {
          tenant_id: 2,
          user_id: 'user_2',
          given_name: 'Casey',
          family_name: 'Lee',
          email: 'casey@example.com',
          phone_number: '+1-555-0102',
          created_at: '2026-02-01T00:00:00Z',
        },
      ],
    });

    const result = await getContact('user_2', '2');

    expect(result.email).toBe('casey@example.com');
  });

  it('lists users', async () => {
    vi.mocked(apiFetch).mockResolvedValue({
      data: [
        {
          tenant_id: 3,
          user_id: 'user_3',
          given_name: 'Morgan',
          family_name: 'Grey',
          email: 'morgan@example.com',
          role: 'ADMIN',
          created_at: '2026-02-01T00:00:00Z',
        },
      ],
    });

    const result = await getUsers('3');

    expect(result[0].role).toBe('admin');
    expect(result[0].tenantId).toBe('3');
    expect(result[0].organizationId).toBeNull();
  });

  it('throws when user is missing', async () => {
    vi.mocked(apiFetch).mockResolvedValue({ data: [] });

    await expect(getUser('missing')).rejects.toThrow('User not found: missing');
  });

  it('returns invitation details when inviting a user', async () => {
    vi.mocked(apiFetch).mockResolvedValue({
      data: {
        id: 'invite_1',
        email: 'new.user@example.com',
        tenant_id: 12,
        role: 'INSTRUCTOR',
        is_used: false,
        created_at: '2026-02-11T10:00:00Z',
        expires_at: '2099-12-31T23:59:59Z',
        used_at: null,
      },
    });

    const result = await inviteUser('new.user@example.com', '12');

    expect(apiFetch).toHaveBeenCalledWith('/tenants/send-invitation', {
      method: 'POST',
      headers: { 'x-tenant-id': '12' },
      body: JSON.stringify({ email: 'new.user@example.com', role: 'INSTRUCTOR' }),
    });
    expect(result).toMatchObject({
      id: 'invite_1',
      email: 'new.user@example.com',
      tenantId: '12',
      role: 'member',
      status: 'pending',
      isUsed: false,
    });
  });

  it('marks invitation as used when used_at is present even if is_used is missing', async () => {
    vi.mocked(apiFetch).mockResolvedValue({
      data: {
        id: 'invite_2',
        email: 'used.invite@example.com',
        tenant_id: 12,
        role: 'INSTRUCTOR',
        created_at: '2026-02-11T10:00:00Z',
        expires_at: '2026-03-11T10:00:00Z',
        used_at: '2026-02-11T11:00:00Z',
      },
    });

    const result = await inviteUser('used.invite@example.com', '12');

    expect(result).toMatchObject({
      tenantId: '12',
      status: 'accepted',
      isUsed: true,
    });
  });

  it('accepts an invitation token', async () => {
    vi.mocked(apiFetch).mockResolvedValue({
      data: {
        id: 'invite_3',
        email: 'accept.user@example.com',
        tenant_id: 44,
        role: 'LEARNER',
        is_used: true,
        created_at: '2026-02-11T10:00:00Z',
        expires_at: '2026-03-11T10:00:00Z',
        used_at: '2026-02-11T11:00:00Z',
      },
    });

    const result = await acceptInvitation('token_abc');

    expect(apiFetch).toHaveBeenCalledWith('/user/accept-invitation', {
      method: 'POST',
      body: JSON.stringify({ token: 'token_abc' }),
    });
    expect(result).toMatchObject({
      id: 'invite_3',
      email: 'accept.user@example.com',
      tenantId: '44',
      role: 'viewer',
      status: 'accepted',
      isUsed: true,
    });
  });

  it('retries invitation acceptance with invitation_token when backend requires that field', async () => {
    vi.mocked(apiFetch)
      .mockRejectedValueOnce(
        new ApiError(422, 'Unprocessable Entity', 'Field required', {
          detail: [
            {
              type: 'missing',
              loc: ['body', 'invitation_token'],
              msg: 'Field required',
              input: { token: 'token_alias' },
            },
          ],
        })
      )
      .mockResolvedValueOnce({
        data: {
          id: 'invite_4',
          email: 'alias.user@example.com',
          tenant_id: 45,
          role: 'LEARNER',
          is_used: true,
          created_at: '2026-02-11T10:00:00Z',
          expires_at: '2026-03-11T10:00:00Z',
          used_at: '2026-02-11T11:00:00Z',
        },
      });

    const result = await acceptInvitation('token_alias');

    expect(apiFetch).toHaveBeenNthCalledWith(1, '/user/accept-invitation', {
      method: 'POST',
      body: JSON.stringify({ token: 'token_alias' }),
    });
    expect(apiFetch).toHaveBeenNthCalledWith(2, '/user/accept-invitation', {
      method: 'POST',
      body: JSON.stringify({ invitation_token: 'token_alias' }),
    });
    expect(result).toMatchObject({
      id: 'invite_4',
      tenantId: '45',
      status: 'accepted',
      isUsed: true,
    });
  });

  it('retries invitation acceptance with invite_token when backend requires that field', async () => {
    vi.mocked(apiFetch)
      .mockRejectedValueOnce(
        new ApiError(422, 'Unprocessable Entity', 'Field required', {
          detail: [
            {
              type: 'missing',
              loc: ['body', 'invite_token'],
              msg: 'Field required',
              input: { token: 'token_alias_422' },
            },
          ],
        })
      )
      .mockResolvedValueOnce({
        data: {
          id: 'invite_5',
          email: 'alias422.user@example.com',
          tenant_id: 46,
          role: 'LEARNER',
          is_used: true,
          created_at: '2026-02-11T10:00:00Z',
          expires_at: '2026-03-11T10:00:00Z',
          used_at: '2026-02-11T11:00:00Z',
        },
      });

    const result = await acceptInvitation('token_alias_422');

    expect(apiFetch).toHaveBeenNthCalledWith(1, '/user/accept-invitation', {
      method: 'POST',
      body: JSON.stringify({ token: 'token_alias_422' }),
    });
    expect(apiFetch).toHaveBeenNthCalledWith(2, '/user/accept-invitation', {
      method: 'POST',
      body: JSON.stringify({ invite_token: 'token_alias_422' }),
    });
    expect(result).toMatchObject({
      id: 'invite_5',
      tenantId: '46',
      status: 'accepted',
      isUsed: true,
    });
  });

  it('does not retry invitation acceptance on unrelated 422 validation errors', async () => {
    vi.mocked(apiFetch).mockRejectedValueOnce(
      new ApiError(422, 'Unprocessable Entity', 'Invitation token is invalid', {
        detail: [
          {
            type: 'value_error',
            loc: ['body', 'token'],
            msg: 'Invitation token is invalid',
            input: { token: 'token_no_retry_422' },
          },
        ],
      })
    );

    await expect(acceptInvitation('token_no_retry_422')).rejects.toThrow('Invitation token is invalid');
    expect(apiFetch).toHaveBeenCalledTimes(1);
    expect(apiFetch).toHaveBeenCalledWith('/user/accept-invitation', {
      method: 'POST',
      body: JSON.stringify({ token: 'token_no_retry_422' }),
    });
  });

  it('does not retry invitation acceptance on non-validation errors', async () => {
    vi.mocked(apiFetch).mockRejectedValueOnce(
      new ApiError(500, 'Internal Server Error', 'upstream failure')
    );

    await expect(acceptInvitation('token_no_retry')).rejects.toThrow('upstream failure');
    expect(apiFetch).toHaveBeenCalledTimes(1);
    expect(apiFetch).toHaveBeenCalledWith('/user/accept-invitation', {
      method: 'POST',
      body: JSON.stringify({ token: 'token_no_retry' }),
    });
  });

  it('removes a user from an organization', async () => {
    vi.mocked(apiFetch).mockResolvedValue({});

    await removeUser('user_77', '12');

    expect(apiFetch).toHaveBeenCalledWith('/tenants/users/user_77', {
      method: 'DELETE',
      headers: { 'x-tenant-id': '12' },
    });
  });
});
