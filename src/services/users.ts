// Mock Users Service (in case we need to fetch user details directly)
import { mockFetch } from '../api/client';
import type { User } from '../api/types';
import { mockUsers, getMockUser } from '../mocks/users';

/**
 * Get all users in the system (mock)
 */
export async function getUsers(): Promise<User[]> {
    return mockFetch(mockUsers);
}

/**
 * Get a single user by ID
 */
export async function getUser(id: string): Promise<User> {
    const user = getMockUser(id);
    if (!user) {
        throw new Error(`User not found: ${id}`);
    }
    return mockFetch(user);
}
