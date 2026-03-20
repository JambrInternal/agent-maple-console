import { DEFAULT_PROJECT_PERSONALITY_TEMPLATE } from '../../services/agentFacade'

const splitListField = (value) => {
    if (!value) return []
    return value
        .split(/[\n,]/)
        .map((entry) => entry.trim())
        .filter(Boolean)
}

const joinListField = (values) => {
    if (!Array.isArray(values) || values.length === 0) return ''
    return values.join('\n')
}

export const createDefaultPersonalityFormState = () => ({
    templateType: DEFAULT_PROJECT_PERSONALITY_TEMPLATE.templateType,
    runnerInstructions: DEFAULT_PROJECT_PERSONALITY_TEMPLATE.runnerInstructions,
    agentInstructions: DEFAULT_PROJECT_PERSONALITY_TEMPLATE.agentInstructions,
    userRole: DEFAULT_PROJECT_PERSONALITY_TEMPLATE.userRole,
    conversationType: DEFAULT_PROJECT_PERSONALITY_TEMPLATE.conversationType,
    aiRole: DEFAULT_PROJECT_PERSONALITY_TEMPLATE.aiRole,
    aiRoleCharacteristics: joinListField(DEFAULT_PROJECT_PERSONALITY_TEMPLATE.aiRoleCharacteristics),
    aiRoleEmotionalTone: joinListField(DEFAULT_PROJECT_PERSONALITY_TEMPLATE.aiRoleEmotionalTone),
    aiRoleDialogueStrategy: joinListField(DEFAULT_PROJECT_PERSONALITY_TEMPLATE.aiRoleDialogueStrategy),
    aiRoleConstraints: joinListField(DEFAULT_PROJECT_PERSONALITY_TEMPLATE.aiRoleConstraints),
    contextContent: DEFAULT_PROJECT_PERSONALITY_TEMPLATE.contextContent,
    goals: joinListField(DEFAULT_PROJECT_PERSONALITY_TEMPLATE.goals),
    evaluationCriteria: joinListField(DEFAULT_PROJECT_PERSONALITY_TEMPLATE.evaluationCriteria),
    isDefault: DEFAULT_PROJECT_PERSONALITY_TEMPLATE.isDefault,
})

export const personalityTemplateToFormState = (template) => {
    if (!template) {
        return createDefaultPersonalityFormState()
    }

    return {
        templateType: template.templateType || 'FULL_CONTROLLED',
        runnerInstructions: template.runnerInstructions || '',
        agentInstructions: template.agentInstructions || '',
        userRole: template.userRole || '',
        conversationType: template.conversationType || '',
        aiRole: template.aiRole || '',
        aiRoleCharacteristics: joinListField(template.aiRoleCharacteristics),
        aiRoleEmotionalTone: joinListField(template.aiRoleEmotionalTone),
        aiRoleDialogueStrategy: joinListField(template.aiRoleDialogueStrategy),
        aiRoleConstraints: joinListField(template.aiRoleConstraints),
        contextContent: template.contextContent || '',
        goals: joinListField(template.goals),
        evaluationCriteria: joinListField(template.evaluationCriteria),
        isDefault: template.isDefault !== false,
    }
}

export const personalityFormStateToDraft = (formState) => ({
    templateType: formState.templateType === 'PARAMETERIZED' ? 'PARAMETERIZED' : 'FULL_CONTROLLED',
    runnerInstructions: (formState.runnerInstructions || '').trim(),
    agentInstructions: (formState.agentInstructions || '').trim(),
    userRole: (formState.userRole || '').trim(),
    conversationType: (formState.conversationType || '').trim(),
    aiRole: (formState.aiRole || '').trim(),
    aiRoleCharacteristics: splitListField(formState.aiRoleCharacteristics),
    aiRoleEmotionalTone: splitListField(formState.aiRoleEmotionalTone),
    aiRoleDialogueStrategy: splitListField(formState.aiRoleDialogueStrategy),
    aiRoleConstraints: splitListField(formState.aiRoleConstraints),
    contextContent: (formState.contextContent || '').trim(),
    goals: splitListField(formState.goals),
    evaluationCriteria: splitListField(formState.evaluationCriteria),
    isDefault: true,
})
