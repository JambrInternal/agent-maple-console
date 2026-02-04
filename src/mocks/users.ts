// Mock Users Data
import type { User } from '../api/types';

export const mockUsers: User[] = [
    {
        id: 'user_1',
        email: 'mike.chen@ironmaple.com',
        name: 'Mike Chen',
        role: 'owner',
        mfaEnabled: true,
        createdAt: '2024-06-15T10:00:00Z',
    },
    {
        id: 'user_2',
        email: 'sarah.jones@ironmaple.com',
        name: 'Sarah Jones',
        role: 'admin',
        mfaEnabled: true,
        createdAt: '2024-06-20T09:00:00Z',
    },
    {
        id: 'user_3',
        email: 'tom.williams@ironmaple.com',
        name: 'Tom Williams',
        role: 'member',
        mfaEnabled: false,
        createdAt: '2024-07-10T11:00:00Z',
    },
    {
        id: 'user_4',
        email: 'jenny.taylor@bushytailed.ca',
        name: 'Jenny Taylor',
        role: 'owner',
        mfaEnabled: true,
        createdAt: '2024-09-22T14:30:00Z',
    },
];

export function getMockUser(id: string): User | undefined {
    return mockUsers.find((user) => user.id === id);
}
