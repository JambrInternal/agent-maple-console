import {
    getFeatureFlagFallback,
    isFeatureFlagKey,
    type DeploymentEnv,
    type FeatureFlagKey,
} from './flagCatalog'

type StorageLike = Pick<Storage, 'getItem' | 'removeItem' | 'setItem'>

export type PostHogTargetingMode = 'auto' | 'group_and_person' | 'person_only'

export type FeatureFlagValueSource = 'override' | 'posthog' | 'fallback'

export interface FeatureFlagEvaluation {
    enabled: boolean
    source: FeatureFlagValueSource
}

export const FEATURE_FLAG_OVERRIDE_QUERY_PREFIX = 'ff.'
export const FEATURE_FLAG_OVERRIDE_STORAGE_PREFIX = 'am_flag_override_'
export const ORGANIZATION_STORAGE_KEY = 'am_tenant_id'

const TRUE_OVERRIDE_VALUES = new Set(['1', 'on', 'true', 'enabled', 'yes'])
const FALSE_OVERRIDE_VALUES = new Set(['0', 'off', 'false', 'disabled', 'no'])

const normalizeText = (value: unknown): string => {
    if (typeof value !== 'string') return ''
    return value.trim()
}

const parseBooleanOverride = (value: unknown): boolean | null => {
    const normalized = normalizeText(value).toLowerCase()
    if (!normalized) return null
    if (TRUE_OVERRIDE_VALUES.has(normalized)) return true
    if (FALSE_OVERRIDE_VALUES.has(normalized)) return false
    return null
}

export const getFlagOverrideStorageKey = (key: FeatureFlagKey): string => {
    return `${FEATURE_FLAG_OVERRIDE_STORAGE_PREFIX}${key}`
}

export const setLocalFeatureFlagOverride = (
    key: FeatureFlagKey,
    value: boolean,
    storage?: StorageLike
): void => {
    const target = storage || (typeof localStorage !== 'undefined' ? localStorage : null)
    if (!target) return
    target.setItem(getFlagOverrideStorageKey(key), value ? 'on' : 'off')
}

export const clearLocalFeatureFlagOverride = (
    key: FeatureFlagKey,
    storage?: StorageLike
): void => {
    const target = storage || (typeof localStorage !== 'undefined' ? localStorage : null)
    if (!target) return
    target.removeItem(getFlagOverrideStorageKey(key))
}

const getQueryOverrideValue = (key: FeatureFlagKey, search: string): boolean | null => {
    const params = new URLSearchParams(search)
    const raw = params.get(`${FEATURE_FLAG_OVERRIDE_QUERY_PREFIX}${key}`)
    return parseBooleanOverride(raw)
}

const getStorageOverrideValue = (
    key: FeatureFlagKey,
    storage?: StorageLike
): boolean | null => {
    const target = storage || (typeof localStorage !== 'undefined' ? localStorage : null)
    if (!target) return null
    return parseBooleanOverride(target.getItem(getFlagOverrideStorageKey(key)))
}

export const resolveFeatureFlagOverrideValue = ({
    key,
    deploymentEnv,
    search,
    storage,
}: {
    key: FeatureFlagKey
    deploymentEnv: DeploymentEnv
    search: string
    storage?: StorageLike
}): boolean | null => {
    if (deploymentEnv === 'prod') {
        return null
    }

    const queryOverride = getQueryOverrideValue(key, search)
    if (queryOverride !== null) {
        return queryOverride
    }

    return getStorageOverrideValue(key, storage)
}

export const resolvePostHogEnabled = (rawValue: unknown): boolean => {
    const normalized = normalizeText(rawValue).toLowerCase()
    if (!normalized) return true
    if (FALSE_OVERRIDE_VALUES.has(normalized)) return false
    return true
}

export const resolvePostHogHost = (rawValue: unknown): string => {
    const normalized = normalizeText(rawValue)
    return normalized || 'https://us.i.posthog.com'
}

export const resolvePostHogTargetingMode = (rawValue: unknown): PostHogTargetingMode => {
    const normalized = normalizeText(rawValue).toLowerCase()
    if (normalized === 'group_and_person') return 'group_and_person'
    if (normalized === 'person_only') return 'person_only'
    return 'auto'
}

export const resolveDeploymentEnv = ({
    appEnv,
    hostname,
}: {
    appEnv?: string | null
    hostname?: string | null
}): DeploymentEnv => {
    const normalizedAppEnv = normalizeText(appEnv).toLowerCase()
    if (normalizedAppEnv === 'beta' || normalizedAppEnv === 'prod' || normalizedAppEnv === 'dev') {
        return normalizedAppEnv
    }

    const normalizedHost = normalizeText(hostname).toLowerCase()
    if (normalizedHost === 'beta.agentmaple.ca') return 'beta'
    if (normalizedHost === 'app.agentmaple.ca') return 'prod'
    return 'dev'
}

export const shouldAttemptGroupTargeting = ({
    targetingMode,
    autoFallbackToPersonOnly,
}: {
    targetingMode: PostHogTargetingMode
    autoFallbackToPersonOnly: boolean
}): boolean => {
    if (targetingMode === 'group_and_person') return true
    if (targetingMode === 'person_only') return false
    return !autoFallbackToPersonOnly
}

export const evaluateFeatureFlag = ({
    key,
    deploymentEnv,
    posthogValue,
    search,
    storage,
}: {
    key: FeatureFlagKey
    deploymentEnv: DeploymentEnv
    posthogValue: boolean | undefined
    search: string
    storage?: StorageLike
}): FeatureFlagEvaluation => {
    const override = resolveFeatureFlagOverrideValue({
        key,
        deploymentEnv,
        search,
        storage,
    })
    if (override !== null) {
        return {
            enabled: override,
            source: 'override',
        }
    }

    if (typeof posthogValue === 'boolean') {
        return {
            enabled: posthogValue,
            source: 'posthog',
        }
    }

    return {
        enabled: getFeatureFlagFallback(key, deploymentEnv),
        source: 'fallback',
    }
}

export const readCurrentOrganizationId = (storage?: StorageLike): string | null => {
    const target = storage || (typeof localStorage !== 'undefined' ? localStorage : null)
    if (!target) return null
    const value = normalizeText(target.getItem(ORGANIZATION_STORAGE_KEY))
    return value || null
}

export const TENANT_CHANGE_EVENT = 'am_tenant_change'

export const dispatchTenantChange = (newTenantId: string | null): void => {
    if (typeof window === 'undefined') return
    window.dispatchEvent(new CustomEvent(TENANT_CHANGE_EVENT, { detail: { tenantId: newTenantId } }))
}

export const coerceFlagKey = (value: string): FeatureFlagKey | null => {
    if (!isFeatureFlagKey(value)) return null
    return value
}
