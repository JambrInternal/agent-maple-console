import { beforeEach, describe, expect, it } from 'vitest'
import {
    applyThemeForAdminMode,
    clearTheme,
    getStoredTheme,
    getThemeForAdminMode,
    setTheme,
} from '../theme'

describe('theme utils', () => {
    beforeEach(() => {
        localStorage.clear()
        document.documentElement.dataset.theme = 'dark'
    })

    it('maps super admin mode to light theme and non-admin mode to dark theme', () => {
        expect(getThemeForAdminMode(true)).toBe('light')
        expect(getThemeForAdminMode(false)).toBe('dark')
    })

    it('applies light theme for super admin mode', () => {
        const applied = applyThemeForAdminMode(true)
        expect(applied).toBe('light')
        expect(document.documentElement.dataset.theme).toBe('light')
        expect(getStoredTheme()).toBe('light')
    })

    it('applies dark theme for non-admin mode', () => {
        setTheme('light')
        const applied = applyThemeForAdminMode(false)
        expect(applied).toBe('dark')
        expect(document.documentElement.dataset.theme).toBe('dark')
        expect(getStoredTheme()).toBe('dark')
    })

    it('clears stored theme and restores dark default', () => {
        setTheme('light')
        clearTheme()
        expect(getStoredTheme()).toBeNull()
        expect(document.documentElement.dataset.theme).toBe('dark')
    })
})
