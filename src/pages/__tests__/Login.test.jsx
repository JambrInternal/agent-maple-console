import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Login from '../Login'

const mockNavigate = vi.fn()
const mockLogout = vi.fn()
const mockSyncCurrentUser = vi.fn()
const mockResolvePostLoginRoute = vi.fn()

let mockAuthState = {
    user: null,
    loading: false,
    logout: mockLogout,
    syncCurrentUser: mockSyncCurrentUser,
}

let mockAuthenticatorState = {
    route: 'signIn',
    user: null,
    error: '',
}

vi.mock('../../contexts/AuthContext', () => ({
    useAuth: () => mockAuthState,
}))

vi.mock('../../features/auth/postLoginRoute', () => ({
    resolvePostLoginRoute: (...args) => mockResolvePostLoginRoute(...args),
}))

vi.mock('../../features/auth/useStaleSessionGuard', () => ({
    default: vi.fn(),
}))

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    }
})

vi.mock('@aws-amplify/ui-react', async () => {
    const React = await vi.importActual('react')

    const Authenticator = ({ children, components }) => {
        const [route, setRoute] = React.useState(mockAuthenticatorState.route)
        const context = React.useMemo(() => ({
            route,
            user: mockAuthenticatorState.user,
            error: mockAuthenticatorState.error,
            toForgotPassword: () => setRoute('forgotPassword'),
            toSignIn: () => setRoute('signIn'),
        }), [route])

        const Header = components?.Header
        const SignInFooter = components?.SignIn?.Footer
        const ForgotPasswordFooter = components?.ForgotPassword?.Footer

        if (route === 'authenticated') {
            return <div data-testid="mock-authenticator-authenticated">{children({ user: mockAuthenticatorState.user })}</div>
        }

        return (
            <div data-testid={`mock-authenticator-${route}`}>
                {Header ? <Header /> : null}
                {route === 'signIn' ? (
                    <AuthenticatorContext.Provider value={context}>
                        <label>
                            Email Address
                            <input placeholder="name@company.com" defaultValue="" />
                        </label>
                        <label>
                            Password
                            <input placeholder="••••••••" defaultValue="" type="password" />
                        </label>
                        <button type="button">Sign In</button>
                        {SignInFooter ? <SignInFooter /> : null}
                    </AuthenticatorContext.Provider>
                ) : null}
                {route === 'forgotPassword' ? (
                    <AuthenticatorContext.Provider value={context}>
                        <label>
                            Email Address
                            <input placeholder="name@company.com" defaultValue="" />
                        </label>
                        <button type="button">Send Reset Code</button>
                        {ForgotPasswordFooter ? <ForgotPasswordFooter /> : null}
                    </AuthenticatorContext.Provider>
                ) : null}
            </div>
        )
    }

    const AuthenticatorContext = React.createContext({
        route: 'signIn',
        user: null,
        error: '',
        toForgotPassword: () => {},
        toSignIn: () => {},
    })

    const useAuthenticator = (selector) => {
        const context = React.useContext(AuthenticatorContext)
        return selector ? selector(context) : context
    }

    return {
        Authenticator,
        useAuthenticator,
        View: ({ children, ...props }) => <div {...props}>{children}</div>,
        Heading: ({ children, ...props }) => <h2 {...props}>{children}</h2>,
        Text: ({ children, ...props }) => <p {...props}>{children}</p>,
        Button: ({ children, ...props }) => <button {...props}>{children}</button>,
    }
})

describe('Login', () => {
    beforeEach(() => {
        localStorage.clear()
        vi.clearAllMocks()
        mockAuthState = {
            user: null,
            loading: false,
            logout: mockLogout,
            syncCurrentUser: mockSyncCurrentUser,
        }
        mockAuthenticatorState = {
            route: 'signIn',
            user: null,
            error: '',
        }
        mockResolvePostLoginRoute.mockResolvedValue('/resolved-target')
        mockSyncCurrentUser.mockResolvedValue({
            id: 'user_1',
            email: 'test@example.com',
            role: 'member',
        })
        document.documentElement.dataset.theme = 'dark'
    })

    it('syncs the current user and resolves post-login navigation after authenticator authentication', async () => {
        mockAuthenticatorState = {
            route: 'authenticated',
            user: {
                userId: 'cognito-user-1',
                username: 'test@example.com',
            },
            error: '',
        }

        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        )

        await waitFor(() => {
            expect(mockSyncCurrentUser).toHaveBeenCalledTimes(1)
            expect(mockResolvePostLoginRoute).toHaveBeenCalledTimes(1)
            expect(mockNavigate).toHaveBeenCalledWith('/resolved-target', { replace: true })
        })
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

    it('applies light theme on login when super admin mode is already enabled', () => {
        localStorage.setItem('am_admin_mode', 'true')
        document.documentElement.dataset.theme = 'dark'

        render(
            <MemoryRouter initialEntries={['/login']}>
                <Login />
            </MemoryRouter>
        )

        expect(document.documentElement.dataset.theme).toBe('light')
    })

    it('toggles debug mode on and off', async () => {
        const user = userEvent.setup()
        render(
            <MemoryRouter initialEntries={['/login']}>
                <Login />
            </MemoryRouter>
        )

        const debugVisibleInitially = !!screen.queryByText(/Cognito region/i)
        const firstToggleLabel = debugVisibleInitially ? 'Disable Debug' : 'Enable Debug'
        const secondToggleLabel = debugVisibleInitially ? 'Enable Debug' : 'Disable Debug'
        const firstStorageState = debugVisibleInitially ? 'false' : 'true'
        const secondStorageState = debugVisibleInitially ? 'true' : 'false'

        await user.click(screen.getByRole('button', { name: firstToggleLabel }))
        expect(localStorage.getItem('am_debug_auth')).toBe(firstStorageState)

        await user.click(screen.getByRole('button', { name: secondToggleLabel }))
        expect(localStorage.getItem('am_debug_auth')).toBe(secondStorageState)
    })

    it('starts forgot-password flow from the sign-in footer', async () => {
        const user = userEvent.setup()

        render(
            <MemoryRouter initialEntries={['/login']}>
                <Login />
            </MemoryRouter>
        )

        await user.click(screen.getByRole('button', { name: 'Forgot Password?' }))

        expect(screen.getByTestId('mock-authenticator-forgotPassword')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Send Reset Code' })).toBeInTheDocument()
    })
})
