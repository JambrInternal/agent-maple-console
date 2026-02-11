import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import useLoginTheme from '../useLoginTheme'

describe('useLoginTheme', () => {
    beforeEach(() => {
        document.documentElement.dataset.theme = 'light'
        localStorage.clear()
    })

    it('applies dark theme on login mount by default', () => {
        const { result } = renderHook(() => useLoginTheme())

        expect(result.current).toBe('light')
        expect(document.documentElement.dataset.theme).toBe('dark')
    })

    it('tracks data-theme changes for logo selection', async () => {
        const { result } = renderHook(() => useLoginTheme())

        document.documentElement.dataset.theme = 'light'

        await waitFor(() => {
            expect(result.current).toBe('light')
        })
    })
})
