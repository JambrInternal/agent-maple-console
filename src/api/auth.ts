import { signIn, signOut, fetchAuthSession, getCurrentUser } from 'aws-amplify/auth';
import { mockFetch, API_CONFIG } from './client';
import type { User } from './types';

export interface AuthSession {
    user: User | null;
    token: string | null;
}

const MOCK_USER: User = {
    id: 'u1',
    email: 'jeremy@agentmaple.ca',
    name: 'Jeremy Legere',
    role: 'admin',
    mfaEnabled: false,
    createdAt: new Date().toISOString()
};

export async function login(email: string, password: string): Promise<AuthSession> {
    if (API_CONFIG.useMocks) {
        if (email === 'jeremy@agentmaple.ca' && password === 'password') {
            return mockFetch({
                user: MOCK_USER,
                token: 'mock-jwt-token-123'
            });
        }
        throw new Error('Invalid email or password (mock)');
    }

    // Real Cognito Login
    const { isSignedIn, nextStep } = await signIn({ username: email, password });

    if (isSignedIn) {
        const session = await fetchAuthSession();
        const cognitoUser = await getCurrentUser();
        const token = session.tokens?.accessToken?.toString() || session.tokens?.idToken?.toString() || null;

        return {
            user: {
                id: cognitoUser.userId,
                email: email, // Email isn't in standard getCurrentUser, usually in attributes
                name: email,
                role: 'admin', // Default role for now
                mfaEnabled: false,
                createdAt: new Date().toISOString()
            },
            token
        };
    }

    throw new Error(`Login failed: ${nextStep.signInStep}`);
}

export async function logout(): Promise<void> {
    if (API_CONFIG.useMocks) return mockFetch(undefined);
    await signOut();
}

export async function getSessionUser(): Promise<User | null> {
    if (API_CONFIG.useMocks) {
        const hasToken = localStorage.getItem('am_auth_token');
        if (hasToken) return mockFetch(MOCK_USER);
        return mockFetch(null);
    }

    try {
        const cognitoUser = await getCurrentUser();
        const session = await fetchAuthSession();
        const token = session.tokens?.accessToken?.toString() || session.tokens?.idToken?.toString() || null;
        if (token) {
            localStorage.setItem('am_auth_token', token);
        }

        return {
            id: cognitoUser.userId,
            email: cognitoUser.username,
            name: cognitoUser.username,
            role: 'admin',
            mfaEnabled: false,
            createdAt: new Date().toISOString()
        };
    } catch {
        return null;
    }
}
