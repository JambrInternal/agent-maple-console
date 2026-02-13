import { describe, expect, it } from 'vitest'
import {
    evaluateFeatureFlag,
    resolveDeploymentEnv,
    resolvePostHogEnabled,
    resolvePostHogTargetingMode,
    shouldAttemptGroupTargeting,
} from '../featureFlagService'

describe('featureFlagService', () => {
    it('resolves deployment env from APP_ENV override first', () => {
        expect(resolveDeploymentEnv({
            appEnv: 'prod',
            hostname: 'beta.agentmaple.ca',
        })).toBe('prod')
    })

    it('resolves deployment env from hostname when APP_ENV is not set', () => {
        expect(resolveDeploymentEnv({
            appEnv: '',
            hostname: 'beta.agentmaple.ca',
        })).toBe('beta')
        expect(resolveDeploymentEnv({
            appEnv: '',
            hostname: 'app.agentmaple.ca',
        })).toBe('prod')
        expect(resolveDeploymentEnv({
            appEnv: '',
            hostname: 'localhost',
        })).toBe('dev')
    })

    it('returns unavailable when posthog value is missing', () => {
        const result = evaluateFeatureFlag({
            posthogValue: undefined,
        })

        expect(result).toEqual({
            enabled: false,
            source: 'unavailable',
        })
    })

    it('accepts posthog value when present', () => {
        const result = evaluateFeatureFlag({
            posthogValue: true,
        })

        expect(result).toEqual({
            enabled: true,
            source: 'posthog',
        })
    })

    it('parses posthog config helpers safely', () => {
        expect(resolvePostHogEnabled('false')).toBe(false)
        expect(resolvePostHogEnabled('0')).toBe(false)
        expect(resolvePostHogEnabled(undefined)).toBe(true)

        expect(resolvePostHogTargetingMode('group_and_person')).toBe('group_and_person')
        expect(resolvePostHogTargetingMode('person_only')).toBe('person_only')
        expect(resolvePostHogTargetingMode('unexpected')).toBe('auto')
    })

    it('switches auto targeting to person-only when auto fallback is active', () => {
        expect(shouldAttemptGroupTargeting({
            targetingMode: 'auto',
            autoFallbackToPersonOnly: false,
        })).toBe(true)

        expect(shouldAttemptGroupTargeting({
            targetingMode: 'auto',
            autoFallbackToPersonOnly: true,
        })).toBe(false)
    })
})
