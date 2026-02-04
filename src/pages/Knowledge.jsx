import React, { useMemo, useState } from 'react'
import { FileText, MoreVertical, UploadCloud } from 'lucide-react'

const Knowledge = () => {
    const tabs = [
        { key: 'upload', label: 'File Upload' },
        { key: 'cloud', label: 'Cloud Storage' },
    ]
    const [activeTab, setActiveTab] = useState('upload')

    const dataSources = useMemo(
        () => ({
            upload: [
                {
                    id: '164',
                    name: 'Canadian Electrical code 2024, Part I',
                    hash: '06606cb014e7...',
                    size: '12.39 MB',
                    type: 'PDF',
                    source: 'upload',
                    extraction: 'completed',
                    uploaded: '9 days ago',
                },
                {
                    id: '37',
                    name: 'A1 - Field Review Commitment - Alex Gorham',
                    hash: '060c1a9a32e0...',
                    size: '617.04 KB',
                    type: 'PDF',
                    source: 'upload',
                    extraction: 'completed',
                    uploaded: '2 months ago',
                },
                {
                    id: '35',
                    name: '06724 - Alex Gorham - Serenity lane - Phase 2',
                    hash: '3357e180bd85...',
                    size: '14.93 MB',
                    type: 'PDF',
                    source: 'upload',
                    extraction: 'indexing',
                    uploaded: '2 months ago',
                },
                {
                    id: '32',
                    name: '23-058 Alex Gorham Ph2 - CCN-M-02',
                    hash: '69e63d495aba...',
                    size: '2.61 MB',
                    type: 'PDF',
                    source: 'upload',
                    extraction: 'error',
                    uploaded: '2 months ago',
                },
            ],
            cloud: [
                {
                    id: '208',
                    name: 'Site-A Safety Manual',
                    hash: 'ac72b501a1b0...',
                    size: '8.02 MB',
                    type: 'PDF',
                    source: 'cloud',
                    extraction: 'completed',
                    uploaded: '3 days ago',
                },
                {
                    id: '205',
                    name: 'Concrete QA Checklist',
                    hash: '9efc118ff2d1...',
                    size: '410 KB',
                    type: 'DOCX',
                    source: 'cloud',
                    extraction: 'indexing',
                    uploaded: '5 days ago',
                },
            ],
        }),
        []
    )

    const rows = dataSources[activeTab] || []

    const extractionLabels = {
        completed: 'Completed',
        indexing: 'Indexing',
        error: 'Error',
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
                    <button className="am-btn-primary" type="button">
                        <UploadCloud size={16} />
                        <span>Upload File</span>
                    </button>
                </div>

                <div className="am-tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            type="button"
                            className={`am-tab ${activeTab === tab.key ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="am-table-card">
                    <table className="am-table am-table-knowledge">
                        <thead>
                            <tr>
                                <th></th>
                                <th>ID</th>
                                <th>File Name</th>
                                <th>Size</th>
                                <th>Type</th>
                                <th>Source</th>
                                <th>Knowledge Extraction</th>
                                <th>Uploaded</th>
                                <th></th>
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
                                                <div className="am-file-hash">Hash: {row.hash}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="am-text-2">{row.size}</td>
                                    <td className="am-text-2">{row.type}</td>
                                    <td>
                                        <span className={`am-pill is-${row.source}`}>
                                            {row.source}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`am-pill is-${row.extraction}`}>
                                            {extractionLabels[row.extraction] || row.extraction}
                                        </span>
                                    </td>
                                    <td className="am-text-2">{row.uploaded}</td>
                                    <td className="am-table-action">
                                        <button type="button" className="am-icon-button" aria-label="Row actions">
                                            <MoreVertical size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default Knowledge
