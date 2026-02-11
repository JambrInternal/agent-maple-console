import React from 'react'
import { Loader2, Lock, Mail } from 'lucide-react'

const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
}

const fieldContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
}

const labelStyle = {
    fontSize: '0.75rem',
    fontWeight: 600,
    textTransform: 'uppercase',
}

const iconContainerStyle = {
    position: 'relative',
}

const iconStyle = {
    position: 'absolute',
    left: '0.75rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--am-text-2)',
}

const inputBaseStyle = {
    width: '100%',
}

const inputWithIconStyle = {
    width: '100%',
    paddingLeft: '2.5rem',
}

const primaryButtonStyle = {
    padding: '0.75rem',
    marginTop: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
}

const secondaryButtonStyle = {
    justifyContent: 'center',
}

function AuthFieldLabel({ children }) {
    return (
        <label className="am-text-2" style={labelStyle}>
            {children}
        </label>
    )
}

function EmailField({ value, onChange }) {
    return (
        <div style={fieldContainerStyle}>
            <AuthFieldLabel>Email Address</AuthFieldLabel>
            <div style={iconContainerStyle}>
                <Mail size={16} style={iconStyle} />
                <input
                    type="email"
                    className="am-input"
                    style={inputWithIconStyle}
                    placeholder="name@company.com"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    autoComplete="username"
                    required
                />
            </div>
        </div>
    )
}

function PasswordField({
    label,
    value,
    onChange,
    autoComplete,
}) {
    return (
        <div style={fieldContainerStyle}>
            <AuthFieldLabel>{label}</AuthFieldLabel>
            <div style={iconContainerStyle}>
                <Lock size={16} style={iconStyle} />
                <input
                    type="password"
                    className="am-input"
                    style={inputWithIconStyle}
                    placeholder="••••••••"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    autoComplete={autoComplete}
                    required
                />
            </div>
        </div>
    )
}

function ConfirmCodeField({ value, onChange }) {
    return (
        <div style={fieldContainerStyle}>
            <AuthFieldLabel>Confirmation Code</AuthFieldLabel>
            <input
                type="text"
                className="am-input"
                style={inputBaseStyle}
                placeholder="123456"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                autoComplete="one-time-code"
                required
            />
        </div>
    )
}

function SubmitButton({ isSubmitting, label }) {
    return (
        <button
            type="submit"
            className="am-btn-primary"
            style={primaryButtonStyle}
            disabled={isSubmitting}
        >
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : label}
        </button>
    )
}

export default function AuthForms({
    authMode,
    email,
    password,
    confirmPassword,
    confirmationCode,
    isSubmitting,
    onSubmitSignIn,
    onSubmitRegister,
    onSubmitConfirm,
    onEmailChange,
    onPasswordChange,
    onConfirmPasswordChange,
    onConfirmationCodeChange,
    onBackToSignIn,
}) {
    if (authMode === 'confirm') {
        return (
            <form onSubmit={onSubmitConfirm} style={formStyle}>
                <div style={fieldContainerStyle}>
                    <AuthFieldLabel>Email Address</AuthFieldLabel>
                    <input
                        type="email"
                        className="am-input"
                        style={inputBaseStyle}
                        value={email}
                        onChange={(e) => onEmailChange(e.target.value)}
                        autoComplete="username"
                        required
                    />
                </div>

                <ConfirmCodeField
                    value={confirmationCode}
                    onChange={onConfirmationCodeChange}
                />

                <SubmitButton isSubmitting={isSubmitting} label="Confirm Account" />

                <button
                    type="button"
                    className="am-btn-secondary"
                    style={secondaryButtonStyle}
                    onClick={onBackToSignIn}
                    disabled={isSubmitting}
                >
                    Back To Sign In
                </button>
            </form>
        )
    }

    if (authMode === 'register') {
        return (
            <form onSubmit={onSubmitRegister} style={formStyle}>
                <EmailField value={email} onChange={onEmailChange} />

                <PasswordField
                    label="Password"
                    value={password}
                    onChange={onPasswordChange}
                    autoComplete="new-password"
                />

                <PasswordField
                    label="Confirm Password"
                    value={confirmPassword}
                    onChange={onConfirmPasswordChange}
                    autoComplete="new-password"
                />

                <SubmitButton isSubmitting={isSubmitting} label="Create Account" />
            </form>
        )
    }

    return (
        <form onSubmit={onSubmitSignIn} style={formStyle}>
            <EmailField value={email} onChange={onEmailChange} />

            <PasswordField
                label="Password"
                value={password}
                onChange={onPasswordChange}
                autoComplete="current-password"
            />

            <SubmitButton isSubmitting={isSubmitting} label="Sign In" />
        </form>
    )
}
