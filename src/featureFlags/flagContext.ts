import { createContext } from 'react'
import type { DeploymentEnv, FeatureFlagKey } from './flagCatalog'
import type { PostHogTargetingMode } from './featureFlagService'

export interface FeatureFlagContextValue {
    deploymentEnv: DeploymentEnv
    posthogEnabled: boolean
    posthogReady: boolean
    posthogValues: Partial<Record<FeatureFlagKey, boolean>>
    targetingMode: PostHogTargetingMode
    refreshVersion: number
}

export const FeatureFlagContext = createContext<FeatureFlagContextValue>({
    deploymentEnv: 'dev',
    posthogEnabled: false,
    posthogReady: true,
    posthogValues: {},
    targetingMode: 'auto',
    refreshVersion: 0,
})
