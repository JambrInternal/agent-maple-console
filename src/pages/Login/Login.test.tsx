import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Login from './Login'
import { getOrganizations } from '../../services/organizations'
import { getProjects } from '../../services/projects'

const mockNavigate = vi.fn()
const mockLogout = vi.fn()
const mockSyncCurrentUser = vi.fn()

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

vi.mock('../../features/auth/useStaleSessionGuard', () => ({
  default: vi.fn(),
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
    if (!selector) return context

    const selected = selector(context)
    if (Array.isArray(selected)) {
      const keys = Object.keys(context).filter((key) => selected.includes(context[key]))
      return Object.fromEntries(keys.map((key) => [key, context[key]]))
    }

    return selected
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
    mockSyncCurrentUser.mockResolvedValue({
      id: 'user_1',
      email: 'test@example.com',
      role: 'member',
    })
    document.documentElement.dataset.theme = 'dark'
  })

  it('auto-navigates to the only project after authentication', async () => {
    mockAuthenticatorState = {
      route: 'authenticated',
      user: {
        userId: 'cognito-user-1',
        username: 'test@example.com',
      },
      error: '',
    }

    vi.mocked(getOrganizations).mockResolvedValue([
      { id: 'org_1', name: 'Solo Org', projectCount: 1, createdAt: '2026-02-01T00:00:00Z' },
    ])
    vi.mocked(getProjects).mockResolvedValue([
      { id: 'proj_1', organizationId: 'org_1', name: 'Solo Project', agentStatus: 'offline', threadCount: 0, issueCount: 0, lastActivityAt: '2026-02-05T08:00:00Z', createdAt: '2026-02-05T08:00:00Z' },
    ])

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(mockSyncCurrentUser).toHaveBeenCalledTimes(1)
      expect(getOrganizations).toHaveBeenCalledWith({ includeProjectCounts: false })
      expect(getProjects).toHaveBeenCalledWith('org_1')
      expect(mockNavigate).toHaveBeenCalledWith('/org_1/proj_1', { replace: true })
    })
  })


  it('respects redirectTo when coming from a protected route', async () => {
    document.documentElement.dataset.theme = 'light'
    mockAuthenticatorState = {
      route: 'authenticated',
      user: { userId: 'cognito-user-2', username: 'test@example.com' },
      error: '',
    }
    mockSyncCurrentUser.mockResolvedValue({ id: 'user_2', email: 'test@example.com', role: 'member' })
    vi.mocked(getOrganizations).mockResolvedValue([])

    render(
      <MemoryRouter initialEntries={[{ pathname: '/login', state: { from: { pathname: '/org_1/projects' } } }]}>
        <Login />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(getOrganizations).toHaveBeenCalledWith({ includeProjectCounts: false })
      expect(getProjects).not.toHaveBeenCalled()
      expect(mockNavigate).toHaveBeenCalledWith('/org_1/projects', { replace: true })
      expect(document.documentElement.dataset.theme).toBe('dark')
    })
  })

  it('routes admin users to the org selector with light theme', async () => {
    mockAuthenticatorState = {
      route: 'authenticated',
      user: { userId: 'cognito-admin', username: 'admin@example.com' },
      error: '',
    }
    mockSyncCurrentUser.mockResolvedValue({ id: 'user_admin', email: 'admin@example.com', role: 'admin' })
    vi.mocked(getOrganizations).mockImplementation(async () => {
      localStorage.setItem('am_admin_mode', 'true')
      return [{ id: 'org_admin_1', name: 'Org A', projectCount: 0, createdAt: '2026-02-01T00:00:00Z' }]
    })

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(getProjects).not.toHaveBeenCalled()
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })
      expect(document.documentElement.dataset.theme).toBe('light')
    })
  })

  it('keeps the post-login route resolution when auth context is already hydrated', async () => {
    mockAuthState = {
      user: { id: 'user_early', email: 'test@example.com', role: 'member' },
      loading: false,
      logout: mockLogout,
      syncCurrentUser: mockSyncCurrentUser,
    }
    mockAuthenticatorState = {
      route: 'authenticated',
      user: { userId: 'cognito-user-3', username: 'test@example.com' },
      error: '',
    }
    vi.mocked(getOrganizations).mockResolvedValue([
      { id: 'org_1', name: 'Solo Org', projectCount: 1, createdAt: '2026-02-01T00:00:00Z' },
    ])
    vi.mocked(getProjects).mockResolvedValue([
      { id: 'proj_1', organizationId: 'org_1', name: 'Solo Project', agentStatus: 'offline', threadCount: 0, issueCount: 0, lastActivityAt: '2026-02-05T08:00:00Z', createdAt: '2026-02-05T08:00:00Z' },
    ])

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(mockSyncCurrentUser).toHaveBeenCalledTimes(1)
      expect(mockNavigate).toHaveBeenCalledWith('/org_1/proj_1', { replace: true })
    })

    expect(mockNavigate).not.toHaveBeenCalledWith('/', { replace: true })
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
