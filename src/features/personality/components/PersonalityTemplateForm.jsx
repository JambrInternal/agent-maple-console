import React from 'react'

const TEXTAREA_ROWS = 3
const LIST_ROWS = 3

const ListField = ({ id, label, value, onChange, disabled }) => (
    <div className="am-form-field">
        <label className="am-label" htmlFor={id}>{label}</label>
        <textarea
            id={id}
            className="am-input"
            rows={LIST_ROWS}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="One item per line"
            style={{ resize: 'vertical' }}
            disabled={disabled}
        />
    </div>
)

export default function PersonalityTemplateForm({
    value,
    disabled,
    canUseFullControlled = false,
    onChange,
    onSubmit,
}) {
    const setField = (field, fieldValue) => {
        onChange({
            ...value,
            [field]: fieldValue,
        })
    }

    const templateTypeValue = canUseFullControlled
        ? value.templateType
        : 'PARAMETERIZED'
    const isFullControlledMode = canUseFullControlled && templateTypeValue === 'FULL_CONTROLLED'

    const handleTemplateTypeChange = (event) => {
        const nextTemplateType = event.target.value === 'FULL_CONTROLLED' && !canUseFullControlled
            ? 'PARAMETERIZED'
            : event.target.value
        setField('templateType', nextTemplateType)
    }

    return (
        <form onSubmit={onSubmit}>
            <div className="am-form">
                {canUseFullControlled && (
                    <div className="am-form-grid">
                        <div className="am-form-field">
                            <label className="am-label" htmlFor="personality-template-type">Template Type</label>
                            <select
                                id="personality-template-type"
                                className="am-input"
                                value={templateTypeValue}
                                onChange={handleTemplateTypeChange}
                                disabled={disabled}
                            >
                                <option value="PARAMETERIZED">Parameterized</option>
                                <option value="FULL_CONTROLLED">Full Controlled</option>
                            </select>
                        </div>
                    </div>
                )}

                {!isFullControlledMode && (
                    <>
                        <div className="am-form-grid">
                            <div className="am-form-field">
                                <label className="am-label" htmlFor="personality-user-role">User Role</label>
                                <input
                                    id="personality-user-role"
                                    className="am-input"
                                    type="text"
                                    value={value.userRole}
                                    onChange={(event) => setField('userRole', event.target.value)}
                                    disabled={disabled}
                                    required
                                />
                            </div>

                            <div className="am-form-field">
                                <label className="am-label" htmlFor="personality-conversation-type">Conversation Type</label>
                                <input
                                    id="personality-conversation-type"
                                    className="am-input"
                                    type="text"
                                    value={value.conversationType}
                                    onChange={(event) => setField('conversationType', event.target.value)}
                                    disabled={disabled}
                                    required
                                />
                            </div>

                            <div className="am-form-field">
                                <label className="am-label" htmlFor="personality-ai-role">AI Role</label>
                                <input
                                    id="personality-ai-role"
                                    className="am-input"
                                    type="text"
                                    value={value.aiRole}
                                    onChange={(event) => setField('aiRole', event.target.value)}
                                    disabled={disabled}
                                    required
                                />
                            </div>
                        </div>

                        <div className="am-form-field">
                            <label className="am-label" htmlFor="personality-context-content">Context</label>
                            <textarea
                                id="personality-context-content"
                                className="am-input"
                                rows={4}
                                value={value.contextContent}
                                onChange={(event) => setField('contextContent', event.target.value)}
                                style={{ resize: 'vertical' }}
                                disabled={disabled}
                            />
                        </div>

                        <div className="am-form-grid">
                            <ListField
                                id="personality-characteristics"
                                label="AI Characteristics"
                                value={value.aiRoleCharacteristics}
                                onChange={(nextValue) => setField('aiRoleCharacteristics', nextValue)}
                                disabled={disabled}
                            />
                            <ListField
                                id="personality-tone"
                                label="Emotional Tone"
                                value={value.aiRoleEmotionalTone}
                                onChange={(nextValue) => setField('aiRoleEmotionalTone', nextValue)}
                                disabled={disabled}
                            />
                            <ListField
                                id="personality-dialogue-strategy"
                                label="Dialogue Strategy"
                                value={value.aiRoleDialogueStrategy}
                                onChange={(nextValue) => setField('aiRoleDialogueStrategy', nextValue)}
                                disabled={disabled}
                            />
                            <ListField
                                id="personality-constraints"
                                label="Constraints"
                                value={value.aiRoleConstraints}
                                onChange={(nextValue) => setField('aiRoleConstraints', nextValue)}
                                disabled={disabled}
                            />
                            <ListField
                                id="personality-goals"
                                label="Goals"
                                value={value.goals}
                                onChange={(nextValue) => setField('goals', nextValue)}
                                disabled={disabled}
                            />
                            <ListField
                                id="personality-evaluation"
                                label="Evaluation Criteria"
                                value={value.evaluationCriteria}
                                onChange={(nextValue) => setField('evaluationCriteria', nextValue)}
                                disabled={disabled}
                            />
                        </div>
                    </>
                )}

                {isFullControlledMode && (
                    <>
                        <div className="am-form-field">
                            <label className="am-label" htmlFor="personality-agent-instructions">Agent Instructions</label>
                            <textarea
                                id="personality-agent-instructions"
                                className="am-input"
                                rows={TEXTAREA_ROWS}
                                value={value.agentInstructions}
                                onChange={(event) => setField('agentInstructions', event.target.value)}
                                style={{ resize: 'vertical' }}
                                disabled={disabled}
                            />
                        </div>

                        <div className="am-form-field">
                            <label className="am-label" htmlFor="personality-runner-instructions">Runner Instructions</label>
                            <textarea
                                id="personality-runner-instructions"
                                className="am-input"
                                rows={TEXTAREA_ROWS}
                                value={value.runnerInstructions}
                                onChange={(event) => setField('runnerInstructions', event.target.value)}
                                style={{ resize: 'vertical' }}
                                disabled={disabled}
                            />
                        </div>
                    </>
                )}

                <div
                    className="am-form-field"
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: '0.5rem',
                    }}
                >
                    <input
                        id="personality-default"
                        type="checkbox"
                        checked={value.isDefault}
                        onChange={(event) => setField('isDefault', event.target.checked)}
                        disabled={disabled}
                    />
                    <label htmlFor="personality-default" className="am-label" style={{ margin: 0 }}>
                        Mark as default template
                    </label>
                </div>
            </div>

            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="am-btn-primary" disabled={disabled}>
                    {disabled ? 'Saving...' : 'Save Personality'}
                </button>
            </div>
        </form>
    )
}
