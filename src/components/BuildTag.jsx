import React from 'react'

const BuildTag = () => {
    const commit = import.meta.env.VITE_GIT_COMMIT || 'dev';
    return (
        <div className="am-build-tag">
            Version {commit}
        </div>
    );
}

export default BuildTag
