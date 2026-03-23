import { KeyboardEvent, MouseEvent } from 'react'
import { X } from 'lucide-react'
import { Button, Textarea } from '../../../../components/ui'

export default function KnowledgeCloudSyncDialog({
  isOpen,
  providerLabel,
  folderInput,
  recursive,
  isSubmitting,
  configLoading,
  configError,
  existingFolderIds,
  onFolderInputChange,
  onRecursiveChange,
  onClose,
  onSubmit,
}) {
  if (!isOpen) return null
  const canDismiss = !isSubmitting

  const handleBackdropKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      onClose()
      return
    }

    if (event.target !== event.currentTarget) {
      return
    }

    if (event.key === 'Enter' || event.key === ' ') {
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
      aria-labelledby="knowledge-sync-title"
    >
      <div className="am-modal-header">
        <h2 className="am-modal-title" id="knowledge-sync-title">
                    Sync {providerLabel}
        </h2>
        <Button
          type="button"
          variant="icon"
          size="icon"
          onClick={onClose}
          disabled={isSubmitting}
          aria-label="Close"
        >
          <X size={16} />
        </Button>
      </div>

      <form className="am-form" onSubmit={onSubmit}>
        <div className="am-form-field">
          <label className="am-label" htmlFor="knowledge-folder-ids">
                        Folder IDs (Optional)
          </label>
          <Textarea
            id="knowledge-folder-ids"
            rows={5}
            value={folderInput}
            onChange={(event) => onFolderInputChange(event.target.value)}
            placeholder="root-folder-id, another-folder-id"
          />
          <div className="am-text-2" style={{ fontSize: '0.8rem' }}>
                        Enter folder IDs separated by commas or new lines. Leave empty to sync root.
          </div>
        </div>

        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="checkbox"
            className="am-checkbox"
            checked={recursive}
            onChange={(event) => onRecursiveChange(event.target.checked)}
          />
          <span className="am-text-2">Sync subfolders recursively</span>
        </label>

        <div className="am-form-field">
          <div className="am-label">Current Watched Folders</div>
          {configLoading && (
            <div className="am-text-2">Loading current folder watches...</div>
          )}
          {!configLoading && configError && (
            <div className="am-text-2" style={{ color: '#ef4444' }}>
              {configError}
            </div>
          )}
          {!configLoading && !configError && existingFolderIds.length === 0 && (
            <div className="am-text-2">No watched folders configured yet.</div>
          )}
          {!configLoading && !configError && existingFolderIds.length > 0 && (
            <ul style={{ margin: 0, paddingLeft: '1rem' }}>
              {existingFolderIds.map((folderId) => (
                <li key={folderId} className="am-text-2">
                  {folderId}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="am-modal-footer">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
                        Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Starting Sync...' : `Start ${providerLabel} Sync`}
          </Button>
        </div>
      </form>
    </div>
  )

  if (!canDismiss) {
    return (
      <div className="am-modal-backdrop" role="presentation" aria-hidden="true">
        {modalContent}
      </div>
    )
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
