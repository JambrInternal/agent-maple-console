import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Search, Plus } from 'lucide-react'
import { getProjects } from '../services/projects'

const STATUS_OPTIONS = [
    { key: 'all', label: 'All' },
    { key: 'online', label: 'Online' },
    { key: 'offline', label: 'Offline' },
]

const STATUS_LABELS = {
    online: 'Online',
    offline: 'Offline',
}

const formatTimestamp = (value) => {
    if (!value) return '—'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return '—'
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    })
}

const Projects = () => {
    const { orgId } = useParams()
    const navigate = useNavigate()
    const [projects, setProjects] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')

    useEffect(() => {
        const fetchProjects = async () => {
            if (!orgId) return
            setLoading(true)
            setError('')
            try {
                const data = await getProjects(orgId)
                setProjects(data)
            } catch (err) {
                console.error('Failed to fetch projects:', err)
                setError('Projects could not be loaded. Try again.')
            } finally {
                setLoading(false)
            }
        }
        fetchProjects()
    }, [orgId])

    const filteredProjects = useMemo(() => {
        return projects.filter((project) => {
            const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesStatus = statusFilter === 'all' || project.agentStatus === statusFilter
            return matchesSearch && matchesStatus
        })
    }, [projects, searchTerm, statusFilter])

    return (
        <div className="am-page-content">
            <div className="am-page-header">
                <div>
                    <h1 className="am-page-title">Projects</h1>
                    <p className="am-page-subtitle">Monitor agent status and site activity</p>
                </div>
                <button className="am-btn-primary" type="button">
                    <Plus size={16} />
                    <span>Launch Project</span>
                </button>
            </div>

            <div className="am-projects-toolbar">
                <div className="am-projects-search">
                    <Search size={16} className="am-text-2" />
                    <input
                        className="am-input"
                        placeholder="Search projects..."
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                    />
                </div>
                <div className="am-filter-row">
                    {STATUS_OPTIONS.map((option) => (
                        <button
                            key={option.key}
                            type="button"
                            className={`am-filter-pill ${statusFilter === option.key ? 'active' : ''}`}
                            onClick={() => setStatusFilter(option.key)}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            {loading && (
                <div className="am-text-2" style={{ padding: '2rem 0' }}>
                    Loading projects...
                </div>
            )}

            {!loading && error && (
                <div className="am-text-2" style={{ padding: '2rem 0', color: '#ef4444' }}>
                    {error}
                </div>
            )}

            {!loading && !error && (
                <div className="am-projects-grid">
                    {filteredProjects.map((project) => (
                        <div
                            key={project.id}
                            className="am-card am-project-card"
                            role="button"
                            tabIndex={0}
                            onClick={() => navigate(`/${orgId}/${project.id}/triage`)}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    navigate(`/${orgId}/${project.id}/triage`)
                                }
                            }}
                        >
                            <div className="am-project-card-header">
                                <div>
                                    <h3 className="am-project-name">{project.name}</h3>
                                    <div className={`am-status-badge is-${project.agentStatus}`}>
                                        {STATUS_LABELS[project.agentStatus] || 'Unknown'}
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
                                    <span className="am-meta-value">{formatTimestamp(project.lastActivityAt)}</span>
                                </div>
                            </div>
                        </div>
                    ))}

                    {filteredProjects.length === 0 && (
                        <div className="am-text-2" style={{ padding: '2rem 0' }}>
                            No projects match your filters.
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default Projects
