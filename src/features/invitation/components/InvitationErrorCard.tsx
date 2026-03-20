import React from 'react'
import { AlertCircle } from 'lucide-react'

export default function InvitationErrorCard({
    error,
    isEmailMismatch,
    isSigningOut,
    onSignOutAndRetry,
    onGoToLogin,
}) {
    return (
        <div className="am-app-shell" style={{ alignItems: 'center', justifyContent: 'center' }}>
            <div className="am-card" style={{ width: 'min(560px, 92vw)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', marginBottom: '0.75rem' }}>
                    <AlertCircle size={18} style={{ color: '#ef4444', marginTop: '2px' }} />
                    <div>
                        <h1 className="am-page-title" style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>
                            Invitation Could Not Be Accepted
                        </h1>
                        <p className="am-text-2" style={{ fontSize: '0.9rem' }}>{error}</p>
                    </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                    {isEmailMismatch ? (
                        <button
                            type="button"
                            className="am-btn-primary"
                            onClick={onSignOutAndRetry}
                            disabled={isSigningOut}
                        >
                            {isSigningOut ? 'Signing Out...' : 'Sign Out & Continue'}
                        </button>
                    ) : (
                        <button type="button" className="am-btn-primary" onClick={onGoToLogin}>
                            Go To Login
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
