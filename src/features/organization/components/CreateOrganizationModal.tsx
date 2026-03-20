import React from 'react'

export default function CreateOrganizationModal({
    isOpen,
    isCreating,
    createError,
    name,
    description,
    twilioNumber,
    obtainTwilio,
    onNameChange,
    onDescriptionChange,
    onTwilioNumberChange,
    onObtainTwilioChange,
    onClose,
    onSubmit,
}) {
    if (!isOpen) return null

    return (
        <div className="am-modal-backdrop" role="presentation" onClick={onClose}>
            <div
                className="am-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="create-org-title"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="am-modal-header">
                    <h2 className="am-modal-title" id="create-org-title">
                        Create Organization
                    </h2>
                    <button type="button" className="am-icon-button" onClick={onClose} aria-label="Close">
                        ×
                    </button>
                </div>
                <form onSubmit={onSubmit}>
                    <div className="am-text-2" style={{ marginBottom: '1rem' }}>
                        Create a new organization to start managing projects.
                    </div>
                    {createError && (
                        <div className="am-text-2" style={{ color: '#ef4444', marginBottom: '0.75rem' }}>
                            {createError}
                        </div>
                    )}
                    <div className="am-form">
                        <div className="am-form-field">
                            <label className="am-label" htmlFor="org-name">
                                Organization Name
                            </label>
                            <input
                                id="org-name"
                                className="am-input"
                                type="text"
                                placeholder="Enter organization name"
                                value={name}
                                onChange={(event) => onNameChange(event.target.value)}
                                disabled={isCreating}
                                required
                            />
                        </div>
                        <div className="am-form-field">
                            <label className="am-label" htmlFor="org-description">
                                Description (Optional)
                            </label>
                            <textarea
                                id="org-description"
                                className="am-input"
                                placeholder="Enter organization description"
                                value={description}
                                onChange={(event) => onDescriptionChange(event.target.value)}
                                disabled={isCreating}
                                rows={3}
                                style={{ resize: 'vertical' }}
                            />
                        </div>
                        <div className="am-form-field">
                            <label className="am-label" htmlFor="org-twilio">
                                Twilio Phone Number (Optional)
                            </label>
                            <input
                                id="org-twilio"
                                className="am-input"
                                type="text"
                                placeholder="+1234567890"
                                value={twilioNumber}
                                onChange={(event) => onTwilioNumberChange(event.target.value)}
                                disabled={isCreating || obtainTwilio}
                            />
                        </div>
                        <div
                            className="am-form-field"
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: '0.5rem',
                                marginTop: '0.5rem',
                                justifyContent: 'flex-start',
                            }}
                        >
                            <input
                                id="org-obtain-twilio"
                                type="checkbox"
                                checked={obtainTwilio}
                                onChange={(event) => onObtainTwilioChange(event.target.checked)}
                                disabled={isCreating}
                            />
                            <label className="am-label" htmlFor="org-obtain-twilio" style={{ margin: 0, cursor: 'pointer' }}>
                                Automatically obtain a Twilio phone number
                            </label>
                        </div>
                    </div>
                    <div className="am-modal-footer">
                        <button type="button" className="am-btn-secondary" onClick={onClose} disabled={isCreating}>
                            Cancel
                        </button>
                        <button type="submit" className="am-btn-primary" disabled={isCreating}>
                            {isCreating ? 'Creating...' : 'Create Organization'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
