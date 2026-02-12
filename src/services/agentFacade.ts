import { getOrganization } from './organizations'
import { resolveTenantIdOrThrow, type ProjectFacadeScope } from './projectFacade'

export type ProjectAgentContact = {
    phoneNumber: string | null
    source: 'tenant_twilio' | 'unconfigured'
}

export async function getProjectAgentContact(scope: ProjectFacadeScope): Promise<ProjectAgentContact> {
    const tenantId = resolveTenantIdOrThrow(scope, 'project agent contact')
    const organization = await getOrganization(tenantId)
    const phoneNumber = organization.twilioNumber?.trim() || null

    return {
        phoneNumber,
        source: phoneNumber ? 'tenant_twilio' : 'unconfigured',
    }
}
