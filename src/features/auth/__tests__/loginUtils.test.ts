import { describe, expect, it } from 'vitest'
import {
    buildDebugEvent,
    getConfirmationErrorMessage,
    getInitialDebugEnabled,
    getRedirectToFromLocation,
    getRegisterErrorMessage,
    getSignInErrorMessage,
    hasInviteContext,
    shouldEnableDebugFromSearch,
} from '../loginUtils'

describe('loginUtils', () => {
    it('builds redirect target from location state', () => {
        expect(getRedirectToFromLocation({ state: { from: { pathname: '/org_1/projects', search: '?q=1', hash: '#h' } } }))
            .toBe('/org_1/projects?q=1#h')
        expect(getRedirectToFromLocation({ state: {} })).toBe('/')
    })

    it('computes invite context from token or invitation path', () => {
        expect(hasInviteContext({ invitationToken: 'tok_1', redirectTo: '/' })).toBe(true)
        expect(hasInviteContext({ invitationToken: null, redirectTo: '/accept-invitation?token=abc' })).toBe(true)
        expect(hasInviteContext({ invitationToken: null, redirectTo: '/org_1/projects' })).toBe(false)
    })

    it('resolves initial debug state with env and localStorage priority', () => {
        expect(getInitialDebugEnabled({ envDebugFlag: 'true', storedValue: 'false', search: '' })).toBe(true)
        expect(getInitialDebugEnabled({ envDebugFlag: 'false', storedValue: 'true', search: '' })).toBe(true)
        expect(getInitialDebugEnabled({ envDebugFlag: 'false', storedValue: 'false', search: '?debug=auth' })).toBe(false)
        expect(getInitialDebugEnabled({ envDebugFlag: 'false', storedValue: null, search: '?debug=auth' })).toBe(true)
    })

    it('enables debug from URL only when not explicitly disabled', () => {
        expect(shouldEnableDebugFromSearch({ search: '?debug=auth', storedValue: null })).toBe(true)
        expect(shouldEnableDebugFromSearch({ search: '?debug=auth', storedValue: 'false' })).toBe(false)
        expect(shouldEnableDebugFromSearch({ search: '?foo=bar', storedValue: null })).toBe(false)
    })

    it('builds debug events with and without HTTP status', () => {
        const withStatus = buildDebugEvent({
            label: 'Login failed',
            error: { status: 401, message: 'Unauthorized' },
            getErrorStatus: (err) => (err as any).status ?? null,
        })
        expect(withStatus).toContain('Login failed (Status 401):')

        const noStatus = buildDebugEvent({
            label: 'Register failed',
            error: new Error('Oops'),
            getErrorStatus: () => null,
        })
        expect(noStatus).toContain('Register failed: Oops')
    })

    it('maps auth error messages to user-friendly copy', () => {
        expect(getSignInErrorMessage(new Error('Invalid username or password')))
            .toContain('Check your email and password')
        expect(getRegisterErrorMessage(new Error('User already exists')))
            .toContain('already exists')
        expect(getConfirmationErrorMessage(new Error('Token expired')))
            .toContain('expired')
    })
})
