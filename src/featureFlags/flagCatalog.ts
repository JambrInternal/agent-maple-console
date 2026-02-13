export type DeploymentEnv = 'dev' | 'beta' | 'prod'

export type FeatureFlagKey =
    | 'ff_personality_editor'
    | 'ff_knowledge_cloud_actions'

export type FeatureFlagGateType = 'route' | 'action'

export interface FeatureFlagDefinition {
    key: FeatureFlagKey
    gateType: FeatureFlagGateType
    description: string
    fallbacks: Record<DeploymentEnv, boolean>
}

export const FEATURE_FLAG_CATALOG: Record<FeatureFlagKey, FeatureFlagDefinition> = {
    ff_personality_editor: {
        key: 'ff_personality_editor',
        gateType: 'route',
        description: 'Controls access to the Project Personality editor route and save actions.',
        fallbacks: {
            dev: true,
            beta: true,
            prod: false,
        },
    },
    ff_knowledge_cloud_actions: {
        key: 'ff_knowledge_cloud_actions',
        gateType: 'action',
        description: 'Controls Knowledge cloud connect/reconnect OAuth and sync actions.',
        fallbacks: {
            dev: true,
            beta: true,
            prod: false,
        },
    },
}

export const FEATURE_FLAG_KEYS = Object.keys(FEATURE_FLAG_CATALOG) as FeatureFlagKey[]

export const isFeatureFlagKey = (value: string): value is FeatureFlagKey => {
    return Object.prototype.hasOwnProperty.call(FEATURE_FLAG_CATALOG, value)
}

export const getFeatureFlagDefinition = (key: FeatureFlagKey): FeatureFlagDefinition => {
    return FEATURE_FLAG_CATALOG[key]
}

export const getFeatureFlagFallback = (key: FeatureFlagKey, env: DeploymentEnv): boolean => {
    return FEATURE_FLAG_CATALOG[key].fallbacks[env]
}
