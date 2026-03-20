import React from 'react'
import { formatProjectLastActivity, getProjectStatusLabel } from '../projectsUtils'

export default function ProjectCard({ project, onOpenProject }) {
    const openProject = () => onOpenProject(project.id)
    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            openProject()
        }
    }

    return (
        <div
            className="am-card am-project-card"
            role="button"
            tabIndex={0}
            onClick={openProject}
            onKeyDown={handleKeyDown}
        >
            <div className="am-project-card-header">
                <div>
                    <h3 className="am-project-name">{project.name}</h3>
                    <div className={`am-status-badge is-${project.agentStatus}`}>
                        {getProjectStatusLabel(project.agentStatus)}
                    </div>
                </div>
            </div>

            <div className="am-project-meta">
                <div>
                    <span className="am-meta-label">Threads</span>
                    <span className="am-meta-value">{project.threadCount}</span>
                </div>
                <div>
                    <span className="am-meta-label">Issues</span>
                    <span className="am-meta-value">{project.issueCount}</span>
                </div>
                <div>
                    <span className="am-meta-label">Last Activity</span>
                    <span className="am-meta-value">{formatProjectLastActivity(project.lastActivityAt)}</span>
                </div>
            </div>
        </div>
    )
}
