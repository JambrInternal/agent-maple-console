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
    const buildFlagState = (enabled) => ({
        enabled,
        source: 'posthog',
        loading: false,
    })

    const setFeatureFlags = (overrides = {}) => {
        mockUseFeatureFlag.mockImplementation((key) => buildFlagState(Boolean(overrides[key])))
    }

    beforeEach(() => {
        vi.clearAllMocks()
        setFeatureFlags({
            ff_personality_editor: true,
        })
    })

    const renderProjectSidebar = () => {
        render(
            <MemoryRouter initialEntries={['/org_1/proj_1/contacts']}>
                <Routes>
                    <Route path="/:orgId/:projId/contacts" element={<Sidebar />} />
                </Routes>
            </MemoryRouter>
        )
    }

    const renderOrgSidebar = () => {
        render(
            <MemoryRouter initialEntries={['/org_1/projects']}>
                <Routes>
                    <Route path="/:orgId/projects" element={<Sidebar />} />
                </Routes>
            </MemoryRouter>
        )
    }

    it('shows Personality nav item when flag is enabled', () => {
        setFeatureFlags({
            ff_personality_editor: true,
        })

        renderProjectSidebar()

        expect(screen.getByRole('link', { name: 'Personality' })).toBeInTheDocument()
    })

    it('hides Personality nav item when flag is disabled', () => {
        setFeatureFlags({
            ff_personality_editor: false,
        })

        renderProjectSidebar()

        expect(screen.queryByRole('link', { name: 'Personality' })).not.toBeInTheDocument()
    })

    it('shows a beta symbol for Organization Billing when the flag is enabled', () => {
        setFeatureFlags({
            ff_billing_page: true,
        })

        renderOrgSidebar()

        expect(screen.getByRole('link', { name: 'Billing' })).toBeInTheDocument()
        expect(screen.getByText('β')).toBeInTheDocument()
    })

    it('hides Organization Billing when its route flag is disabled', () => {
        setFeatureFlags({
            ff_billing_page: false,
        })

        renderOrgSidebar()

        expect(screen.queryByRole('link', { name: 'Billing' })).not.toBeInTheDocument()
    })
})
