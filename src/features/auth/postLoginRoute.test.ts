import { describe, expect, it, vi } from 'vitest'
import { resolvePostLoginRoute } from './postLoginRoute'

describe('resolvePostLoginRoute', () => {
  it('routes admins to org selection and applies light theme', async () => {
    const setTheme = vi.fn()
    const route = await resolvePostLoginRoute({
      redirectTo: '/',
      getOrganizations: vi.fn().mockResolvedValue([{ id: 'org_1' }]),
      getProjects: vi.fn(),
      getAdminMode: vi.fn().mockReturnValue(true),
      setTheme,
      pushDebug: vi.fn(),
    })

    expect(route).toBe('/')
    expect(setTheme).toHaveBeenCalledWith('light')
  })

  it('returns redirectTo when present for non-admin', async () => {
    const setTheme = vi.fn()
    const route = await resolvePostLoginRoute({
      redirectTo: '/org_1/projects',
      getOrganizations: vi.fn().mockResolvedValue([{ id: 'org_1' }]),
      getProjects: vi.fn(),
      getAdminMode: vi.fn().mockReturnValue(false),
      setTheme,
      pushDebug: vi.fn(),
    })

    expect(route).toBe('/org_1/projects')
    expect(setTheme).toHaveBeenCalledWith('dark')
  })

  it('routes to single project when one org and one project exist', async () => {
    const route = await resolvePostLoginRoute({
      redirectTo: '/',
      getOrganizations: vi.fn().mockResolvedValue([{ id: 'org_1' }]),
      getProjects: vi.fn().mockResolvedValue([{ id: 'proj_9' }]),
      getAdminMode: vi.fn().mockReturnValue(false),
      setTheme: vi.fn(),
      pushDebug: vi.fn(),
    })

    expect(route).toBe('/org_1/proj_9')
  })

  it('falls back to org projects list when project lookup fails', async () => {
    const pushDebug = vi.fn()
    const route = await resolvePostLoginRoute({
      redirectTo: '/',
      getOrganizations: vi.fn().mockResolvedValue([{ id: 'org_1' }]),
      getProjects: vi.fn().mockRejectedValue(new Error('project lookup failed')),
      getAdminMode: vi.fn().mockReturnValue(false),
      setTheme: vi.fn(),
      pushDebug,
    })

    expect(route).toBe('/org_1/projects')
    expect(pushDebug).toHaveBeenCalledWith('Post-login project lookup failed', expect.any(Error))
  })

  it('falls back safely when org lookup fails', async () => {
    const setTheme = vi.fn()
    const pushDebug = vi.fn()
    const route = await resolvePostLoginRoute({
      redirectTo: '/org_1/projects',
      getOrganizations: vi.fn().mockRejectedValue(new Error('org lookup failed')),
      getProjects: vi.fn(),
      getAdminMode: vi.fn().mockReturnValue(false),
      setTheme,
      pushDebug,
    })

    expect(route).toBe('/org_1/projects')
    expect(setTheme).toHaveBeenLastCalledWith('dark')
    expect(pushDebug).toHaveBeenCalledWith('Post-login organization lookup failed', expect.any(Error))
  })
})
