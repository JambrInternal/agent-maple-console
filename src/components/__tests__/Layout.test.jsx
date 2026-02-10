import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import Layout from '../Layout'

vi.mock('../../contexts/AuthContext', () => ({
    useAuth: () => ({ user: null, logout: vi.fn() }),
}))

describe('Layout', () => {
    it('hides the side navigation when no organization is selected', () => {
        localStorage.clear()
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
    })

    it('shows the super admin banner when admin mode is enabled', () => {
        localStorage.setItem('am_admin_mode', 'true')

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
    })
})
