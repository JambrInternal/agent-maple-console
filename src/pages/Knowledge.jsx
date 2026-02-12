import React, { useMemo } from 'react'
import { UploadCloud } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { getKnowledgeSources } from '../services/knowledge'
import { useApiQuery } from '../hooks/useApiQuery'
import QueryError from '../components/QueryError';
import KnowledgeTable from '../features/knowledge/components/KnowledgeTable'

const Knowledge = () => {
    const { orgId, projId } = useParams()

    const {
        data: sources = [],
        isLoading: loading,
        error,
        refetch
    } = useApiQuery(
        orgId && projId ? ['knowledgeSources', orgId, projId] : ['knowledgeSources', 'none'],
        () => (
            orgId && projId
                ? getKnowledgeSources({ organizationId: orgId, projectId: projId })
                : Promise.resolve([])
        ),
        { enabled: !!orgId && !!projId }
    )
    const rows = useMemo(() => sources, [sources])

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
                    <KnowledgeTable rows={rows} />
                )}
            </div>
        </div>
    )
}

export default Knowledge
