// Amplify Auth event listener for token hydration/clearing
import { Hub } from 'aws-amplify/utils';
import { getFreshToken, clearToken } from './token';
import {
  PROJECT_TENANT_MAP_STORAGE_KEY,
  PROJECT_PERSONALITY_TEMPLATE_MAP_STORAGE_KEY,
} from './projectFacade';
import logger from '../utils/verboseLogger';

// Listen for Amplify auth events
Hub.listen('auth', async ({ payload }) => {
  const { event } = payload;
  if (event === 'signedIn' || event === 'tokenRefresh') {
    // Hydrate token on signIn or tokenRefresh
    await getFreshToken();
    // Log event
    logger.info('[AuthEvents] Token hydrated after', event);
  } else if (event === 'signedOut') {
    // Clear token and user on signOut
    clearToken();
    localStorage.removeItem('am_user');
    localStorage.removeItem('am_tenant_id');
    localStorage.removeItem(PROJECT_TENANT_MAP_STORAGE_KEY);
    localStorage.removeItem(PROJECT_PERSONALITY_TEMPLATE_MAP_STORAGE_KEY);
    // Log event
    logger.info('[AuthEvents] Token cleared after signOut');
  }
});

// Optionally export for app bootstrap
export function setupAuthEventListeners() {
  // No-op: listeners are registered on import
}
