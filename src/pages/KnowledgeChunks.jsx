import React, { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import QueryError from '../components/QueryError'
import { useApiQuery } from '../hooks/useApiQuery'
import {
    deleteKnowledgeChunksBatch,
    listKnowledgeChunks,
    reprocessKnowledgeChunk,
    reprocessKnowledgeChunksBatch,
} from '../services/knowledge'
import { withStatus } from '../utils/errors'

const formatChunkDate = (value) => {
    if (!value) return '—'
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return '—'
    return parsed.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    })
}

const isScopeReady = (scope) => Boolean(scope?.organizationId && scope?.projectId)

const KnowledgeChunks = () => {
    const { orgId, projId, datasourceId } = useParams()
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const [selectedChunkIds, setSelectedChunkIds] = useState(new Set())
    const [actionMessage, setActionMessage] = useState('')
    const [actionError, setActionError] = useState('')
    const [isBatchReprocessing, setIsBatchReprocessing] = useState(false)
    const [isBatchDeleting, setIsBatchDeleting] = useState(false)
    const [rowActionBusyId, setRowActionBusyId] = useState('')

    const scope = useMemo(
        () => (
            orgId && projId
                ? { organizationId: orgId, projectId: projId }
                : null
        ),
        [orgId, projId]
    )

    const chunksQueryKey = useMemo(
        () => (orgId && projId && datasourceId
            ? ['knowledgeChunks', orgId, projId, datasourceId]
            : ['knowledgeChunks', 'none']),
        [datasourceId, orgId, projId]
    )

    const {
        data: chunks = [],
        isLoading: loading,
        error,
        refetch,
    } = useApiQuery(
        chunksQueryKey,
        () => (
            scope && datasourceId
                ? listKnowledgeChunks(scope, {
                    datasourceId,
                    sortBy: 'created_at',
                    sortOrder: 'desc',
                })
                : Promise.resolve([])
        ),
        { enabled: isScopeReady(scope) && Boolean(datasourceId) }
    )

    const refreshChunks = async () => {
        await queryClient.invalidateQueries({ queryKey: chunksQueryKey })
    }

    const clearInlineMessages = () => {
        setActionMessage('')
        setActionError('')
    }

    const runRowAction = async (chunkId, action) => {
        setRowActionBusyId(chunkId)
        clearInlineMessages()
        try {
            await action()
        } catch (error) {
            console.error('Row action failed:', error)
            setActionError(withStatus('Action failed. Please try again.', error))
        } finally {
            setRowActionBusyId('')
        }
    }

    const handleToggleChunk = (chunkId) => {
        setSelectedChunkIds((previous) => {
            const next = new Set(previous)
            if (next.has(chunkId)) {
                next.delete(chunkId)
            } else {
                next.add(chunkId)
            }
            return next
        })
    }

    const handleToggleAll = () => {
        setSelectedChunkIds((previous) => {
            if (chunks.length === 0) return previous
            const allIds = chunks.map((chunk) => chunk.id)
            const allSelected = allIds.every((chunkId) => previous.has(chunkId))
            if (allSelected) return new Set()
            return new Set(allIds)
        })
    }

    const handleBatchReprocess = async () => {
        if (!scope || selectedChunkIds.size === 0) return

        setIsBatchReprocessing(true)
        clearInlineMessages()
        try {
            await reprocessKnowledgeChunksBatch(scope, Array.from(selectedChunkIds))
            setActionMessage(`Reprocess started for ${selectedChunkIds.size} chunk(s).`)
            await refreshChunks()
        } catch (batchError) {
            setActionError(withStatus('Failed to reprocess selected chunks.', batchError))
        } finally {
            setIsBatchReprocessing(false)
        }
    }

    const handleBatchDelete = async () => {
        if (!scope || selectedChunkIds.size === 0) return
        if (!window.confirm(`Delete ${selectedChunkIds.size} selected chunk(s)?`)) return

        setIsBatchDeleting(true)
        clearInlineMessages()
        try {
            await deleteKnowledgeChunksBatch(scope, Array.from(selectedChunkIds))
            setActionMessage(`Deleted ${selectedChunkIds.size} chunk(s).`)
            setSelectedChunkIds(new Set())
            await refreshChunks()
        } catch (batchError) {
            setActionError(withStatus('Failed to delete selected chunks.', batchError))
        } finally {
            setIsBatchDeleting(false)
        }
    }

    const handleReprocessOne = async (chunk) => {
        if (!scope) return

        await runRowAction(chunk.id, async () => {
            await reprocessKnowledgeChunk(scope, chunk.id)
            setActionMessage(`Reprocess started for chunk ${chunk.id}.`)
            await refreshChunks()
        })
    }

    const handleDeleteOne = async (chunk) => {
        if (!scope) return
        if (!window.confirm(`Delete chunk ${chunk.id}?`)) return

        await runRowAction(chunk.id, async () => {
            await deleteKnowledgeChunksBatch(scope, [chunk.id])
            setActionMessage(`Deleted chunk ${chunk.id}.`)
            setSelectedChunkIds((previous) => {
                const next = new Set(previous)
                next.delete(chunk.id)
                return next
            })
            await refreshChunks()
        })
    }

    const selectedCount = selectedChunkIds.size
    const allSelected = chunks.length > 0 && chunks.every((chunk) => selectedChunkIds.has(chunk.id))
    const isBusy = isBatchReprocessing || isBatchDeleting || rowActionBusyId !== ''

    return (
        <div className="am-page-content">
            <div className="am-knowledge-container">
                <div className="am-page-header">
                    <div>
                        <h1 className="am-page-title">Datasource Chunks</h1>
                        <p className="am-page-subtitle">
                            Inspect and manage chunk processing for datasource {datasourceId}.
                        </p>
                    </div>
                    <button
                        type="button"
                        className="am-btn-secondary"
                        onClick={() => navigate(`/${orgId}/${projId}/knowledge`)}
                    >
                        Back to Knowledge
                    </button>
                </div>

                {selectedCount > 0 && (
                    <div className="am-table-card" style={{ marginBottom: '1rem', padding: '0.85rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                            <div className="am-text-2">{selectedCount} chunk(s) selected</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <button
                                    type="button"
                                    className="am-btn-secondary"
                                    disabled={isBusy}
                                    onClick={handleBatchReprocess}
                                >
                                    {isBatchReprocessing ? 'Reprocessing...' : 'Reprocess Selected'}
                                </button>
                                <button
                                    type="button"
                                    className="am-btn-secondary"
                                    disabled={isBusy}
                                    onClick={handleBatchDelete}
                                >
                                    {isBatchDeleting ? 'Deleting...' : 'Delete Selected'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {actionMessage && (
                    <div className="am-text-2" style={{ paddingBottom: '1rem', color: '#38bdf8' }}>
                        {actionMessage}
                    </div>
                )}
                {actionError && (
                    <div className="am-text-2" style={{ paddingBottom: '1rem', color: '#ef4444' }}>
                        {actionError}
                    </div>
                )}

                {loading && (
                    <div className="am-text-2" style={{ padding: '2rem 0' }}>
                        Loading chunks...
                    </div>
                )}

                {!loading && error && (
                    <div className="am-text-2" style={{ padding: '2rem 0', color: '#ef4444' }}>
                        <QueryError message="Failed to load chunks." error={error} onRetry={refetch} />
                    </div>
                )}

                {!loading && !error && (
                    <div className="am-table-card">
                        <table className="am-table am-table-knowledge">
                            <thead>
                                <tr>
                                    <th>
                                        <input
                                            type="checkbox"
                                            className="am-checkbox"
                                            aria-label="Select all chunks"
                                            checked={allSelected}
                                            onChange={handleToggleAll}
                                            disabled={chunks.length === 0}
                                        />
                                    </th>
                                    <th>Chunk ID</th>
                                    <th>Index</th>
                                    <th>Title</th>
                                    <th>Type</th>
                                    <th>Status</th>
                                    <th>Updated</th>
                                    <th className="am-table-action">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {chunks.map((chunk) => (
                                    <tr key={chunk.id}>
                                        <td>
                                            <input
                                                type="checkbox"
                                                className="am-checkbox"
                                                aria-label={`Select chunk ${chunk.id}`}
                                                checked={selectedChunkIds.has(chunk.id)}
                                                onChange={() => handleToggleChunk(chunk.id)}
                                            />
                                        </td>
                                        <td className="am-text-2">{chunk.id}</td>
                                        <td className="am-text-2">{chunk.chunkIndex}</td>
                                        <td className="am-text-2">{chunk.chunkTitle || '—'}</td>
                                        <td className="am-text-2">{chunk.elementType || '—'}</td>
                                        <td>
                                            <span className={`am-pill is-${chunk.status}`}>
                                                {chunk.status}
                                            </span>
                                        </td>
                                        <td className="am-text-2">{formatChunkDate(chunk.updatedAt)}</td>
                                        <td className="am-table-action">
                                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <button
                                                    type="button"
                                                    className="am-btn-secondary"
                                                    onClick={() => handleReprocessOne(chunk)}
                                                    disabled={isBusy}
                                                >
                                                    Reprocess
                                                </button>
                                                <button
                                                    type="button"
                                                    className="am-btn-secondary"
                                                    onClick={() => handleDeleteOne(chunk)}
                                                    disabled={isBusy}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {chunks.length === 0 && (
                            <div className="am-text-2 am-table-empty">
                                No chunks found for this datasource.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default KnowledgeChunks

