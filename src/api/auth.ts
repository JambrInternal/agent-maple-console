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
import logger from '../utils/verboseLogger';

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

let syncUserInFlight: Promise<void> | null = null;
let signOutInFlight: Promise<void> | null = null;

const SYNC_USER_RETRY_DELAY_MS = 200;

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

const isTransientSyncConcurrencyError = (error: unknown): boolean => {
    const message = String(
        error && typeof error === 'object' && 'message' in error
            ? (error as { message?: unknown }).message
            : error ?? ''
    ).toLowerCase();

    return (
        message.includes('provisioning a new connection') ||
        message.includes('concurrent operations are not permitted') ||
        message.includes('sqlalche.me/e/20/isce')
    );
};

const performSyncUser = async (): Promise<void> => {
    try {
        await apiFetch('/user/sync', { method: 'POST' });
    } catch (error) {
        if (!isTransientSyncConcurrencyError(error)) {
            throw error;
        }

        logger.warn('Retrying user sync after transient concurrent connection provisioning error');
        await sleep(SYNC_USER_RETRY_DELAY_MS);
        await apiFetch('/user/sync', { method: 'POST' });
    }
};

const syncUser = async (): Promise<void> => {
    if (syncUserInFlight) {
        return syncUserInFlight;
    }

    syncUserInFlight = performSyncUser().finally(() => {
        syncUserInFlight = null;
    });

    return syncUserInFlight;
};

const signOutOnce = async (): Promise<void> => {
    if (signOutInFlight) {
        return signOutInFlight;
    }

    signOutInFlight = signOut().finally(() => {
        signOutInFlight = null;
    });

    return signOutInFlight;
};

// Test hook to clear module-level sync state between unit tests.
export const __resetAuthSyncStateForTests = (): void => {
    syncUserInFlight = null;
    signOutInFlight = null;
};

type CodeDeliveryDetails = {
    destination?: string | null;
    deliveryMedium?: string | null;
};

const getCodeDeliveryDetails = (nextStep: unknown): CodeDeliveryDetails | null => {
    if (!nextStep || typeof nextStep !== 'object' || !('codeDeliveryDetails' in nextStep)) {
        return null;
    }

    const details = (nextStep as { codeDeliveryDetails?: CodeDeliveryDetails }).codeDeliveryDetails;
    return details ?? null;
};

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
                logger.warn('Failed to verify admin status, falling back to member mode', error);
                setAdminMode(false);
                return 'member';
            }
        }

        setAdminMode(false);
        return 'member';
    } catch (error) {
        logger.warn('Failed to fetch user attributes', error);
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
            await signOutOnce();
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
        await syncUser();
        const role = await determineRoleAndSetAdminMode();

        return {
            user: {
                id: cognitoUser.userId,
                email,
                name: email,
                role,
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
    const details = getCodeDeliveryDetails(result.nextStep);

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
    const details = getCodeDeliveryDetails(result.nextStep);

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
    await signOutOnce();
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

        await syncUser();
        const role = await determineRoleAndSetAdminMode();
        const attributes = await fetchUserAttributes();
        const email = attributes.email || cognitoUser.username;

        return {
            id: cognitoUser.userId,
            email,
            name: email,
            role,
            organizationId: null,
            tenantId: null,
            mfaEnabled: false,
            createdAt: new Date().toISOString()
        };
    } catch {
        return null;
    }
}
