import React from 'react'
import { FileText } from 'lucide-react'
import KnowledgeSourceBadge from './KnowledgeSourceBadge'
import { formatKnowledgeDate, KNOWLEDGE_STATUS_LABELS } from '../knowledgeUtils'

export default function KnowledgeTable({ rows }) {
    return (
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
                            <td>
                                <KnowledgeSourceBadge type={row.type} />
                            </td>
                            <td>
                                <span className={`am-pill is-${row.status}`}>
                                    {KNOWLEDGE_STATUS_LABELS[row.status] || row.status}
                                </span>
                            </td>
                            <td className="am-text-2">{formatKnowledgeDate(row.createdAt)}</td>
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
