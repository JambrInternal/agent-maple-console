import { KeyboardEvent, MouseEvent } from 'react'
import { Button, Input } from '../../../../components/ui'

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
    const canDismiss = !isCreating

    const handleBackdropKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onClose()
        }
    }
    const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
        if (event.target === event.currentTarget) {
            onClose()
        }
    }
    const modalContent = (
        <div
            className="am-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-project-title"
        >
            <div className="am-modal-header">
                <h2 className="am-modal-title" id="create-project-title">
                    Create Project
                </h2>
                <Button type="button" variant="icon" size="icon" onClick={onClose} aria-label="Close">
                    ×
                </Button>
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
                            <Input
                                id="project-name"
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
                        <Button type="button" variant="secondary" onClick={onClose} disabled={isCreating}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" disabled={isCreating}>
                            {isCreating ? 'Creating...' : 'Create Project'}
                        </Button>
                    </div>
            </form>
        </div>
    )

    if (!canDismiss) {
        return <div className="am-modal-backdrop" role="presentation" aria-hidden="true">{modalContent}</div>
    }

    return (
        <div
            className="am-modal-backdrop"
            role="button"
            tabIndex={0}
            onClick={handleBackdropClick}
            onKeyDown={handleBackdropKeyDown}
        >
            {modalContent}
        </div>
    )
}
