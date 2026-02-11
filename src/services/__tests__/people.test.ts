import { beforeEach, describe, expect, it, vi } from 'vitest';
import { acceptInvitation, getContact, getContacts, getUser, getUsers, inviteUser, removeUser } from '../people';
import { apiFetch } from '../../api/client';

vi.mock('../../api/client', () => ({
    API_CONFIG: { baseUrl: '' },
    apiFetch: vi.fn(),
}));

describe('people service', () => {
    beforeEach(() => {
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
                expires_at: '2026-03-11T10:00:00Z',
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

    it('removes a user from an organization', async () => {
        vi.mocked(apiFetch).mockResolvedValue({});

        await removeUser('user_77', '12');

        expect(apiFetch).toHaveBeenCalledWith('/tenants/users/user_77', {
            method: 'DELETE',
            headers: { 'x-tenant-id': '12' },
        });
    });
});
