// Token provider for Amplify/Cognito session
// Responsibilities: hydrate, refresh, clear token; memoize in-flight requests

import { fetchAuthSession } from '@aws-amplify/auth';
import logger from '../utils/verboseLogger';

const TOKEN_KEY = 'am_auth_token';
const EXP_KEY = 'am_auth_token_exp';
const TOKEN_TYPE = 'id'; // Always use Cognito ID token for API auth

let inFlightPromise: Promise<string | null> | null = null;

function getTokenFromStorage(): { token: string | null; exp: number | null } {
  const token = localStorage.getItem(TOKEN_KEY);
  const expStr = localStorage.getItem(EXP_KEY);
  const exp = expStr ? parseInt(expStr, 10) : null;
  return { token, exp };
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

  if (inFlightPromise) return inFlightPromise;

  inFlightPromise = fetchAndStoreToken().finally(() => {
    inFlightPromise = null;
  });
  return inFlightPromise;
}

async function fetchAndStoreToken(): Promise<string | null> {
  try {
    const session = await fetchAuthSession();
    const tokens = (session as any).tokens || {};
    const tokenObj = TOKEN_TYPE === 'access' ? tokens.accessToken : tokens.idToken;
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
      // Optionally: metrics hook
      clearToken();
      return null;
    }
  } catch (err) {
    // Log event: token hydrate failed
    logger.error('[Token] Hydration failed', err);
    // Optionally: metrics hook
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
