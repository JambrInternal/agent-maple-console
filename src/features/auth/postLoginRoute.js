export const resolvePostLoginRoute = async ({
    redirectTo,
    getOrganizations,
    getProjects,
    getAdminMode,
    setTheme,
    pushDebug,
}) => {
    try {
        const orgs = await getOrganizations({ includeProjectCounts: false })
        const isAdmin = getAdminMode()
        setTheme(isAdmin ? 'light' : 'dark')

        if (isAdmin) {
            return '/'
        }

        if (redirectTo !== '/') {
            return redirectTo
        }

        if (orgs.length !== 1) {
            return '/'
        }

        const orgId = orgs[0].id
        try {
            const projects = await getProjects(orgId)
            if (projects.length === 1) {
                return `/${orgId}/${projects[0].id}`
            }
        } catch (projectError) {
            console.warn('Post-login project lookup failed:', projectError)
            pushDebug?.('Post-login project lookup failed', projectError)
        }

        return `/${orgId}/projects`
    } catch (orgError) {
        console.warn('Post-login organization lookup failed:', orgError)
        pushDebug?.('Post-login organization lookup failed', orgError)
        setTheme('dark')
        return redirectTo !== '/' ? redirectTo : '/'
    }
}

