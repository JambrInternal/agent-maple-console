import React from 'react'
import { MoreHorizontal } from 'lucide-react'
import { Button } from '../../../components/ui'

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
            <Button
                type="button"
                variant="icon"
                size="icon"
                aria-label={`Knowledge actions for ${row.name}`}
                aria-haspopup="menu"
                aria-expanded={isOpen}
                onClick={onToggle}
                disabled={isBusy}
            >
                <MoreHorizontal size={16} />
            </Button>
            {isOpen && (
                <div
                    className={`am-row-menu-dropdown${openUpward ? ' is-up' : ''}`}
                    role="menu"
                >
                    <Button
                        type="button"
                        variant="ghost"
                        className="am-row-menu-item"
                        role="menuitem"
                        onClick={onViewChunks}
                        disabled={isBusy}
                    >
                        View chunks
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        className="am-row-menu-item"
                        role="menuitem"
                        onClick={onDownload}
                        disabled={isBusy}
                    >
                        Download
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        className="am-row-menu-item"
                        role="menuitem"
                        onClick={onReprocess}
                        disabled={isBusy}
                    >
                        Reprocess
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        className="am-row-menu-item"
                        role="menuitem"
                        onClick={onDelete}
                        disabled={isBusy}
                    >
                        Delete
                    </Button>
                </div>
            )}
        </div>
    )
}
