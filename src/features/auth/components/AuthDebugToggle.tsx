import React from 'react'

export default function AuthDebugToggle({ debugEnabled, onToggle }) {
    return (
        <button
            type="button"
            onClick={onToggle}
            className="am-text-2"
            style={{
                marginTop: '0.75rem',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                background: 'none',
                border: '1px solid transparent',
                padding: '0.35rem 0.6rem',
                borderRadius: '999px',
                cursor: 'pointer',
                color: debugEnabled ? 'var(--am-accent)' : 'var(--am-text-2)',
            }}
        >
            {debugEnabled ? 'Disable Debug' : 'Enable Debug'}
        </button>
    )
}
