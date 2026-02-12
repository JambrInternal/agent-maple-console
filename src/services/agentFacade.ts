import { apiFetch } from '../api/client'
import { unwrapData, type ApiResponse } from '../api/mappers'
import { getOrganization } from './organizations'
import {
    rememberProjectPersonalityTemplateMapping,
    resolvePersonalityTemplateIdForProject,
    resolveTenantIdOrThrow,
    type ProjectFacadeScope,
} from './projectFacade'

export type ProjectAgentContact = {
    phoneNumber: string | null
    source: 'tenant_twilio' | 'unconfigured'
}

type PersonalityTemplateType = 'PARAMETERIZED' | 'FULL_CONTROLLED'

type ApiConversationParameterTemplate = {
    id?: string | number | null
    template_type?: string | null
    runner_instructions?: string | null
    agent_instructions?: string | null
    user_role?: string | null
    conversation_type?: string | null
    ai_role?: string | null
    ai_role_characteristics?: string[] | null
    ai_role_emotional_tone?: string[] | null
    ai_role_dialogue_strategy?: string[] | null
    ai_role_constraints?: string[] | null
    context_content?: string | null
    context_course_id?: number | null
    context_file_id?: string | null
    goals?: string[] | null
    evaluation_criteria?: string[] | null
    is_default?: boolean | null
}

type ApiConversationParameterTemplateUpsertRequest = {
    template_type: PersonalityTemplateType
    runner_instructions?: string | null
    agent_instructions?: string | null
    user_role: string
    conversation_type: string
    ai_role: string
    ai_role_characteristics: string[]
    ai_role_emotional_tone: string[]
    ai_role_dialogue_strategy: string[]
    ai_role_constraints: string[]
    context_content?: string | null
    context_course_id?: number | null
    context_file_id?: string | null
    goals: string[]
    evaluation_criteria: string[]
    is_default: boolean
}

export type ProjectPersonalityTemplateDraft = {
    templateType: PersonalityTemplateType
    runnerInstructions: string
    agentInstructions: string
    userRole: string
    conversationType: string
    aiRole: string
    aiRoleCharacteristics: string[]
    aiRoleEmotionalTone: string[]
    aiRoleDialogueStrategy: string[]
    aiRoleConstraints: string[]
    contextContent: string
    goals: string[]
    evaluationCriteria: string[]
    isDefault: boolean
}

export type ProjectPersonalityTemplate = ProjectPersonalityTemplateDraft & {
    id: string | null
    source: 'tenant_template' | 'bootstrap_default'
}

export const DEFAULT_PROJECT_PERSONALITY_TEMPLATE: ProjectPersonalityTemplateDraft = {
    templateType: 'FULL_CONTROLLED',
    runnerInstructions: '',
    agentInstructions: '',
    userRole: 'construction_resident',
    conversationType: 'project_updates',
    aiRole: 'virtual_site_coordinator',
    aiRoleCharacteristics: [],
    aiRoleEmotionalTone: [],
    aiRoleDialogueStrategy: [],
    aiRoleConstraints: [],
    contextContent: '',
    goals: [],
    evaluationCriteria: [],
    isDefault: true,
}

const normalizeString = (value: unknown): string => (
    typeof value === 'string' ? value.trim() : ''
)

const normalizeTemplateType = (value: unknown): PersonalityTemplateType => (
    value === 'PARAMETERIZED' ? 'PARAMETERIZED' : 'FULL_CONTROLLED'
)

const normalizeStringArray = (value: unknown): string[] => {
    if (!Array.isArray(value)) return []
    return value
        .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
        .filter(Boolean)
}

const mapApiTemplateToProjectTemplate = (
    template: ApiConversationParameterTemplate,
    source: ProjectPersonalityTemplate['source'] = 'tenant_template'
): ProjectPersonalityTemplate => ({
    id: template.id === null || template.id === undefined ? null : String(template.id),
    source,
    templateType: normalizeTemplateType(template.template_type),
    runnerInstructions: normalizeString(template.runner_instructions),
    agentInstructions: normalizeString(template.agent_instructions),
    userRole: normalizeString(template.user_role),
    conversationType: normalizeString(template.conversation_type),
    aiRole: normalizeString(template.ai_role),
    aiRoleCharacteristics: normalizeStringArray(template.ai_role_characteristics),
    aiRoleEmotionalTone: normalizeStringArray(template.ai_role_emotional_tone),
    aiRoleDialogueStrategy: normalizeStringArray(template.ai_role_dialogue_strategy),
    aiRoleConstraints: normalizeStringArray(template.ai_role_constraints),
    contextContent: normalizeString(template.context_content),
    goals: normalizeStringArray(template.goals),
    evaluationCriteria: normalizeStringArray(template.evaluation_criteria),
    isDefault: template.is_default === true,
})

