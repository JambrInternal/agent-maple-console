import React from 'react'

const FeatureUnavailable = ({
    title = 'Feature Unavailable',
    description = 'This feature is disabled for your current environment or rollout targeting.',
}) => {
    return (
        <div className="am-page-content">
            <div className="am-coming-soon">
                <div className="am-card am-coming-soon-card">
                    <h1 className="am-page-title">{title}</h1>
                    <p className="am-text-2">{description}</p>
                </div>
            </div>
        </div>
    )
}

export default FeatureUnavailable
