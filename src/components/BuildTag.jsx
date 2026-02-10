import React, { useState } from 'react'

const BuildTag = () => {
    const commit = import.meta.env.VITE_GIT_COMMIT || 'dev'
    const [debugEnabled, setDebugEnabled] = useState(() => {
        if (typeof window === 'undefined') return false
        return localStorage.getItem('am_debug_auth') === 'true'
    })

    const toggleDebug = () => {
        if (typeof window === 'undefined') return
        const next = !debugEnabled
        localStorage.setItem('am_debug_auth', String(next))
        setDebugEnabled(next)
        window.dispatchEvent(new Event('am_debug_auth_changed'))
    }
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {debugEnabled && (
                <div style={{
                    background: '#e53935',
                    color: '#fff',
                    fontWeight: 'bold',
                    borderRadius: '16px',
                    padding: '2px 12px',
                    marginBottom: '6px',
                    fontSize: '12px',
                }}>
                    DEBUG MODE
                </div>
            )}
            <span
                style={{
                    fontSize: '12px',
                    color: '#888',
                    cursor: 'pointer',
                    userSelect: 'none',
                }}
                title="Build version"
                onClick={toggleDebug}
            >
                Version {commit}
            </span>
        </div>
    );
}

export default BuildTag
