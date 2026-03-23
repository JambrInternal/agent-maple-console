import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  DEFAULT_PROJECT_PERSONALITY_TEMPLATE,
  getProjectAgentContact,
  getProjectPersonalityTemplate,
  saveProjectPersonalityTemplate,
} from './agentFacade'

const mockGetOrganization = vi.fn()
const mockGetProject = vi.fn()
const mockApiFetch = vi.fn()

vi.mock('./organizations', () => ({
  getOrganization: (...args: unknown[]) => mockGetOrganization(...args),
}))

vi.mock('./projects', () => ({
  getProject: (...args: unknown[]) => mockGetProject(...args),
}))

vi.mock('../api/client', () => ({
  apiFetch: (...args: unknown[]) => mockApiFetch(...args),
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
    mockGetProject.mockResolvedValue({
      id: 'proj_1',
      name: 'Lakeside',
      organizationId: 'tenant_1',
      createdAt: '2026-02-01T00:00:00.000Z',
      threadCount: 0,
      issueCount: 0,
      agentStatus: 'online',
    })

    const result = await getProjectAgentContact({
      organizationId: 'tenant_1',
      projectId: 'proj_1',
    })

    expect(mockGetOrganization).toHaveBeenCalledWith('tenant_1')
    expect(mockGetProject).toHaveBeenCalledWith('proj_1')
    expect(result).toEqual({
      firstName: 'Lakeside',
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
    mockGetProject.mockResolvedValue({
      id: 'proj_2',
      name: 'Riverside',
      organizationId: 'tenant_2',
      createdAt: '2026-02-01T00:00:00.000Z',
      threadCount: 0,
      issueCount: 0,
      agentStatus: 'online',
    })

    const result = await getProjectAgentContact({
      organizationId: 'tenant_2',
      projectId: 'proj_2',
    })

    expect(result).toEqual({
      firstName: 'Riverside',
      phoneNumber: null,
      source: 'unconfigured',
    })
  })

  it('has a parameterized default personality template with sensible defaults', () => {
    expect(DEFAULT_PROJECT_PERSONALITY_TEMPLATE.templateType).toBe('PARAMETERIZED')
    expect(DEFAULT_PROJECT_PERSONALITY_TEMPLATE.aiRole).toBe('Construction Support Manager')
    expect(DEFAULT_PROJECT_PERSONALITY_TEMPLATE.userRole).toBe('on-site manager/worker')
    expect(DEFAULT_PROJECT_PERSONALITY_TEMPLATE.conversationType).toBe('Construction support chat')
    expect(DEFAULT_PROJECT_PERSONALITY_TEMPLATE.aiRoleCharacteristics).toEqual(['Kind', 'Active Listening'])
    expect(DEFAULT_PROJECT_PERSONALITY_TEMPLATE.aiRoleEmotionalTone).toEqual(['calm'])
    expect(DEFAULT_PROJECT_PERSONALITY_TEMPLATE.aiRoleDialogueStrategy).toEqual(['informative and helpful'])
    expect(DEFAULT_PROJECT_PERSONALITY_TEMPLATE.aiRoleConstraints.length).toBeGreaterThan(0)
    expect(DEFAULT_PROJECT_PERSONALITY_TEMPLATE.goals.length).toBeGreaterThan(0)
    expect(DEFAULT_PROJECT_PERSONALITY_TEMPLATE.evaluationCriteria.length).toBeGreaterThan(0)
    expect(DEFAULT_PROJECT_PERSONALITY_TEMPLATE.isDefault).toBe(true)
  })

  it('returns bootstrap default personality when no templates exist', async () => {
    mockApiFetch.mockResolvedValue({
      data: [],
    })

    const result = await getProjectPersonalityTemplate({
      organizationId: 'tenant_10',
      projectId: 'proj_10',
    })

    expect(mockApiFetch).toHaveBeenCalledWith('/chat/conversation_parameter_templates', {
      headers: {
        'x-tenant-id': 'tenant_10',
      },
    })
    expect(result.id).toBeNull()
    expect(result.source).toBe('bootstrap_default')
  })

  it('selects and updates the canonical personality template, deleting duplicates', async () => {
    mockApiFetch
      .mockResolvedValueOnce({
        data: [
          {
            id: 100,
            template_type: 'FULL_CONTROLLED',
            user_role: 'resident',
            conversation_type: 'construction_updates',
            ai_role: 'site_assistant',
            ai_role_characteristics: [],
            ai_role_emotional_tone: [],
            ai_role_dialogue_strategy: [],
            ai_role_constraints: [],
            goals: [],
            evaluation_criteria: [],
            is_default: true,
          },
          {
            id: 101,
            template_type: 'FULL_CONTROLLED',
            user_role: 'resident',
            conversation_type: 'construction_updates',
            ai_role: 'site_assistant',
            ai_role_characteristics: [],
            ai_role_emotional_tone: [],
            ai_role_dialogue_strategy: [],
            ai_role_constraints: [],
            goals: [],
            evaluation_criteria: [],
            is_default: false,
          },
        ],
      })
      .mockResolvedValueOnce({
        data: {
          id: 100,
          template_type: 'FULL_CONTROLLED',
          user_role: 'resident',
          conversation_type: 'construction_updates',
          ai_role: 'site_assistant',
          ai_role_characteristics: ['clear'],
          ai_role_emotional_tone: [],
          ai_role_dialogue_strategy: [],
          ai_role_constraints: [],
          goals: [],
          evaluation_criteria: [],
          is_default: true,
        },
      })
      .mockResolvedValueOnce({ data: {} })

    const result = await saveProjectPersonalityTemplate(
      {
        organizationId: 'tenant_11',
        projectId: 'proj_11',
      },
      {
        userRole: 'resident',
        conversationType: 'construction_updates',
        aiRole: 'site_assistant',
        aiRoleCharacteristics: ['clear'],
      }
    )

    expect(mockApiFetch).toHaveBeenNthCalledWith(1, '/chat/conversation_parameter_templates', {
      headers: {
        'x-tenant-id': 'tenant_11',
      },
    })
    expect(mockApiFetch).toHaveBeenNthCalledWith(
      2,
      '/chat/conversation_parameter_templates/100',
      expect.objectContaining({
        method: 'PUT',
        headers: {
          'x-tenant-id': 'tenant_11',
        },
      })
    )
    expect(mockApiFetch).toHaveBeenNthCalledWith(3, '/chat/conversation_parameter_templates/101', {
      method: 'DELETE',
      headers: {
        'x-tenant-id': 'tenant_11',
      },
    })
    expect(result.id).toBe('100')
    expect(result.aiRoleCharacteristics).toEqual(['clear'])
  })

  it('forces parameterized template mode for non-super-admin saves', async () => {
    mockApiFetch
      .mockResolvedValueOnce({
        data: [],
      })
      .mockResolvedValueOnce({
        data: {
          id: 301,
          template_type: 'PARAMETERIZED',
          user_role: 'resident',
          conversation_type: 'construction_updates',
          ai_role: 'site_assistant',
          ai_role_characteristics: [],
          ai_role_emotional_tone: [],
          ai_role_dialogue_strategy: [],
          ai_role_constraints: [],
          goals: [],
          evaluation_criteria: [],
          is_default: true,
        },
      })

    await saveProjectPersonalityTemplate(
      {
        organizationId: 'tenant_12',
        projectId: 'proj_12',
      },
      {
        templateType: 'FULL_CONTROLLED',
        userRole: 'resident',
        conversationType: 'construction_updates',
        aiRole: 'site_assistant',
      }
    )

    const createCallPayload = mockApiFetch.mock.calls[1]?.[1]?.body
    expect(createCallPayload).toBeTruthy()
    const parsedPayload = JSON.parse(createCallPayload)
    expect(parsedPayload.template_type).toBe('PARAMETERIZED')
  })
})
