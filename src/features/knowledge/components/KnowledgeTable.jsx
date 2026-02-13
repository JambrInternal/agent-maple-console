import React, { useEffect, useMemo, useState } from 'react'
import { FileText } from 'lucide-react'
import KnowledgeSourceBadge from './KnowledgeSourceBadge'
import KnowledgeActionsMenu from './KnowledgeActionsMenu'
import { formatKnowledgeDate, KNOWLEDGE_STATUS_LABELS } from '../knowledgeUtils'

export default function KnowledgeTable({
    rows,
    selectedRowIds,
    onToggleRowSelection,
    onToggleAllRowSelection,
    onViewChunks,
    onDownload,
    onReprocess,
    onDelete,
    isRowActionBusy,
}) {
    const [openMenuRowId, setOpenMenuRowId] = useState(null)

    const allSelected = useMemo(
        () => rows.length > 0 && rows.every((row) => selectedRowIds.has(row.id)),
        [rows, selectedRowIds]
    )

    useEffect(() => {
        if (!openMenuRowId) return

        const handlePointerDown = (event) => {
            if (event.target instanceof Element && event.target.closest('[data-knowledge-menu]')) return
            setOpenMenuRowId(null)
        }

        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                setOpenMenuRowId(null)
            }
        }

        document.addEventListener('pointerdown', handlePointerDown)
        document.addEventListener('keydown', handleEscape)
        return () => {
            document.removeEventListener('pointerdown', handlePointerDown)
            document.removeEventListener('keydown', handleEscape)
        }
    }, [openMenuRowId])

    const handleToggleRowSelection = (rowId) => {
        onToggleRowSelection(rowId)
    }

    const handleToggleMenu = (rowId) => {
        setOpenMenuRowId((current) => current === rowId ? null : rowId)
    }

    const handleMenuAction = (action) => {
        setOpenMenuRowId(null)
        action()
    }

    return (
        <div className="am-table-card">
            <table className="am-table am-table-knowledge">
                <thead>
                    <tr>
                        <th>
                            <input
                                type="checkbox"
                                className="am-checkbox"
                                aria-label="Select all knowledge sources"
                                checked={allSelected}
                                onChange={onToggleAllRowSelection}
                                disabled={rows.length === 0}
                            />
                        </th>
                        <th>ID</th>
                        <th>File Name</th>
                        <th>Type</th>
                        <th>Source</th>
                        <th>Status</th>
                        <th>Uploaded</th>
                        <th className="am-table-action">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, rowIndex) => (
                        <tr key={row.id}>
                            <td>
                                <input
                                    type="checkbox"
                                    className="am-checkbox"
                                    aria-label={`Select ${row.name}`}
                                    checked={selectedRowIds.has(row.id)}
                                    onChange={() => handleToggleRowSelection(row.id)}
                                />
                            </td>
                            <td className="am-text-2">{row.id}</td>
                            <td>
                                <div className="am-file-cell">
                                    <span className="am-file-icon">
                                        <FileText size={14} />
                                    </span>
                                    <div>
                                        <div className="am-file-name">{row.name}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="am-text-2">{row.type}</td>
                            <td>
                                <KnowledgeSourceBadge type={row.type} />
                            </td>
                            <td>
                                <span className={`am-pill is-${row.status}`}>
                                    {KNOWLEDGE_STATUS_LABELS[row.status] || row.status}
                                </span>
                            </td>
                            <td className="am-text-2">{formatKnowledgeDate(row.createdAt)}</td>
                            <td className="am-table-action">
                                <KnowledgeActionsMenu
                                    row={row}
                                    isOpen={openMenuRowId === row.id}
                                    openUpward={rowIndex >= rows.length - 2}
                                    isBusy={isRowActionBusy(row.id)}
                                    onToggle={() => handleToggleMenu(row.id)}
                                    onViewChunks={() => handleMenuAction(() => onViewChunks(row))}
                                    onDownload={() => handleMenuAction(() => onDownload(row))}
                                    onReprocess={() => handleMenuAction(() => onReprocess(row))}
                                    onDelete={() => handleMenuAction(() => onDelete(row))}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {rows.length === 0 && (
                <div className="am-text-2 am-table-empty">
                    No knowledge sources found for this project.
                </div>
            )}
        </div>
    )
}
