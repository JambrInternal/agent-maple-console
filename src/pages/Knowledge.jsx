import React, { useMemo, useState } from 'react'
import { FileText, UploadCloud } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { getKnowledgeSources } from '../services/knowledge'
import { useApiQuery } from '../hooks/useApiQuery'
import { withStatus } from '../utils/errors'
import QueryError from '../components/QueryError';

const Knowledge = () => {
    const { orgId, projId } = useParams()

    const {
        data: sources = [],
        isLoading: loading,
        error,
        refetch
    } = useApiQuery(
        orgId ? ['knowledgeSources', orgId] : ['knowledgeSources', 'none'],
        () => orgId ? getKnowledgeSources(orgId) : Promise.resolve([]),
        { enabled: !!orgId }
    )



    const statusLabels = {
        pending: 'Pending',
        indexing: 'Indexing',
        ready: 'Ready',
        error: 'Error',
    }

    const formatDate = (value) => {
        if (!value) return '—'
        const date = new Date(value)
        if (Number.isNaN(date.getTime())) return '—'
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        })
    }

    const rows = useMemo(() => sources, [sources])

    const renderSource = (type) => {
        if (type === 'google_drive') {
            return <span className="am-source-badge is-google-drive">Google Drive</span>
        }
        return <span className="am-pill is-upload">Upload</span>
    }

    return (
        <div className="am-page-content">
            <div className="am-knowledge-container">
                <div className="am-page-header">
                    <div>
                        <h1 className="am-page-title">Knowledge Base</h1>
                        <p className="am-page-subtitle">
                            Manage your uploaded files and data sources for this project.
                        </p>
                    </div>
                    <button className="am-btn-primary" type="button" disabled>
                        <UploadCloud size={16} />
                        <span>Upload File</span>
                    </button>
                </div>

                {loading && (
                    <div className="am-text-2" style={{ padding: '2rem 0' }}>
                        Loading knowledge sources...
                    </div>
                )}

                {!loading && error && (
                    <div className="am-text-2" style={{ padding: '2rem 0', color: '#ef4444' }}>
                        <QueryError message="Failed to load knowledge." error={error} onRetry={refetch} />
                    </div>
                )}

                {!loading && !error && (
                    <div className="am-table-card">
                        <table className="am-table am-table-knowledge">
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>ID</th>
                                    <th>File Name</th>
                                    <th>Type</th>
                                    <th>Source</th>
                                    <th>Status</th>
                                    <th>Uploaded</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row) => (
                                    <tr key={row.id}>
                                        <td>
                                            <input type="checkbox" className="am-checkbox" />
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
                                        <td>{renderSource(row.type)}</td>
                                        <td>
                                            <span className={`am-pill is-${row.status}`}>
                                                {statusLabels[row.status] || row.status}
                                            </span>
                                        </td>
                                        <td className="am-text-2">{formatDate(row.createdAt)}</td>
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
                )}
            </div>
        </div>
    )
}

export default Knowledge