const normalizeDraft = (
    draft: Partial<ProjectPersonalityTemplateDraft> | undefined
): ProjectPersonalityTemplateDraft => {
    const fallback = DEFAULT_PROJECT_PERSONALITY_TEMPLATE
    return {
        templateType: draft?.templateType === 'PARAMETERIZED' ? 'PARAMETERIZED' : 'FULL_CONTROLLED',
        runnerInstructions: normalizeString(draft?.runnerInstructions) || fallback.runnerInstructions,
        agentInstructions: normalizeString(draft?.agentInstructions) || fallback.agentInstructions,
        userRole: normalizeString(draft?.userRole) || fallback.userRole,
        conversationType: normalizeString(draft?.conversationType) || fallback.conversationType,
        aiRole: normalizeString(draft?.aiRole) || fallback.aiRole,
        aiRoleCharacteristics: normalizeStringArray(draft?.aiRoleCharacteristics),
        aiRoleEmotionalTone: normalizeStringArray(draft?.aiRoleEmotionalTone),
        aiRoleDialogueStrategy: normalizeStringArray(draft?.aiRoleDialogueStrategy),
        aiRoleConstraints: normalizeStringArray(draft?.aiRoleConstraints),
        contextContent: normalizeString(draft?.contextContent),
        goals: normalizeStringArray(draft?.goals),
        evaluationCriteria: normalizeStringArray(draft?.evaluationCriteria),
        isDefault: draft?.isDefault !== false,
    }
}

const toUpsertRequest = (draft: ProjectPersonalityTemplateDraft): ApiConversationParameterTemplateUpsertRequest => ({
    template_type: draft.templateType,
    runner_instructions: draft.runnerInstructions || null,
    agent_instructions: draft.agentInstructions || null,
    user_role: draft.userRole,
    conversation_type: draft.conversationType,
    ai_role: draft.aiRole,
    ai_role_characteristics: draft.aiRoleCharacteristics,
    ai_role_emotional_tone: draft.aiRoleEmotionalTone,
    ai_role_dialogue_strategy: draft.aiRoleDialogueStrategy,
    ai_role_constraints: draft.aiRoleConstraints,
    context_content: draft.contextContent || null,
    context_course_id: null,
    context_file_id: null,
    goals: draft.goals,
    evaluation_criteria: draft.evaluationCriteria,
    is_default: draft.isDefault,
})

const listPersonalityTemplates = async (tenantId: string): Promise<ProjectPersonalityTemplate[]> => {
    const response = await apiFetch<ApiResponse<ApiConversationParameterTemplate[]> | ApiConversationParameterTemplate[]>(
        '/chat/conversation_parameter_templates',
        {
            headers: {
                'x-tenant-id': tenantId,
            },
        }
    )
    const data = unwrapData<ApiConversationParameterTemplate[]>(response, [])
    return data.map((template) => mapApiTemplateToProjectTemplate(template))
}

const selectCanonicalTemplate = (
    templates: ProjectPersonalityTemplate[],
    scope: ProjectFacadeScope
): ProjectPersonalityTemplate | null => {
    if (templates.length === 0) return null

    const preferredTemplateId = resolvePersonalityTemplateIdForProject(scope.projectId)
    if (preferredTemplateId) {
        const preferred = templates.find((template) => template.id === preferredTemplateId)
        if (preferred) return preferred
    }

    const defaultTemplate = templates.find((template) => template.isDefault)
    if (defaultTemplate) return defaultTemplate
    return templates[0]
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

export async function getProjectPersonalityTemplate(scope: ProjectFacadeScope): Promise<ProjectPersonalityTemplate> {
    const tenantId = resolveTenantIdOrThrow(scope, 'project personality template')
    const templates = await listPersonalityTemplates(tenantId)
    const canonical = selectCanonicalTemplate(templates, scope)

    if (!canonical) {
        return {
            id: null,
            source: 'bootstrap_default',
            ...DEFAULT_PROJECT_PERSONALITY_TEMPLATE,
        }
    }

    if (scope.projectId && canonical.id) {
        rememberProjectPersonalityTemplateMapping(scope.projectId, canonical.id)
    }
    return canonical
}

export async function saveProjectPersonalityTemplate(
    scope: ProjectFacadeScope,
    draft: Partial<ProjectPersonalityTemplateDraft>
): Promise<ProjectPersonalityTemplate> {
    const tenantId = resolveTenantIdOrThrow(scope, 'project personality template save')
    const normalizedDraft = normalizeDraft(draft)
    const payload = toUpsertRequest(normalizedDraft)

    const templates = await listPersonalityTemplates(tenantId)
    const canonical = selectCanonicalTemplate(templates, scope)

    const response = canonical?.id
        ? await apiFetch<ApiResponse<ApiConversationParameterTemplate> | ApiConversationParameterTemplate>(
            `/chat/conversation_parameter_templates/${canonical.id}`,
            {
                method: 'PUT',
                headers: {
                    'x-tenant-id': tenantId,
                },
                body: JSON.stringify(payload),
            }
        )
        : await apiFetch<ApiResponse<ApiConversationParameterTemplate> | ApiConversationParameterTemplate>(
            '/chat/conversation_parameter_templates',
            {
                method: 'POST',
                headers: {
                    'x-tenant-id': tenantId,
                },
                body: JSON.stringify(payload),
            }
        )

    const saved = mapApiTemplateToProjectTemplate(unwrapData<ApiConversationParameterTemplate>(response))
    if (scope.projectId && saved.id) {
        rememberProjectPersonalityTemplateMapping(scope.projectId, saved.id)
    }

    // Personality is singleton per project facade scope. Keep the saved template and remove extras.
    const duplicateTemplateIds = templates
        .map((template) => template.id)
        .filter((templateId): templateId is string => !!templateId && templateId !== saved.id)

    await Promise.allSettled(
        duplicateTemplateIds.map((templateId) => (
            apiFetch(`/chat/conversation_parameter_templates/${templateId}`, {
                method: 'DELETE',
                headers: {
                    'x-tenant-id': tenantId,
                },
            })
        ))
    )

    return saved
}
