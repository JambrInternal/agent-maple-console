import React from 'react'
import { Plus, Cloud, FileText, MoreVertical } from 'lucide-react'

const DataSources = () => {
    const files = [
        { id: 1, name: '251017_Ops Flowchart.pdf', hash: '2a33eb63dc72...', size: '24.41 KB', type: 'application/pdf', source: 'upload', date: '3 days ago' },
        { id: 2, name: '251017_PM Checklist.pdf', hash: 'a2cf5be1f22c...', size: '28.91 KB', type: 'application/pdf', source: 'upload', date: '3 days ago' },
        { id: 3, name: 'Quality Assurance Program Manual R.0.pdf', hash: '1d02a0e09172...', size: '873.71 KB', type: 'application/pdf', source: 'upload', date: '3 days ago' },
        { id: 4, name: 'IRON MAPLE OPERATIONS MANUAL - 2025-03-27.pdf', hash: '9408ba3bc4b5...', size: '908.91 KB', type: 'application/pdf', source: 'upload', date: '4 days ago' },
        { id: 5, name: '2025 - IMC Safety Manual - 2025-01-05.pdf', hash: '33adb2c60642...', size: '7.97 MB', type: 'application/pdf', source: 'upload', date: '4 days ago' },
    ]

    return (
        <div className="data-sources-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Data Sources</h1>
                    <p className="page-subtitle">Manage your uploaded files and data sources</p>
                </div>
                <div className="header-actions">
                    <button className="btn-secondary">
                        <Cloud size={16} />
                        <span>Sync Google Drive</span>
                    </button>
                    <button className="btn-primary">
                        <Plus size={16} />
                        <span>Upload File</span>
                    </button>
                </div>
            </div>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>File Name</th>
                            <th>Size</th>
                            <th>Type</th>
                            <th>Source</th>
                            <th>Uploaded</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {files.map((file) => (
                            <tr key={file.id}>
                                <td>
                                    <div className="file-cell">
                                        <div className="file-icon">
                                            <FileText size={16} />
                                        </div>
                                        <div className="file-info">
                                            <span className="file-name">{file.name}</span>
                                            <span className="file-hash">Hash: {file.hash}</span>
                                        </div>
                                    </div>
                                </td>
                                <td>{file.size}</td>
                                <td>{file.type}</td>
                                <td>
                                    <span className="source-pill">{file.source}</span>
                                </td>
                                <td>{file.date}</td>
                                <td className="action-cell">
                                    <button className="icon-btn">
                                        <MoreVertical size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default DataSources
