export type DeploymentEnv = 'dev' | 'beta' | 'prod'

export type FeatureFlagKey =
    | 'ff_beta'

export type FeatureFlagGateType = 'route' | 'action'

export interface FeatureFlagDefinition {
    key: FeatureFlagKey
    gateType: FeatureFlagGateType
    description: string
}

export const FEATURE_FLAG_CATALOG: Record<FeatureFlagKey, FeatureFlagDefinition> = {
    ff_beta: {
        key: 'ff_beta',
        gateType: 'route',
        description: 'Controls access to all currently beta/coming-soon pages and their beta label rendering.',
    },
}

export const FEATURE_FLAG_KEYS = Object.keys(FEATURE_FLAG_CATALOG) as FeatureFlagKey[]

export const isFeatureFlagKey = (value: string): value is FeatureFlagKey => {
    return Object.prototype.hasOwnProperty.call(FEATURE_FLAG_CATALOG, value)
}

export const getFeatureFlagDefinition = (key: FeatureFlagKey): FeatureFlagDefinition => {
    return FEATURE_FLAG_CATALOG[key]
}
