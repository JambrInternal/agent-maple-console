// Amplify Auth event listener for token hydration/clearing
import { Hub } from 'aws-amplify/utils';
import { getFreshToken, clearToken } from './token';

// Listen for Amplify auth events
Hub.listen('auth', async ({ payload }) => {
  const { event } = payload;
  if (event === 'signedIn' || event === 'tokenRefresh') {
    // Hydrate token on signIn or tokenRefresh
    await getFreshToken();
    // Log event
    console.info('[AuthEvents] Token hydrated after', event);
  } else if (event === 'signedOut') {
    // Clear token and user on signOut
    clearToken();
    localStorage.removeItem('am_user');
    localStorage.removeItem('am_tenant_id');
    // Log event
    console.info('[AuthEvents] Token cleared after signOut');
  }
});

// Optionally export for app bootstrap
export function setupAuthEventListeners() {
  // No-op: listeners are registered on import
}
