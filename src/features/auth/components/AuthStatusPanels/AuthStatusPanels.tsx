import React from 'react'
import { AlertCircle } from 'lucide-react'
import { getAmplifyAuthConfig } from '../../../../amplify-config'

const errorStyle = {
    display: 'flex',
    gap: '8px',
    padding: '0.75rem',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: 'var(--radius-sm)',
    color: '#ef4444',
    fontSize: '0.875rem',
    marginBottom: '1rem',
}

const infoStyle = {
    padding: '0.75rem',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    border: '1px solid rgba(34, 197, 94, 0.2)',
    borderRadius: 'var(--radius-sm)',
    color: '#22c55e',
    fontSize: '0.82rem',
    marginBottom: '1rem',
}

const debugStyle = {
    padding: '0.75rem',
    marginBottom: '1rem',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    border: '1px solid rgba(148, 163, 184, 0.3)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--am-text-2)',
    fontSize: '0.75rem',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
}

const buildDebugText = (debugEvents) => {
    const config = getAmplifyAuthConfig()
    const lines = [
        `Cognito region: ${config.region}`,
        `Cognito user pool: ${config.userPoolId}`,
        `Cognito app client: ${config.userPoolClientId}`,
    ]

    if (debugEvents.length > 0) {
        lines.push('', ...debugEvents)
    }

    return lines.join('\n')
}

export default function AuthStatusPanels({
    error,
    info,
    debugEnabled,
    debugEvents,
}) {
    return (
        <>
            {error && (
                <div style={errorStyle}>
                    <AlertCircle size={18} style={{ flexShrink: 0 }} />
                    <span>{error}</span>
                </div>
            )}

            {info && (
                <div style={infoStyle}>
                    {info}
                </div>
            )}

            {debugEnabled && (
                <div style={debugStyle}>
                    {buildDebugText(debugEvents)}
                </div>
            )}
        </>
    )
}
