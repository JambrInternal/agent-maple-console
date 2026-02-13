import { describe, expect, it } from 'vitest'
import {
    evaluateFeatureFlag,
    getFlagOverrideStorageKey,
    resolveDeploymentEnv,
    resolveFeatureFlagOverrideValue,
    resolvePostHogEnabled,
    resolvePostHogTargetingMode,
    shouldAttemptGroupTargeting,
} from '../featureFlagService'

const createStorage = (entries: Record<string, string> = {}) => {
    const map = new Map(Object.entries(entries))
    return {
        getItem: (key: string) => map.get(key) ?? null,
        setItem: (key: string, value: string) => {
            map.set(key, value)
        },
        removeItem: (key: string) => {
            map.delete(key)
        },
    }
}

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

    it('uses query override in non-prod environments', () => {
        const result = resolveFeatureFlagOverrideValue({
            key: 'ff_personality_editor',
            deploymentEnv: 'beta',
            search: '?ff.ff_personality_editor=off',
        })

        expect(result).toBe(false)
    })

    it('uses localStorage override when query override is missing', () => {
        const storage = createStorage({
            [getFlagOverrideStorageKey('ff_personality_editor')]: 'on',
        })

        const result = resolveFeatureFlagOverrideValue({
            key: 'ff_personality_editor',
            deploymentEnv: 'dev',
            search: '',
            storage,
        })

        expect(result).toBe(true)
    })

    it('rejects all overrides in prod', () => {
        const storage = createStorage({
            [getFlagOverrideStorageKey('ff_personality_editor')]: 'on',
        })

        expect(resolveFeatureFlagOverrideValue({
            key: 'ff_personality_editor',
            deploymentEnv: 'prod',
            search: '?ff.ff_personality_editor=off',
            storage,
        })).toBeNull()
    })

    it('falls back to catalog default when posthog and override are unavailable', () => {
        const result = evaluateFeatureFlag({
            key: 'ff_personality_editor',
            deploymentEnv: 'prod',
            posthogValue: undefined,
            search: '',
            storage: createStorage(),
        })

        expect(result).toEqual({
            enabled: false,
            source: 'fallback',
        })
    })

    it('accepts posthog value when present', () => {
        const result = evaluateFeatureFlag({
            key: 'ff_knowledge_cloud_actions',
            deploymentEnv: 'prod',
            posthogValue: true,
            search: '',
            storage: createStorage(),
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
