
import * as authApi from '../api/auth';
import { clearAdminMode } from '../utils/admin';
import { clearTheme } from '../utils/theme';
import logger from '../utils/verboseLogger';

const getStoredTenantId = () => localStorage.getItem('am_tenant_id');

import type { User } from '../api/types';
import type { RegisterProfile, RegisterResult, ResetPasswordStartResult, ResendCodeResult } from '../api/auth';

const ensureUserIds = (user: User): User => ({
  ...user,
  organizationId: user.organizationId ?? null,
  tenantId: user.tenantId ?? getStoredTenantId() ?? null,
});

export async function login(email: string, password: string): Promise<User> {
  logger.info('Attempting login', { email });
  const { user, token } = await authApi.login(email, password);
  if (token && user) {
    const baseUser = ensureUserIds(user);
    localStorage.setItem('am_auth_token', token);
    localStorage.setItem('am_user', JSON.stringify(baseUser));
    logger.info('Login successful', { userId: baseUser.id });
    return baseUser;
  }
  logger.error('Authentication failed: Missing token or user data', { email });
  throw new Error('Authentication failed: Missing token or user data');
}

export async function register(
  email: string,
  password: string,
  profile?: RegisterProfile
): Promise<RegisterResult> {
  logger.info('Attempting register', { email });
  const result = profile
    ? await authApi.register(email, password, profile)
    : await authApi.register(email, password);
  logger.info('Register result received', {
    email,
    complete: result.isComplete,
    nextStep: result.nextStep,
  });
  return result;
}

export async function confirmRegistration(email: string, confirmationCode: string): Promise<void> {
  logger.info('Attempting registration confirmation', { email });
  await authApi.confirmRegistration(email, confirmationCode);
  logger.info('Registration confirmation complete', { email });
}

export async function forgotPassword(email: string): Promise<ResetPasswordStartResult> {
  logger.info('Attempting forgot-password', { email });
  const result = await authApi.forgotPassword(email);
  logger.info('Forgot-password result received', {
    email,
    nextStep: result.nextStep,
    codeDeliveryDestination: result.codeDeliveryDestination,
  });
  return result;
}

export async function resendConfirmationCode(email: string): Promise<ResendCodeResult> {
  logger.info('Attempting resend confirmation code', { email });
  const result = await authApi.resendConfirmationCode(email);
  logger.info('Resend confirmation code result received', { email });
  return result;
}

export async function confirmForgotPassword(
  email: string,
  confirmationCode: string,
  newPassword: string
): Promise<void> {
  logger.info('Attempting forgot-password confirmation', { email });
  await authApi.confirmForgotPassword(email, confirmationCode, newPassword);
  logger.info('Forgot-password confirmation complete', { email });
}

export async function logout(): Promise<void> {
  await authApi.logout();
  localStorage.removeItem('am_auth_token');
  localStorage.removeItem('am_user');
  localStorage.removeItem('am_tenant_id'); // Clear organization selection on logout
  clearAdminMode();
  clearTheme();
}

export async function getCurrentUser(): Promise<User | null> {
  logger.info('Fetching current user from session');
  // Hydrate token from Amplify session if missing/expired
  const { getFreshToken } = await import('./token');
  const user = await authApi.getSessionUser();
  if (!user) {
    logger.warn('No session user during bootstrap; leaving Cognito session untouched');
    return null;
  }
  const token = await getFreshToken();
  if (!token) {
    logger.warn('Token hydration failed during bootstrap; leaving Cognito session untouched');
    return null;
  }
  const baseUser = ensureUserIds(user);
  localStorage.setItem('am_user', JSON.stringify(baseUser));
  logger.info('Current user hydrated from session', { userId: baseUser.id });
  return baseUser;
}
