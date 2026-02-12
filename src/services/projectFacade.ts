type StorageLike = Pick<Storage, 'getItem' | 'setItem'>

export type ProjectFacadeScope = {
    organizationId?: string | null
    projectId?: string | null
}

export type ProjectScopedInput = string | ProjectFacadeScope

export type ProjectTenantMappingEntry = {
    projectId: string | null | undefined
    tenantId: string | null | undefined
}

export const PROJECT_TENANT_MAP_STORAGE_KEY = 'am_project_tenant_map'
export const PROJECT_PERSONALITY_TEMPLATE_MAP_STORAGE_KEY = 'am_project_personality_template_map'

const normalizeId = (value: string | null | undefined): string => (value || '').trim()

const getStorage = (storage?: StorageLike): StorageLike | null => {
    if (storage) return storage
    if (typeof localStorage === 'undefined') return null
    return localStorage
}

const readProjectTenantMap = (storage?: StorageLike): Record<string, string> => {
    const target = getStorage(storage)
    if (!target) return {}

    try {
        const raw = target.getItem(PROJECT_TENANT_MAP_STORAGE_KEY)
        if (!raw) return {}
        const parsed = JSON.parse(raw)
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
        return Object.entries(parsed as Record<string, unknown>).reduce<Record<string, string>>(
            (acc, [projectId, tenantId]) => {
                const normalizedProjectId = normalizeId(projectId)
                const normalizedTenantId = typeof tenantId === 'string' ? normalizeId(tenantId) : ''
                if (normalizedProjectId && normalizedTenantId) {
                    acc[normalizedProjectId] = normalizedTenantId
                }
                return acc
            },
            {}
        )
    } catch {
        return {}
    }
}

const writeProjectTenantMap = (mapping: Record<string, string>, storage?: StorageLike): void => {
    const target = getStorage(storage)
    if (!target) return
    target.setItem(PROJECT_TENANT_MAP_STORAGE_KEY, JSON.stringify(mapping))
}

const readProjectPersonalityTemplateMap = (storage?: StorageLike): Record<string, string> => {
    const target = getStorage(storage)
    if (!target) return {}

    try {
        const raw = target.getItem(PROJECT_PERSONALITY_TEMPLATE_MAP_STORAGE_KEY)
        if (!raw) return {}
        const parsed = JSON.parse(raw)
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
        return Object.entries(parsed as Record<string, unknown>).reduce<Record<string, string>>(
            (acc, [projectId, templateId]) => {
                const normalizedProjectId = normalizeId(projectId)
                const normalizedTemplateId = typeof templateId === 'string' ? normalizeId(templateId) : ''
                if (normalizedProjectId && normalizedTemplateId) {
                    acc[normalizedProjectId] = normalizedTemplateId
                }
                return acc
            },
            {}
        )
    } catch {
        return {}
    }
}

const writeProjectPersonalityTemplateMap = (mapping: Record<string, string>, storage?: StorageLike): void => {
    const target = getStorage(storage)
    if (!target) return
    target.setItem(PROJECT_PERSONALITY_TEMPLATE_MAP_STORAGE_KEY, JSON.stringify(mapping))
}

export const rememberProjectTenantMapping = (
    projectId: string | null | undefined,
    tenantId: string | null | undefined,
    storage?: StorageLike
): void => {
    rememberProjectTenantMappings([{ projectId, tenantId }], storage)
}

export const rememberProjectTenantMappings = (
    entries: ProjectTenantMappingEntry[],
    storage?: StorageLike
): void => {
    if (entries.length === 0) return

    const mapping = readProjectTenantMap(storage)
    let hasChanges = false

    for (const entry of entries) {
        const normalizedProjectId = normalizeId(entry.projectId)
        const normalizedTenantId = normalizeId(entry.tenantId)
        if (!normalizedProjectId || !normalizedTenantId) continue
        if (mapping[normalizedProjectId] === normalizedTenantId) continue

        mapping[normalizedProjectId] = normalizedTenantId
        hasChanges = true
    }

    if (!hasChanges) return
    writeProjectTenantMap(mapping, storage)
}

export const resolveTenantIdFromScopedInput = (
    input: ProjectScopedInput,
    context: string,
    storage?: StorageLike
): string => {
    if (typeof input === 'string') {
        const tenantId = input.trim()
        if (!tenantId) {
            throw new Error(`Organization ID is required for ${context}.`)
        }
        return tenantId
    }

    return resolveTenantIdOrThrow(input, context, storage)
}

export const resolveTenantIdFromScopedInputOptional = (
    input: ProjectScopedInput | undefined,
    context: string,
    storage?: StorageLike
): string | undefined => {
    if (input === undefined) return undefined
    return resolveTenantIdFromScopedInput(input, context, storage)
}

export const resolveTenantIdForProjectScope = (
    scope: ProjectFacadeScope,
    storage?: StorageLike
): string | null => {
    const organizationId = normalizeId(scope.organizationId)
    const projectId = normalizeId(scope.projectId)

    // In project facade mode, organization/tenant is the source of truth.
    if (organizationId) {
        if (projectId) {
            rememberProjectTenantMapping(projectId, organizationId, storage)
        }
        return organizationId
    }

    if (!projectId) {
        return null
    }

    const mapping = readProjectTenantMap(storage)
    return mapping[projectId] || null
}

export const rememberProjectPersonalityTemplateMapping = (
    projectId: string | null | undefined,
    templateId: string | number | null | undefined,
    storage?: StorageLike
): void => {
    const normalizedProjectId = normalizeId(projectId)
    const normalizedTemplateId = normalizeId(
        templateId === null || templateId === undefined ? '' : String(templateId)
    )
    if (!normalizedProjectId || !normalizedTemplateId) return

    const mapping = readProjectPersonalityTemplateMap(storage)
    if (mapping[normalizedProjectId] === normalizedTemplateId) return

    mapping[normalizedProjectId] = normalizedTemplateId
    writeProjectPersonalityTemplateMap(mapping, storage)
}

export const resolvePersonalityTemplateIdForProject = (
    projectId: string | null | undefined,
    storage?: StorageLike
): string | null => {
    const normalizedProjectId = normalizeId(projectId)
    if (!normalizedProjectId) return null

    const mapping = readProjectPersonalityTemplateMap(storage)
    return mapping[normalizedProjectId] || null
}

export const resolveTenantIdOrThrow = (
    scope: ProjectFacadeScope,
    context: string,
    storage?: StorageLike
): string => {
    const tenantId = resolveTenantIdForProjectScope(scope, storage)
    if (tenantId) {
        return tenantId
    }
    throw new Error(`Unable to resolve tenant ID for ${context}.`)
}
