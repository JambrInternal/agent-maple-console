import React from 'react'
import { MoreHorizontal } from 'lucide-react'

export default function KnowledgeActionsMenu({
    row,
    isOpen,
    openUpward,
    isBusy,
    onToggle,
    onViewChunks,
    onDownload,
    onReprocess,
    onDelete,
}) {
    return (
        <div className={`am-row-menu${isOpen ? ' is-open' : ''}`} data-knowledge-menu>
            <button
                type="button"
                className="am-icon-button"
                aria-label={`Knowledge actions for ${row.name}`}
                aria-haspopup="menu"
                aria-expanded={isOpen}
                onClick={onToggle}
                disabled={isBusy}
            >
                <MoreHorizontal size={16} />
            </button>
            {isOpen && (
                <div
                    className={`am-row-menu-dropdown${openUpward ? ' is-up' : ''}`}
                    role="menu"
                >
                    <button
                        type="button"
                        className="am-row-menu-item"
                        role="menuitem"
                        onClick={onViewChunks}
                        disabled={isBusy}
                    >
                        View chunks
                    </button>
                    <button
                        type="button"
                        className="am-row-menu-item"
                        role="menuitem"
                        onClick={onDownload}
                        disabled={isBusy}
                    >
                        Download
                    </button>
                    <button
                        type="button"
                        className="am-row-menu-item"
                        role="menuitem"
                        onClick={onReprocess}
                        disabled={isBusy}
                    >
                        Reprocess
                    </button>
                    <button
                        type="button"
                        className="am-row-menu-item"
                        role="menuitem"
                        onClick={onDelete}
                        disabled={isBusy}
                    >
                        Delete
                    </button>
                </div>
            )}
        </div>
    )
}

