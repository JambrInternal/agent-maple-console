import React from 'react'
import { describe, expect, it, beforeEach, vi } from 'vitest'
import { render } from '@testing-library/react'
import PostHogFeatureFlagProvider from '../posthogProvider'

const testState = vi.hoisted(() => {
    return {
        authState: {
            user: null as {
                id: string
                email: string
                role: string
            } | null,
        },
        mockPosthog: {
            init: vi.fn(),
            onFeatureFlags: vi.fn(),
            isFeatureEnabled: vi.fn(),
            reloadFeatureFlags: vi.fn(),
            identify: vi.fn(),
            setPersonPropertiesForFlags: vi.fn(),
            group: vi.fn(),
            reset: vi.fn(),
        },
    }
})

vi.mock('posthog-js', () => ({
    default: testState.mockPosthog,
}))

vi.mock('../../contexts/AuthContext', () => ({
    useAuth: () => testState.authState,
}))

vi.mock('../../utils/admin', () => ({
    getAdminMode: () => false,
}))

describe('PostHogFeatureFlagProvider', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        testState.authState.user = null
        localStorage.clear()
        window.__APP_CONFIG__ = {
            POSTHOG_KEY: 'phc_test_key',
            POSTHOG_ENABLED: 'true',
            POSTHOG_HOST: 'https://us.i.posthog.com',
            APP_ENV: 'beta',
            POSTHOG_TARGETING_MODE: 'auto',
        }

        testState.mockPosthog.isFeatureEnabled.mockReturnValue(undefined)
        testState.mockPosthog.onFeatureFlags.mockImplementation((callback: Function) => {
            callback([], {}, { errorsLoading: false })
            return () => {}
        })
    })

    it('initializes posthog and identifies authenticated users', () => {
        testState.authState.user = {
            id: 'user_123',
            email: 'owner@example.com',
            role: 'admin',
        }
        localStorage.setItem('am_tenant_id', 'org_123')

        render(
            <PostHogFeatureFlagProvider>
                <div>child</div>
            </PostHogFeatureFlagProvider>
        )

        expect(testState.mockPosthog.init).toHaveBeenCalledWith(
            'phc_test_key',
            expect.objectContaining({
                api_host: 'https://us.i.posthog.com',
                autocapture: true,
                capture_pageview: 'history_change',
                capture_pageleave: 'if_capture_pageview',
            })
        )
        expect(testState.mockPosthog.identify).toHaveBeenCalledWith(
            'user_123',
            expect.objectContaining({
                email: 'owner@example.com',
                deployment_env: 'beta',
                organization_id: 'org_123',
            })
        )
        expect(testState.mockPosthog.setPersonPropertiesForFlags).toHaveBeenCalled()
    })

    it('resets posthog when user logs out', () => {
        testState.authState.user = {
            id: 'user_456',
            email: 'member@example.com',
            role: 'member',
        }

        const view = render(
            <PostHogFeatureFlagProvider>
                <div>child</div>
            </PostHogFeatureFlagProvider>
        )

        testState.authState.user = null
        view.rerender(
            <PostHogFeatureFlagProvider>
                <div>child</div>
            </PostHogFeatureFlagProvider>
        )

        expect(testState.mockPosthog.reset).toHaveBeenCalled()
    })
})
