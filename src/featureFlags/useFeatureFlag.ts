import { useContext } from 'react'
import { FeatureFlagContext } from './flagContext'
import type { FeatureFlagKey } from './flagCatalog'
import { evaluateFeatureFlag, type FeatureFlagValueSource } from './featureFlagService'

export interface UseFeatureFlagResult {
    key: FeatureFlagKey
    enabled: boolean
    source: FeatureFlagValueSource
    loading: boolean
}

export const useFeatureFlag = (key: FeatureFlagKey): UseFeatureFlagResult => {
    const context = useContext(FeatureFlagContext)
    const posthogValue = context.posthogValues[key]

    const evaluation = evaluateFeatureFlag({
        posthogValue,
    })

    return {
        key,
        enabled: evaluation.enabled,
        source: evaluation.source,
        loading: context.posthogEnabled && !context.posthogReady,
    }
}
