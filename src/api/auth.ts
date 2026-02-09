import {
    signIn,
    signOut,
    fetchAuthSession,
    getCurrentUser,
} from 'aws-amplify/auth';
import type { User } from './types';

export interface AuthSession {
    user: User | null;
    token: string | null;
}

export async function login(email: string, password: string): Promise<AuthSession> {
    // Real Cognito Login
    const { isSignedIn, nextStep } = await signIn({ username: email, password });

    if (isSignedIn) {
        const session = await fetchAuthSession();
        const cognitoUser = await getCurrentUser();
        const token = session.tokens?.idToken?.toString() || null;

        return {
            user: {
                id: cognitoUser.userId,
                email: email, // Email isn't in standard getCurrentUser, usually in attributes
                name: email,
                role: 'admin', // Default role for now
                organizationId: null,
                tenantId: null,
                mfaEnabled: false,
                createdAt: new Date().toISOString()
            },
            token
        };
    }

    throw new Error(`Login failed: ${nextStep.signInStep}`);
}

export async function logout(): Promise<void> {
    await signOut();
}

export async function getSessionUser(): Promise<User | null> {
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
            organizationId: null,
            tenantId: null,
            mfaEnabled: false,
            createdAt: new Date().toISOString()
        };
    } catch {
        return null;
    }
}
