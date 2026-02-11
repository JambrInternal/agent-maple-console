import React from 'react'

export default function CreateProjectModal({
    isOpen,
    isCreating,
    createError,
    createName,
    onCreateNameChange,
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
                aria-labelledby="create-project-title"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="am-modal-header">
                    <h2 className="am-modal-title" id="create-project-title">
                        Create Project
                    </h2>
                    <button type="button" className="am-icon-button" onClick={onClose} aria-label="Close">
                        ×
                    </button>
                </div>
                <form onSubmit={onSubmit}>
                    <div className="am-text-2" style={{ marginBottom: '1rem' }}>
                        Create a new project to start configuring an agent.
                    </div>
                    {createError && (
                        <div className="am-text-2" style={{ color: '#ef4444', marginBottom: '0.75rem' }}>
                            {createError}
                        </div>
                    )}
                    <div className="am-form">
                        <div className="am-form-field">
                            <label className="am-label" htmlFor="project-name">
                                Project Name
                            </label>
                            <input
                                id="project-name"
                                className="am-input"
                                type="text"
                                placeholder="Enter project name"
                                value={createName}
                                onChange={(event) => onCreateNameChange(event.target.value)}
                                disabled={isCreating}
                                required
                            />
                        </div>
                    </div>
                    <div className="am-modal-footer">
                        <button type="button" className="am-btn-secondary" onClick={onClose} disabled={isCreating}>
                            Cancel
                        </button>
                        <button type="submit" className="am-btn-primary" disabled={isCreating}>
                            {isCreating ? 'Creating...' : 'Create Project'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
