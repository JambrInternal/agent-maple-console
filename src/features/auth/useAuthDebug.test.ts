import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import useAuthDebug from './useAuthDebug'

vi.mock('../../api/client', () => ({
  getErrorStatus: vi.fn(() => 400),
}))

describe('useAuthDebug', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('enables debug from query parameter when no local override exists', () => {
    const { result } = renderHook(() => useAuthDebug({ search: '?debug=auth' }))
    expect(result.current.debugEnabled).toBe(true)
  })

  it('enables debug from persisted local preference', () => {
    localStorage.setItem('am_debug_auth', 'true')
    const { result } = renderHook(() => useAuthDebug({ search: '' }))
    expect(result.current.debugEnabled).toBe(true)
  })

  it('appends debug events only when enabled', () => {
    const { result } = renderHook(() => useAuthDebug({ search: '?debug=auth' }))

    act(() => {
      result.current.pushDebug('Login failed', { message: 'Bad credentials' })
    })

    expect(result.current.debugEvents).toHaveLength(1)
    expect(result.current.debugEvents[0]).toContain('Login failed (Status 400)')
    expect(result.current.debugEvents[0]).toContain('Bad credentials')
  })

  it('toggleDebug persists state and clears previous events', () => {
    const { result } = renderHook(() => useAuthDebug({ search: '?debug=auth' }))

    act(() => {
      result.current.pushDebug('Login failed', { message: 'Bad credentials' })
    })
    expect(result.current.debugEvents).toHaveLength(1)

    act(() => {
      result.current.toggleDebug()
    })

    expect(result.current.debugEnabled).toBe(false)
    expect(localStorage.getItem('am_debug_auth')).toBe('false')
    expect(result.current.debugEvents).toEqual([])

    act(() => {
      result.current.toggleDebug()
    })

    expect(result.current.debugEnabled).toBe(true)
    expect(localStorage.getItem('am_debug_auth')).toBe('true')
  })
})
