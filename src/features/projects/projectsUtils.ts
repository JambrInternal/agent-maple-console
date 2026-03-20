export const PROJECT_STATUS_OPTIONS = [
    { key: 'all', label: 'All' },
    { key: 'online', label: 'Online' },
    { key: 'offline', label: 'Offline' },
]

const PROJECT_STATUS_LABELS = {
    online: 'Online',
    offline: 'Offline',
}

export const getProjectStatusLabel = (status) => {
    return PROJECT_STATUS_LABELS[status] || 'Unknown'
}

export const formatProjectLastActivity = (value) => {
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

export const filterProjects = ({ projects, searchTerm, statusFilter }) => {
    const normalizedSearch = (searchTerm || '').trim().toLowerCase()

    return projects.filter((project) => {
        const projectName = (project.name || '').toLowerCase()
        const matchesSearch = !normalizedSearch || projectName.includes(normalizedSearch)
        const matchesStatus = statusFilter === 'all' || project.agentStatus === statusFilter
        return matchesSearch && matchesStatus
    })
}
