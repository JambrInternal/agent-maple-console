import React from 'react'
import FeatureUnavailable from './FeatureUnavailable'
import { useFeatureFlag } from './useFeatureFlag'

const FeatureGateRoute = ({
    flagKey,
    children,
    title,
    description,
}) => {
    const { enabled, loading } = useFeatureFlag(flagKey)

    if (loading) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                Loading feature flags...
            </div>
        )
    }

    if (!enabled) {
        return (
            <FeatureUnavailable
                title={title}
                description={description}
            />
        )
    }

    return <>{children}</>
}

export default FeatureGateRoute
