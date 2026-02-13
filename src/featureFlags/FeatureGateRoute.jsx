import React from 'react'
import FeatureUnavailable from './FeatureUnavailable'
import { useFeatureFlag } from './useFeatureFlag'

const FeatureGateRoute = ({
    flagKey,
    children,
    title,
    description,
}) => {
    const { enabled } = useFeatureFlag(flagKey)

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
