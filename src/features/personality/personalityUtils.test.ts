import { describe, expect, it } from 'vitest'
import {
    createDefaultPersonalityFormState,
    personalityFormStateToDraft,
    personalityTemplateToFormState,
} from './personalityUtils'

describe('personalityUtils', () => {
    it('builds default form state', () => {
        const formState = createDefaultPersonalityFormState()
        expect(formState.templateType).toBe('PARAMETERIZED')
        expect(formState.isDefault).toBe(true)
        expect(formState.aiRole).toBe('Construction Support Manager')
        expect(formState.userRole).toBe('on-site manager/worker')
    })

    it('maps template arrays to multi-line form fields', () => {
        const formState = personalityTemplateToFormState({
            templateType: 'FULL_CONTROLLED',
            runnerInstructions: '',
            agentInstructions: '',
            userRole: 'resident',
            conversationType: 'project_updates',
            aiRole: 'assistant',
            aiRoleCharacteristics: ['clear', 'brief'],
            aiRoleEmotionalTone: ['calm'],
            aiRoleDialogueStrategy: [],
            aiRoleConstraints: [],
            contextContent: '',
            goals: ['collect update'],
            evaluationCriteria: ['concise'],
            isDefault: true,
        })

        expect(formState.aiRoleCharacteristics).toBe('clear\nbrief')
        expect(formState.goals).toBe('collect update')
    })

    it('maps multi-line form fields back to trimmed arrays', () => {
        const draft = personalityFormStateToDraft({
            templateType: 'FULL_CONTROLLED',
            runnerInstructions: '',
            agentInstructions: '',
            userRole: ' resident ',
            conversationType: ' project_updates ',
            aiRole: ' assistant ',
            aiRoleCharacteristics: 'clear\n brief , patient ',
            aiRoleEmotionalTone: '',
            aiRoleDialogueStrategy: '',
            aiRoleConstraints: '',
            contextContent: '',
            goals: 'collect update\nsummarize',
            evaluationCriteria: 'concise',
            isDefault: false,
        })

        expect(draft.userRole).toBe('resident')
        expect(draft.aiRoleCharacteristics).toEqual(['clear', 'brief', 'patient'])
        expect(draft.goals).toEqual(['collect update', 'summarize'])
        expect(draft.isDefault).toBe(true)
    })
})
