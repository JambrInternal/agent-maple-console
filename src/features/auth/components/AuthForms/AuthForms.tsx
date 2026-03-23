import React from 'react'
import { Loader2, Lock, Mail } from 'lucide-react'
import { Button, Input } from '../../../../components/ui'

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

const inviteEmailValueStyle = {
  width: '100%',
  minHeight: '2.75rem',
  display: 'flex',
  alignItems: 'center',
  padding: '0.65rem 0.75rem',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid rgba(148, 163, 184, 0.3)',
  background: 'rgba(15, 23, 42, 0.35)',
  color: 'var(--am-text-1)',
  fontSize: '0.95rem',
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
        <Input
          type="email"
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
        <Input
          type="password"
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
      <Input
        type="text"
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
    <Button
      type="submit"
      variant="primary"
      style={primaryButtonStyle}
      disabled={isSubmitting}
    >
      {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : label}
    </Button>
  )
}

function InviteEmailSummary({ email }) {
  const displayEmail = email || 'Unavailable from invite link'
  return (
    <div style={fieldContainerStyle}>
      <AuthFieldLabel>Invited Email</AuthFieldLabel>
      <div style={inviteEmailValueStyle}>{displayEmail}</div>
    </div>
  )
}

export default function AuthForms({
  authMode,
  email,
  inviteEmail,
  lockEmailToInvite = false,
  password,
  confirmPassword,
  confirmationCode,
  isSubmitting,
  onSubmitSignIn,
  onSubmitRegister,
  onSubmitConfirm,
  onSubmitResetRequest,
  onSubmitResetConfirm,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onConfirmationCodeChange,
  onForgotPassword,
  onBackToSignIn,
}) {
  if (authMode === 'confirm') {
    return (
      <form onSubmit={onSubmitConfirm} style={formStyle}>
        {lockEmailToInvite ? (
          <InviteEmailSummary email={inviteEmail} />
        ) : (
          <div style={fieldContainerStyle}>
            <AuthFieldLabel>Email Address</AuthFieldLabel>
            <Input
              type="email"
              style={inputBaseStyle}
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              autoComplete="username"
              required
            />
          </div>
        )}

        <ConfirmCodeField
          value={confirmationCode}
          onChange={onConfirmationCodeChange}
        />

        <SubmitButton isSubmitting={isSubmitting} label="Confirm Account" />

        <Button
          type="button"
          variant="secondary"
          style={secondaryButtonStyle}
          onClick={onBackToSignIn}
          disabled={isSubmitting}
        >
                    Back To Sign In
        </Button>
      </form>
    )
  }

  if (authMode === 'register') {
    return (
      <form onSubmit={onSubmitRegister} style={formStyle}>
        {lockEmailToInvite ? (
          <InviteEmailSummary email={inviteEmail} />
        ) : (
          <EmailField value={email} onChange={onEmailChange} />
        )}

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

  if (authMode === 'reset-request') {
    return (
      <form onSubmit={onSubmitResetRequest} style={formStyle}>
        <EmailField value={email} onChange={onEmailChange} />

        <SubmitButton isSubmitting={isSubmitting} label="Send Reset Code" />

        <Button
          type="button"
          variant="secondary"
          style={secondaryButtonStyle}
          onClick={onBackToSignIn}
          disabled={isSubmitting}
        >
                    Back To Sign In
        </Button>
      </form>
    )
  }

  if (authMode === 'reset-confirm') {
    return (
      <form onSubmit={onSubmitResetConfirm} style={formStyle}>
        <EmailField value={email} onChange={onEmailChange} />

        <ConfirmCodeField
          value={confirmationCode}
          onChange={onConfirmationCodeChange}
        />

        <PasswordField
          label="New Password"
          value={password}
          onChange={onPasswordChange}
          autoComplete="new-password"
        />

        <PasswordField
          label="Confirm New Password"
          value={confirmPassword}
          onChange={onConfirmPasswordChange}
          autoComplete="new-password"
        />

        <SubmitButton isSubmitting={isSubmitting} label="Reset Password" />

        <Button
          type="button"
          variant="secondary"
          style={secondaryButtonStyle}
          onClick={onBackToSignIn}
          disabled={isSubmitting}
        >
                    Back To Sign In
        </Button>
      </form>
    )
  }

  return (
    <form onSubmit={onSubmitSignIn} style={formStyle}>
      {lockEmailToInvite ? (
        <InviteEmailSummary email={inviteEmail} />
      ) : (
        <EmailField value={email} onChange={onEmailChange} />
      )}

      <PasswordField
        label="Password"
        value={password}
        onChange={onPasswordChange}
        autoComplete="current-password"
      />

      <SubmitButton isSubmitting={isSubmitting} label="Sign In" />

      {!lockEmailToInvite ? (
        <Button
          type="button"
          variant="secondary"
          style={secondaryButtonStyle}
          onClick={onForgotPassword}
          disabled={isSubmitting}
        >
                    Forgot Password?
        </Button>
      ) : null}
    </form>
  )
}
