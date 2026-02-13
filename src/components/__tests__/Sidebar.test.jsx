import React from 'react'
import { describe, expect, it, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import Sidebar from '../Sidebar'

const mockUseFeatureFlag = vi.fn()

vi.mock('../../featureFlags/useFeatureFlag', () => ({
    useFeatureFlag: (...args) => mockUseFeatureFlag(...args),
}))

vi.mock('../../hooks/useApiQuery', () => ({
    useApiQuery: () => ({
        data: {
            firstName: 'Site',
            phoneNumber: '+1 555-000-0000',
        },
        isLoading: false,
    }),
}))

describe('Sidebar feature gating', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    const renderSidebar = () => {
        render(
            <MemoryRouter initialEntries={['/org_1/proj_1/contacts']}>
                <Routes>
                    <Route path="/:orgId/:projId/contacts" element={<Sidebar />} />
                </Routes>
            </MemoryRouter>
        )
    }

    it('shows Personality nav item when flag is enabled', () => {
        mockUseFeatureFlag.mockReturnValue({
            enabled: true,
            source: 'posthog',
            loading: false,
        })

        renderSidebar()

        expect(screen.getByRole('link', { name: 'Personality' })).toBeInTheDocument()
    })

    it('hides Personality nav item when flag is disabled', () => {
        mockUseFeatureFlag.mockReturnValue({
            enabled: false,
            source: 'posthog',
            loading: false,
        })

        renderSidebar()

        expect(screen.queryByRole('link', { name: 'Personality' })).not.toBeInTheDocument()
    })
})
