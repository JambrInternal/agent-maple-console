import React from 'react'

const BuildTag = () => {
    const commit = typeof window !== 'undefined' ? window.__APP_COMMIT__ : null
    return (
        <div className="am-build-tag">
            Build {commit || 'dev'}
        </div>
    )
}

export default BuildTag
