import {
  confirmResetPassword,
  confirmSignUp,
  signIn,
  signOut,
  signUp,
  resetPassword,
  resendSignUpCode,
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

export interface RegisterProfile {
    givenName?: string | null;
    familyName?: string | null;
}

export interface ResetPasswordStartResult {
    nextStep: string;
    codeDeliveryDestination: string | null;
    codeDeliveryMedium: string | null;
}

export interface ResendCodeResult {
    codeDeliveryDestination: string | null;
    codeDeliveryMedium: string | null;
}

const DEFAULT_SIGNUP_ROLE = 'INSTRUCTOR';

let signOutInFlight: Promise<void> | null = null;

const DEFAULT_GIVEN_NAME = 'Invited';
const DEFAULT_FAMILY_NAME = 'User';

const toTitleCase = (value: string): string => {
  if (!value) {
    return '';
  }

  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
};

const buildSignupNameAttributes = (email: string): { givenName: string; familyName: string } => {
  const localPart = email.split('@')[0] || '';
  const tokens = localPart
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => toTitleCase(token));

  const givenName = tokens[0] || DEFAULT_GIVEN_NAME;
  const familyName = tokens.slice(1).join(' ') || DEFAULT_FAMILY_NAME;

  return { givenName, familyName };
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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('already signed in user')) {
      await signOutOnce();
      signInResult = await signIn({ username: email, password });
    } else {
      throw error;
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

export async function register(
  email: string,
  password: string,
  profile?: RegisterProfile
): Promise<RegisterResult> {
  const normalizedEmail = email.trim();
  const { givenName: derivedGivenName, familyName: derivedFamilyName } = buildSignupNameAttributes(normalizedEmail);
  const providedGivenName = profile?.givenName?.trim() || '';
  const providedFamilyName = profile?.familyName?.trim() || '';
  const givenName = providedGivenName || derivedGivenName;
  const familyName = providedFamilyName || derivedFamilyName;

  const result = await signUp({
    username: normalizedEmail,
    password,
    options: {
      userAttributes: {
        email: normalizedEmail,
        'custom:role': DEFAULT_SIGNUP_ROLE,
        given_name: givenName,
        family_name: familyName,
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

export async function resendConfirmationCode(email: string): Promise<ResendCodeResult> {
  const normalizedEmail = email.trim();
  const result = await resendSignUpCode({ username: normalizedEmail });
  const details = getCodeDeliveryDetails(result);

  return {
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
