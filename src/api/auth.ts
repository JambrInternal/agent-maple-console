import {
    confirmResetPassword,
    confirmSignUp,
    signIn,
    signOut,
    signUp,
    resetPassword,
    fetchAuthSession,
    getCurrentUser,
    fetchUserAttributes,
} from 'aws-amplify/auth';
import type { User, UserRole } from './types';
import { apiFetch } from './client';
import { clearAdminMode, setAdminMode } from '../utils/admin';

export interface AuthSession {
    user: User | null;
    token: string | null;
}

export interface RegisterResult {
    isComplete: boolean;
    nextStep: string;
    codeDeliveryDestination: string | null;
    codeDeliveryMedium: string | null;
}

export interface ResetPasswordStartResult {
    nextStep: string;
    codeDeliveryDestination: string | null;
    codeDeliveryMedium: string | null;
}

const DEFAULT_SIGNUP_ROLE = 'INSTRUCTOR';

async function determineRoleAndSetAdminMode(): Promise<UserRole> {
    try {
        const attributes = await fetchUserAttributes();
        const cognitoRole = attributes['custom:role'];

        if (cognitoRole === 'ADMIN') {
            try {
                // Verify admin status with backend
                await apiFetch('/admin/tenants');
                setAdminMode(true);
                return 'admin';
            } catch (error) {
                console.warn('Failed to verify admin status, falling back to member mode', error);
                setAdminMode(false);
                return 'member';
            }
        }

        setAdminMode(false);
        return 'member';
    } catch (error) {
        console.warn('Failed to fetch user attributes', error);
        setAdminMode(false);
        return 'member';
    }
}

export async function login(email: string, password: string): Promise<AuthSession> {
    // Real Cognito Login
    let signInResult;
    try {
        signInResult = await signIn({ username: email, password });
    } catch (e: any) {
        const msg = String(e?.message || e);
        if (msg.includes('already signed in user')) {
            await signOut();
            signInResult = await signIn({ username: email, password });
        } else {
            throw e;
        }
    }

    const { isSignedIn, nextStep } = signInResult;

    if (isSignedIn) {
        const session = await fetchAuthSession();
        const cognitoUser = await getCurrentUser();
        const token = session.tokens?.idToken?.toString() || null;
        const role = await determineRoleAndSetAdminMode();

        return {
            user: {
                id: cognitoUser.userId,
                email: email,
                name: email,
                role: role,
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

export async function register(email: string, password: string): Promise<RegisterResult> {
    const normalizedEmail = email.trim();
    const result = await signUp({
        username: normalizedEmail,
        password,
        options: {
            userAttributes: {
                email: normalizedEmail,
                'custom:role': DEFAULT_SIGNUP_ROLE,
            },
        },
    });

    const nextStep = result.nextStep?.signUpStep || 'DONE';
    const details = result.nextStep?.codeDeliveryDetails;

    return {
        isComplete: result.isSignUpComplete === true || nextStep === 'DONE',
        nextStep,
        codeDeliveryDestination: details?.destination ?? null,
        codeDeliveryMedium: details?.deliveryMedium ?? null,
    };
}

export async function confirmRegistration(email: string, confirmationCode: string): Promise<void> {
    const normalizedEmail = email.trim();
    const normalizedCode = confirmationCode.trim();

    const result = await confirmSignUp({
        username: normalizedEmail,
        confirmationCode: normalizedCode,
    });

    const nextStep = result.nextStep?.signUpStep || 'DONE';
    if (result.isSignUpComplete || nextStep === 'DONE') {
        return;
    }

    throw new Error(`Registration confirmation incomplete: ${nextStep}`);
}

export async function forgotPassword(email: string): Promise<ResetPasswordStartResult> {
    const normalizedEmail = email.trim();
    const result = await resetPassword({ username: normalizedEmail });
    const nextStep = result.nextStep?.resetPasswordStep || 'DONE';
    const details = result.nextStep?.codeDeliveryDetails;

    return {
        nextStep,
        codeDeliveryDestination: details?.destination ?? null,
        codeDeliveryMedium: details?.deliveryMedium ?? null,
    };
}

export async function confirmForgotPassword(
    email: string,
    confirmationCode: string,
    newPassword: string
): Promise<void> {
    const normalizedEmail = email.trim();
    const normalizedCode = confirmationCode.trim();
    await confirmResetPassword({
        username: normalizedEmail,
        confirmationCode: normalizedCode,
        newPassword,
    });
}

export async function logout(): Promise<void> {
    await signOut();
    localStorage.removeItem('am_auth_token');
    clearAdminMode();
}

export async function getSessionUser(): Promise<User | null> {
    try {
        const cognitoUser = await getCurrentUser();
        const session = await fetchAuthSession();
        const token = session.tokens?.idToken?.toString() || null;
        if (token) {
            localStorage.setItem('am_auth_token', token);
        }

        const role = await determineRoleAndSetAdminMode();
        const attributes = await fetchUserAttributes();
        const email = attributes.email || cognitoUser.username;

        return {
            id: cognitoUser.userId,
            email: email,
            name: email,
            role: role,
            organizationId: null,
            tenantId: null,
            mfaEnabled: false,
            createdAt: new Date().toISOString()
        };
    } catch {
        return null;
    }
}
