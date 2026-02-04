import React from 'react'
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import Layout from '../Layout'

describe('Layout', () => {
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

        expect(container.querySelector('.am-sidebar')).toBeNull()
        expect(container.querySelector('.am-nav-panel')).toBeNull()
    })
})
