import React from 'react'
import { Button } from '../../../../components/ui'

const inviteNoticeStyle = {
    marginBottom: '1rem',
    padding: '0.75rem',
    backgroundColor: 'rgba(194, 106, 46, 0.1)',
    border: '1px solid rgba(194, 106, 46, 0.3)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--am-text-1)',
    fontSize: '0.82rem',
}

const switchContainerStyle = {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1rem',
}

const switchButtonStyle = {
    flex: 1,
    justifyContent: 'center',
}

const missingInviteEmailStyle = {
    marginTop: '0.5rem',
    color: '#ef4444',
    fontWeight: 600,
}

export default function AuthInviteControls({
    hasInviteContext,
    inviteEmail,
    authMode,
    isSubmitting,
    onSwitchToSignIn,
    onSwitchToRegister,
}) {
    if (!hasInviteContext) return null

    return (
        <>
            <div style={inviteNoticeStyle}>
                You were invited to join an organization. If this email already has an account, sign in with your password. If not, create an account first.
                {inviteEmail ? (
                    <div style={{ marginTop: '0.35rem', fontWeight: 600 }}>
                        Invited email: {inviteEmail}
                    </div>
                ) : (
                    <div style={missingInviteEmailStyle}>
                        This invite link is missing email context. Reopen the original invitation email to continue.
                    </div>
                )}
            </div>

            {authMode !== 'confirm' && (
                <div style={switchContainerStyle}>
                    <Button
                        type="button"
                        variant={authMode === 'signin' ? 'primary' : 'secondary'}
                        style={switchButtonStyle}
                        onClick={onSwitchToSignIn}
                        disabled={isSubmitting}
                    >
                        Sign In
                    </Button>
                    <Button
                        type="button"
                        variant={authMode === 'register' ? 'primary' : 'secondary'}
                        style={switchButtonStyle}
                        onClick={onSwitchToRegister}
                        disabled={isSubmitting}
                    >
                        Create Account
                    </Button>
                </div>
            )}
        </>
    )
}
