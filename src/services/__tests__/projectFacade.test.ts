import { beforeEach, describe, expect, it } from 'vitest'
import {
    PROJECT_PERSONALITY_TEMPLATE_MAP_STORAGE_KEY,
    PROJECT_TENANT_MAP_STORAGE_KEY,
    rememberProjectPersonalityTemplateMapping,
    rememberProjectTenantMapping,
    resolvePersonalityTemplateIdForProject,
    resolveTenantIdForProjectScope,
} from '../projectFacade'

describe('projectFacade mapping', () => {
    beforeEach(() => {
        localStorage.clear()
    })

    it('uses organizationId as tenant source of truth and remembers project mapping', () => {
        const tenantId = resolveTenantIdForProjectScope({
            organizationId: 'org_1',
            projectId: 'proj_1',
        })

        expect(tenantId).toBe('org_1')
        const stored = localStorage.getItem(PROJECT_TENANT_MAP_STORAGE_KEY)
        expect(stored).toContain('"proj_1":"org_1"')
    })

    it('resolves tenant from stored mapping when only projectId is provided', () => {
        rememberProjectTenantMapping('proj_2', 'org_2')

        const tenantId = resolveTenantIdForProjectScope({
            projectId: 'proj_2',
        })

        expect(tenantId).toBe('org_2')
    })

    it('returns null when no mapping can be resolved', () => {
        const tenantId = resolveTenantIdForProjectScope({
            projectId: 'proj_missing',
        })

        expect(tenantId).toBeNull()
    })

    it('stores and resolves personality template mapping by project', () => {
        rememberProjectPersonalityTemplateMapping('proj_3', 42)

        const templateId = resolvePersonalityTemplateIdForProject('proj_3')
        expect(templateId).toBe('42')
        expect(localStorage.getItem(PROJECT_PERSONALITY_TEMPLATE_MAP_STORAGE_KEY)).toContain('"proj_3":"42"')
    })
})
