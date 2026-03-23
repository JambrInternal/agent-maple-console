import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import BuildTag from './BuildTag'
import { getAppConfig } from '../../config/runtimeConfig'

vi.mock('../../config/runtimeConfig', () => ({
  getAppConfig: vi.fn(),
}))

describe('BuildTag', () => {
  const originalEnv = { ...import.meta.env }

  beforeEach(() => {
    vi.clearAllMocks()
    delete window.__APP_COMMIT__
    Object.keys(import.meta.env).forEach((key) => {
      delete import.meta.env[key]
    })
    vi.mocked(getAppConfig).mockReturnValue({
      API_URL: '',
      AWS_REGION: '',
      COGNITO_USER_POOL_ID: '',
      COGNITO_APP_CLIENT_ID: '',
      SENTRY_DSN: '',
      GIT_COMMIT: '',
    })
  })

  it('renders short git hash from runtime config', () => {
    vi.mocked(getAppConfig).mockReturnValue({
      API_URL: '',
      AWS_REGION: '',
      COGNITO_USER_POOL_ID: '',
      COGNITO_APP_CLIENT_ID: '',
      SENTRY_DSN: '',
      GIT_COMMIT: '0123456789abcdef0123456789abcdef01234567',
    })

    render(<BuildTag />)

    expect(screen.getByText('Version 0123456')).toBeInTheDocument()
  })

  it('falls back to global commit when runtime/env values are unknown', () => {
    vi.mocked(getAppConfig).mockReturnValue({
      API_URL: '',
      AWS_REGION: '',
      COGNITO_USER_POOL_ID: '',
      COGNITO_APP_CLIENT_ID: '',
      SENTRY_DSN: '',
      GIT_COMMIT: 'unknown',
    })
    import.meta.env.VITE_GIT_COMMIT = 'unknown'
    window.__APP_COMMIT__ = 'abc1234'

    render(<BuildTag />)

    expect(screen.getByText('Version abc1234')).toBeInTheDocument()
  })

  it('falls back to dev when no valid commit source is available', () => {
    vi.mocked(getAppConfig).mockReturnValue({
      API_URL: '',
      AWS_REGION: '',
      COGNITO_USER_POOL_ID: '',
      COGNITO_APP_CLIENT_ID: '',
      SENTRY_DSN: '',
      GIT_COMMIT: 'unknown',
    })
    import.meta.env.VITE_GIT_COMMIT = 'unknown'

    render(<BuildTag />)

    expect(screen.getByText('Version dev')).toBeInTheDocument()
  })

  afterEach(() => {
    Object.keys(import.meta.env).forEach((key) => {
      delete import.meta.env[key]
    })
    Object.keys(originalEnv).forEach((key) => {
      import.meta.env[key] = originalEnv[key]
    })
  })
})
