import React from 'react'
import { beforeEach, describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import Layout from './Layout'

vi.mock('../../contexts/AuthContext', () => ({
    useAuth: () => ({ user: null, logout: vi.fn() }),
}))

describe('Layout', () => {
    beforeEach(() => {
        localStorage.clear()
        document.documentElement.dataset.theme = 'dark'
    })

    it('hides the side navigation when no organization is selected', () => {
        const { container } = render(
            <MemoryRouter initialEntries={['/']}>
                <Routes>
                    <Route element={<Layout />}>
                        <Route index element={<div>Org Selection</div>} />
                    </Route>
                </Routes>
            </MemoryRouter>
        )

        expect(container.querySelector('.am-topbar')).not.toBeNull()
        expect(container.querySelector('.am-nav-panel')).toBeNull()
        expect(document.documentElement.dataset.theme).toBe('dark')
    })

    it('shows the super admin banner when admin mode is enabled', () => {
        localStorage.setItem('am_admin_mode', 'true')
        document.documentElement.dataset.theme = 'dark'

        render(
            <MemoryRouter initialEntries={['/']}>
                <Routes>
                    <Route element={<Layout />}>
                        <Route index element={<div>Org Selection</div>} />
                    </Route>
                </Routes>
            </MemoryRouter>
        )

        expect(screen.getByText('SUPER ADMIN')).toBeInTheDocument()
        expect(document.documentElement.dataset.theme).toBe('light')
    })

    it('forces dark theme when super admin mode is disabled', () => {
        localStorage.setItem('am_admin_mode', 'false')
        document.documentElement.dataset.theme = 'light'

        render(
            <MemoryRouter initialEntries={['/']}>
                <Routes>
                    <Route element={<Layout />}>
                        <Route index element={<div>Org Selection</div>} />
                    </Route>
                </Routes>
            </MemoryRouter>
        )

        expect(document.documentElement.dataset.theme).toBe('dark')
    })
})
