import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useApiQuery } from '../hooks/useApiQuery'
import QueryError from '../components/QueryError'
import {
    getProjectPersonalityTemplate,
    saveProjectPersonalityTemplate,
} from '../services/agentFacade'
import PersonalityTemplateForm from '../features/personality/components/PersonalityTemplateForm'
import {
    createDefaultPersonalityFormState,
    personalityFormStateToDraft,
    personalityTemplateToFormState,
} from '../features/personality/personalityUtils'
import { getAdminMode } from '../utils/admin'

const Personality = () => {
    const { orgId, projId } = useParams()
    const isSuperAdmin = getAdminMode()
    const [formState, setFormState] = useState(() => createDefaultPersonalityFormState())
    const [saveError, setSaveError] = useState('')
    const [saveNotice, setSaveNotice] = useState('')
    const [isSaving, setIsSaving] = useState(false)

    const {
        data: personalityTemplate,
        isLoading,
        error,
        refetch,
    } = useApiQuery(
        orgId && projId ? ['personalityTemplate', orgId, projId] : ['personalityTemplate', 'none'],
        () => (
            orgId && projId
                ? getProjectPersonalityTemplate({ organizationId: orgId, projectId: projId })
                : Promise.resolve(null)
        ),
        { enabled: !!orgId && !!projId }
    )

    useEffect(() => {
        const nextFormState = personalityTemplateToFormState(personalityTemplate)
        if (!isSuperAdmin) {
            nextFormState.templateType = 'PARAMETERIZED'
        }
        setFormState(nextFormState)
    }, [isSuperAdmin, personalityTemplate])

    const handleSubmit = async (event) => {
        event.preventDefault()
        if (!orgId || !projId) return

        setIsSaving(true)
        setSaveError('')
        setSaveNotice('')
        try {
            const draft = personalityFormStateToDraft(formState)
            if (!isSuperAdmin) {
                draft.templateType = 'PARAMETERIZED'
            }
            await saveProjectPersonalityTemplate(
                { organizationId: orgId, projectId: projId },
                draft
            )
            setSaveNotice('Personality template saved.')
            await refetch()
        } catch (submitError) {
            const message = submitError instanceof Error ? submitError.message : 'Failed to save personality template.'
            setSaveError(message)
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="am-page-content">
            <div className="am-knowledge-container">
                <div className="am-page-header">
                    <div>
                        <h1 className="am-page-title">Personality</h1>
                        <p className="am-page-subtitle">
                            Configure the Project&apos;s conversation template for the agent.
                        </p>
                    </div>
                </div>

                <section className="am-card">
                    {isLoading && (
                        <div className="am-text-2" style={{ padding: '1rem 0' }}>
                            Loading personality template...
                        </div>
                    )}

                    {!isLoading && error && (
                        <QueryError message="Failed to load personality template." error={error} onRetry={refetch} />
                    )}

                    {!isLoading && !error && (
                        <PersonalityTemplateForm
                            value={formState}
                            disabled={isSaving}
                            canUseFullControlled={isSuperAdmin}
                            onChange={setFormState}
                            onSubmit={handleSubmit}
                        />
                    )}

                    {saveNotice && (
                        <div className="am-text-2" style={{ color: '#22c55e', marginTop: '1rem' }}>
                            {saveNotice}
                        </div>
                    )}
                    {saveError && (
                        <div className="am-text-2" style={{ color: '#ef4444', marginTop: '1rem' }}>
                            {saveError}
                        </div>
                    )}
                </section>
            </div>
        </div>
    )
}

export default Personality
