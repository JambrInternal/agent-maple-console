import React from 'react'
import { AlertCircle, Lock, Mail, Loader2 } from 'lucide-react'

const fieldStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.45rem',
}

const labelStyle = {
    fontSize: '0.75rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    color: 'var(--am-text-2)',
}

const panelBaseStyle = {
    padding: '0.75rem',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.84rem',
}

const infoStyle = {
    ...panelBaseStyle,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    border: '1px solid rgba(34, 197, 94, 0.2)',
    color: '#22c55e',
}

const errorStyle = {
    ...panelBaseStyle,
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.5rem',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    color: '#ef4444',
}

const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
}

const submitButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
}

export default function InvitationAuthCard({
    email,
    authMode,
    password,
    confirmationCode,
    info,
    error,
    isSubmitting,
    onEmailChange,
    onPasswordChange,
    onConfirmationCodeChange,
    onSubmitPassword,
    onSubmitConfirmation,
}) {
    const isConfirmMode = authMode === 'confirm'

    return (
        <div className="am-app-shell" style={{ alignItems: 'center', justifyContent: 'center' }}>
            <div className="am-card" style={{ width: 'min(560px, 92vw)' }}>
                <h1 className="am-page-title" style={{ fontSize: '1.2rem', marginBottom: '0.35rem' }}>
                    Accept Invitation
                </h1>
                <p className="am-text-2" style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>
                    Enter your email and password to continue. If no account exists, we will create one.
                </p>

                {info ? <div style={{ ...infoStyle, marginBottom: '1rem' }}>{info}</div> : null}
                {error ? (
                    <div style={{ ...errorStyle, marginBottom: '1rem' }}>
                        <AlertCircle size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
                        <span>{error}</span>
                    </div>
                ) : null}

                <form
                    onSubmit={isConfirmMode ? onSubmitConfirmation : onSubmitPassword}
                    style={formStyle}
                >
                    <div style={fieldStyle}>
                        <label htmlFor="invite-email" style={labelStyle}>Email</label>
                        <div style={{ position: 'relative' }}>
                            <Mail
                                size={16}
                                style={{
                                    position: 'absolute',
                                    left: '0.75rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--am-text-2)',
                                }}
                            />
                            <input
                                id="invite-email"
                                type="email"
                                className="am-input"
                                style={{ width: '100%', paddingLeft: '2.45rem' }}
                                placeholder="name@example.com"
                                value={email}
                                onChange={(event) => onEmailChange(event.target.value)}
                                autoComplete="email"
                                disabled={isSubmitting || isConfirmMode}
                                required
                            />
                        </div>
                    </div>

                    <div style={fieldStyle}>
                        <label htmlFor="invite-password" style={labelStyle}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock
                                size={16}
                                style={{
                                    position: 'absolute',
                                    left: '0.75rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--am-text-2)',
                                }}
                            />
                            <input
                                id="invite-password"
                                type="password"
                                className="am-input"
                                style={{ width: '100%', paddingLeft: '2.45rem' }}
                                placeholder="••••••••"
                                value={password}
                                onChange={(event) => onPasswordChange(event.target.value)}
                                autoComplete={isConfirmMode ? 'new-password' : 'current-password'}
                                disabled={isSubmitting}
                                required
                            />
                        </div>
                    </div>

                    {isConfirmMode ? (
                        <div style={fieldStyle}>
                            <label htmlFor="invite-confirmation-code" style={labelStyle}>Confirmation Code</label>
                            <input
                                id="invite-confirmation-code"
                                type="text"
                                className="am-input"
                                placeholder="123456"
                                value={confirmationCode}
                                onChange={(event) => onConfirmationCodeChange(event.target.value)}
                                autoComplete="one-time-code"
                                disabled={isSubmitting}
                                required
                            />
                        </div>
                    ) : null}

                    <button
                        type="submit"
                        className="am-btn-primary"
                        style={submitButtonStyle}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
                        {isConfirmMode ? 'Confirm & Continue' : 'Continue'}
                    </button>
                </form>
            </div>
        </div>
    )
}
