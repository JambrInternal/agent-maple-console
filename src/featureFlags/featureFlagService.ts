import {
    isFeatureFlagKey,
    type DeploymentEnv,
    type FeatureFlagKey,
} from './flagCatalog'

type StorageLike = Pick<Storage, 'getItem'>

export type PostHogTargetingMode = 'auto' | 'group_and_person' | 'person_only'

export type FeatureFlagValueSource = 'posthog' | 'unavailable'

export interface FeatureFlagEvaluation {
    enabled: boolean
    source: FeatureFlagValueSource
}

export const ORGANIZATION_STORAGE_KEY = 'am_tenant_id'

const FALSE_TEXT_VALUES = new Set(['0', 'off', 'false', 'disabled', 'no'])

const normalizeText = (value: unknown): string => {
    if (typeof value !== 'string') return ''
    return value.trim()
}

export const resolvePostHogEnabled = (rawValue: unknown): boolean => {
    const normalized = normalizeText(rawValue).toLowerCase()
    if (!normalized) return true
    if (FALSE_TEXT_VALUES.has(normalized)) return false
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
    const normalizedHost = normalizeText(hostname).toLowerCase()
    if (normalizedHost === 'beta.agentmaple.ca') return 'beta'
    if (normalizedHost === 'app.agentmaple.ca') return 'prod'

    const normalizedAppEnv = normalizeText(appEnv).toLowerCase()
    if (normalizedAppEnv === 'beta' || normalizedAppEnv === 'prod' || normalizedAppEnv === 'dev') {
        return normalizedAppEnv
    }

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
    posthogValue,
}: {
    posthogValue: boolean | undefined
}): FeatureFlagEvaluation => {
    if (typeof posthogValue === 'boolean') {
        return {
            enabled: posthogValue,
            source: 'posthog',
        }
    }

    return {
        enabled: false,
        source: 'unavailable',
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
