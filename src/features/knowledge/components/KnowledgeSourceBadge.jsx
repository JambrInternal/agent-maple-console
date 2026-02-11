import React from 'react'

export default function KnowledgeSourceBadge({ type }) {
    if (type === 'google_drive') {
        return <span className="am-source-badge is-google-drive">Google Drive</span>
    }

    return <span className="am-pill is-upload">Upload</span>
}
