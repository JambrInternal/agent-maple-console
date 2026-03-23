import { describe, expect, it } from 'vitest'
import { ApiError } from '../api/client'
import { withStatus } from './errors'

describe('errors utils', () => {
  it('prefers ApiError detail string over generic error message', () => {
    const error = new ApiError(403, 'Forbidden', 'API Error: 403', {
      detail: 'Not admin',
    })

    expect(withStatus('Failed to load projects.', error))
      .toBe('Failed to load projects. (Status 403: Not admin)')
  })

  it('extracts ApiError detail array message for validation errors', () => {
    const error = new ApiError(422, 'Unprocessable Entity', 'API Error: 422', {
      detail: [{ msg: 'Field required' }],
    })

    expect(withStatus('Failed to accept invitation.', error))
      .toBe('Failed to accept invitation. (Status 422: Field required)')
  })

  it('falls back to normal error message for non-api errors', () => {
    expect(withStatus('Failed to load projects.', new Error('boom')))
      .toBe('Failed to load projects. (boom)')
  })
})
