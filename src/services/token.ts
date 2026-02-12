// Token provider for Amplify/Cognito session
// Responsibilities: hydrate, refresh, clear token; memoize in-flight requests

import { fetchAuthSession } from 'aws-amplify/auth';
import logger from '../utils/verboseLogger';

const TOKEN_KEY = 'am_auth_token';
const EXP_KEY = 'am_auth_token_exp';

let inFlightPromise: Promise<string | null> | null = null;

function getTokenFromStorage(): { token: string | null; exp: number | null } {
  const token = localStorage.getItem(TOKEN_KEY);
  const expStr = localStorage.getItem(EXP_KEY);
  const exp = expStr ? parseInt(expStr, 10) : null;
  return { token, exp };
}

function decodeBase64Url(input: string): string | null {
  try {
    const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    if (typeof atob === 'function') return atob(padded);
    return null;
  } catch {
    return null;
  }
}

function getExpFromJwt(token: string | null): number | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length < 2) return null;

  const payloadJson = decodeBase64Url(parts[1]);
  if (!payloadJson) return null;

  try {
    const payload = JSON.parse(payloadJson) as { exp?: unknown };
    const exp = payload.exp;
    return typeof exp === 'number' ? exp : null;
  } catch {
    return null;
  }
}

function isTokenValid(token: string | null, exp: number | null): boolean {
  if (!token || !exp) return false;
  const now = Math.floor(Date.now() / 1000);
  // Consider token valid if expiry > now + 60s
  return exp > now + 60;
}

export async function getFreshToken(): Promise<string | null> {
  const { token, exp } = getTokenFromStorage();
  if (isTokenValid(token, exp)) return token;

  // Recover when token exists but exp cache is missing/stale.
  if (token && !exp) {
    const decodedExp = getExpFromJwt(token);
    if (isTokenValid(token, decodedExp)) {
      localStorage.setItem(EXP_KEY, String(decodedExp));
      return token;
    }
  }

  if (inFlightPromise) return inFlightPromise;

  inFlightPromise = fetchAndStoreToken().finally(() => {
    inFlightPromise = null;
  });
  return inFlightPromise;
}

async function fetchAndStoreToken(): Promise<string | null> {
  const { token: existingToken } = getTokenFromStorage();

  try {
    const session = await fetchAuthSession();
    const tokens = (session as any).tokens || {};
    const tokenObj = tokens.idToken;
    const token = tokenObj?.toString() || null;
    const exp = tokenObj?.payload?.exp || null;
    if (token && exp) {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(EXP_KEY, exp.toString());
      // Log event: token hydrated
      logger.info('[Token] Hydrated', { exp });
      // Optionally: metrics hook
      return token;
    } else {
      // Log event: token hydrate failed
      logger.warn('[Token] Hydration failed: missing token/exp');
      // Keep existing token if present; backend 401 is the source of truth for invalidation.
      if (existingToken) {
        logger.warn('[Token] Preserving existing token after hydration miss');
        return existingToken;
      }
      clearToken();
      return null;
    }
  } catch (err) {
    // Log event: token hydrate failed
    logger.error('[Token] Hydration failed', err);
    // Keep existing token if present; this can be a transient Cognito failure.
    if (existingToken) {
      logger.warn('[Token] Preserving existing token after hydration error');
      return existingToken;
    }
    clearToken();
    return null;
  }
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EXP_KEY);
  // Log event: token cleared
  logger.info('[Token] Cleared');
  // Optionally: metrics hook
}

// Listen for storage events (multi-tab consistency)
window.addEventListener('storage', (e) => {
  if (e.key === TOKEN_KEY || e.key === EXP_KEY) {
    // Optionally trigger re-hydration or update in AuthContext
    logger.info('[Token] Storage event', { key: e.key });
    // Optionally: metrics hook
  }
});
