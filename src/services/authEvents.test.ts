import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Hub } from 'aws-amplify/utils';
import { PROJECT_TENANT_MAP_STORAGE_KEY, PROJECT_PERSONALITY_TEMPLATE_MAP_STORAGE_KEY } from './projectFacade';

vi.mock('./token', () => ({
    getFreshToken: vi.fn(),
    clearToken: vi.fn(),
}));

vi.mock('../utils/verboseLogger', () => ({
    default: {
        info: vi.fn(),
    },
}));

describe('authEvents', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    it('clears project mappings on signedOut event', async () => {
        // Setup localStorage with project mappings and user data
        localStorage.setItem('am_user', JSON.stringify({ id: 'user1', email: 'test@example.com' }));
        localStorage.setItem('am_tenant_id', 'tenant_1');
        localStorage.setItem(PROJECT_TENANT_MAP_STORAGE_KEY, JSON.stringify({ proj_1: 'tenant_1' }));
        localStorage.setItem(PROJECT_PERSONALITY_TEMPLATE_MAP_STORAGE_KEY, JSON.stringify({ proj_1: 'template_1' }));

        // Verify items are set
        expect(localStorage.getItem('am_user')).not.toBeNull();
        expect(localStorage.getItem('am_tenant_id')).not.toBeNull();
        expect(localStorage.getItem(PROJECT_TENANT_MAP_STORAGE_KEY)).not.toBeNull();
        expect(localStorage.getItem(PROJECT_PERSONALITY_TEMPLATE_MAP_STORAGE_KEY)).not.toBeNull();

        // Import the module after setting up localStorage to trigger the listener registration
        await import('./authEvents');

        // Simulate signedOut event
        await Hub.dispatch('auth', {
            event: 'signedOut',
            data: {},
        });

        // Wait a bit for async handler to complete
        await new Promise(resolve => setTimeout(resolve, 100));

        // Verify all items are cleared
        expect(localStorage.getItem('am_user')).toBeNull();
        expect(localStorage.getItem('am_tenant_id')).toBeNull();
        expect(localStorage.getItem(PROJECT_TENANT_MAP_STORAGE_KEY)).toBeNull();
        expect(localStorage.getItem(PROJECT_PERSONALITY_TEMPLATE_MAP_STORAGE_KEY)).toBeNull();
    });
});
