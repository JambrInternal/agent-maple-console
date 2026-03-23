import { describe, expect, it } from 'vitest'
import { formatContactDate } from './contactsUtils'

describe('contactsUtils', () => {
  it('formats a valid created date', () => {
    expect(formatContactDate('2026-02-11T10:00:00Z')).not.toBe('—')
  })

  it('returns fallback for empty or invalid dates', () => {
    expect(formatContactDate('')).toBe('—')
    expect(formatContactDate('not-a-date')).toBe('—')
  })
})
