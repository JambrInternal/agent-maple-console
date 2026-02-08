import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Login from '../Login'
import { getOrganizations } from '../../services/organizations'
import { getProjects } from '../../services/projects'

const mockLogin = vi.fn()
const mockNavigate = vi.fn()

vi.mock('../../contexts/AuthContext', () => ({
    useAuth: () => ({
        login: mockLogin,
        user: null,
        loading: false,
    }),
}))

vi.mock('../../services/organizations', () => ({
    getOrganizations: vi.fn(),
}))

vi.mock('../../services/projects', () => ({
    getProjects: vi.fn(),
}))

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    }
})

describe('Login', () => {
    beforeEach(() => {
        localStorage.clear()
        vi.clearAllMocks()
    })

    it('auto-navigates to the only project after login', async () => {
        mockLogin.mockResolvedValue({
            id: 'user_1',
            email: 'test@example.com',
            name: 'Test User',
            role: 'admin',
            organizationId: null,
            tenantId: null,
            mfaEnabled: false,
            createdAt: '2026-02-06T08:00:00Z',
        })
        vi.mocked(getOrganizations).mockResolvedValue([
            {
                id: 'org_1',
                name: 'Solo Org',
                projectCount: 1,
                createdAt: '2026-02-01T00:00:00Z',
            },
        ])
        vi.mocked(getProjects).mockResolvedValue([
            {
                id: 'proj_1',
                organizationId: 'org_1',
                name: 'Solo Project',
                agentStatus: 'offline',
                threadCount: 0,
                issueCount: 0,
                lastActivityAt: '2026-02-05T08:00:00Z',
                createdAt: '2026-02-05T08:00:00Z',
            },
        ])

        const user = userEvent.setup()

        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        )

        await user.type(screen.getByPlaceholderText('name@company.com'), 'test@example.com')
        await user.type(screen.getByPlaceholderText('••••••••'), 'password')
        await user.click(screen.getByRole('button', { name: 'Sign In' }))

        expect(getOrganizations).toHaveBeenCalledWith({ includeProjectCounts: false })
        expect(getProjects).toHaveBeenCalledWith('org_1')
        expect(mockNavigate).toHaveBeenCalledWith('/org_1/proj_1', { replace: true })
    })

    it('respects redirectTo when coming from a protected route', async () => {
        mockLogin.mockResolvedValue({
            id: 'user_2',
            email: 'test@example.com',
            name: 'Test User',
            role: 'admin',
            organizationId: null,
            tenantId: null,
            mfaEnabled: false,
            createdAt: '2026-02-06T08:00:00Z',
        })

        vi.mocked(getOrganizations).mockResolvedValue([])

        const user = userEvent.setup()
        render(
            <MemoryRouter
                initialEntries={[
                    {
                        pathname: '/login',
                        state: { from: { pathname: '/org_1/projects' } },
                    },
                ]}
            >
                <Login />
            </MemoryRouter>
        )

        await user.type(screen.getByPlaceholderText('name@company.com'), 'test@example.com')
        await user.type(screen.getByPlaceholderText('••••••••'), 'password')
        await user.click(screen.getByRole('button', { name: 'Sign In' }))

        expect(getOrganizations).toHaveBeenCalledWith({ includeProjectCounts: false })
        expect(getProjects).not.toHaveBeenCalled()
        expect(mockNavigate).toHaveBeenCalledWith('/org_1/projects', { replace: true })
    })

    it('routes admin users to the org selector with light theme', async () => {
        mockLogin.mockResolvedValue({
            id: 'user_admin',
            email: 'admin@example.com',
            name: 'Admin User',
            role: 'admin',
            organizationId: null,
            tenantId: null,
            mfaEnabled: false,
            createdAt: '2026-02-06T08:00:00Z',
        })
        vi.mocked(getOrganizations).mockImplementation(async () => {
            localStorage.setItem('am_admin_mode', 'true')
            return [
                {
                    id: 'org_admin_1',
                    name: 'Org A',
                    projectCount: 0,
                    createdAt: '2026-02-01T00:00:00Z',
                },
            ]
        })

        const user = userEvent.setup()

        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        )

        await user.type(screen.getByPlaceholderText('name@company.com'), 'admin@example.com')
        await user.type(screen.getByPlaceholderText('••••••••'), 'password')
        await user.click(screen.getByRole('button', { name: 'Sign In' }))

        expect(getProjects).not.toHaveBeenCalled()
        expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })
        expect(document.documentElement.dataset.theme).toBe('light')
    })

    it('shows Cognito config in debug mode', () => {
        render(
            <MemoryRouter initialEntries={['/login?debug=auth']}>
                <Login />
            </MemoryRouter>
        )

        expect(screen.getByText(/Cognito region/i)).toBeInTheDocument()
        expect(screen.getByText(/Cognito user pool/i)).toBeInTheDocument()
        expect(screen.getByText(/Cognito app client/i)).toBeInTheDocument()
    })

    it('toggles debug mode on and off', async () => {
        const user = userEvent.setup()
        render(
            <MemoryRouter initialEntries={['/login']}>
                <Login />
            </MemoryRouter>
        )

        expect(screen.queryByText(/Cognito region/i)).toBeNull()

        await user.click(screen.getByRole('button', { name: 'Enable Debug' }))
        expect(screen.getByText(/Cognito region/i)).toBeInTheDocument()
        expect(localStorage.getItem('am_debug_auth')).toBe('true')

        await user.click(screen.getByRole('button', { name: 'Disable Debug' }))
        expect(screen.queryByText(/Cognito region/i)).toBeNull()
        expect(localStorage.getItem('am_debug_auth')).toBe('false')
    })
})
