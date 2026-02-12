import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getProjectAgentContact } from '../agentFacade'

const mockGetOrganization = vi.fn()

vi.mock('../organizations', () => ({
    getOrganization: (...args: unknown[]) => mockGetOrganization(...args),
}))

describe('agentFacade service', () => {
    beforeEach(() => {
        localStorage.clear()
        vi.clearAllMocks()
    })

    it('returns tenant twilio number as project agent contact under project facade mode', async () => {
        mockGetOrganization.mockResolvedValue({
            id: 'tenant_1',
            name: 'Org One',
            twilioNumber: '+15551234567',
            createdAt: '2026-02-01T00:00:00.000Z',
        })

        const result = await getProjectAgentContact({
            organizationId: 'tenant_1',
            projectId: 'proj_1',
        })

        expect(mockGetOrganization).toHaveBeenCalledWith('tenant_1')
        expect(result).toEqual({
            phoneNumber: '+15551234567',
            source: 'tenant_twilio',
        })
    })

    it('returns unconfigured when tenant has no twilio number', async () => {
        mockGetOrganization.mockResolvedValue({
            id: 'tenant_2',
            name: 'Org Two',
            createdAt: '2026-02-01T00:00:00.000Z',
        })

        const result = await getProjectAgentContact({
            organizationId: 'tenant_2',
            projectId: 'proj_2',
        })

        expect(result).toEqual({
            phoneNumber: null,
            source: 'unconfigured',
        })
    })
})
