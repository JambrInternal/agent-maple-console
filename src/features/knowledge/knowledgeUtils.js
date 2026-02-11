export const KNOWLEDGE_STATUS_LABELS = {
    pending: 'Pending',
    indexing: 'Indexing',
    ready: 'Ready',
    error: 'Error',
}

export const formatKnowledgeDate = (value) => {
    if (!value) return '—'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return '—'

    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })
}
