export const KNOWLEDGE_SOURCE_TABS = [
  { key: 'all', label: 'All' },
  { key: 'upload', label: 'Upload' },
  { key: 'knowledge_extraction', label: 'Knowledge Extraction' },
  { key: 'google_drive', label: 'Google Drive' },
  { key: 'sharepoint', label: 'SharePoint' },
]

export const KNOWLEDGE_SOURCE_TAB_KEYS = KNOWLEDGE_SOURCE_TABS.map((tab) => tab.key)

export const DEFAULT_KNOWLEDGE_SOURCE_TAB = 'all'

const OAUTH_QUERY_KEYS = ['oauth_provider', 'code', 'state', 'error', 'error_description']

export const isKnowledgeSourceTab = (value) => KNOWLEDGE_SOURCE_TAB_KEYS.includes(value)

export const normalizeKnowledgeSourceTab = (value) => (
  isKnowledgeSourceTab(value) ? value : DEFAULT_KNOWLEDGE_SOURCE_TAB
)

export const getKnowledgeSourceFilterFromTab = (tab) => {
  const normalized = normalizeKnowledgeSourceTab(tab)
  return normalized === 'all' ? undefined : normalized
}

export const getKnowledgeSourceTabFromSearch = (search) => {
  const params = new URLSearchParams(search || '')
  return normalizeKnowledgeSourceTab(params.get('source'))
}

export const applyKnowledgeSourceTabToSearch = (search, tab) => {
  const params = new URLSearchParams(search || '')
  const normalized = normalizeKnowledgeSourceTab(tab)

  if (normalized === DEFAULT_KNOWLEDGE_SOURCE_TAB) {
    params.delete('source')
  } else {
    params.set('source', normalized)
  }

  const next = params.toString()
  return next ? `?${next}` : ''
}

export const removeOAuthParamsFromSearch = (search) => {
  const params = new URLSearchParams(search || '')
  OAUTH_QUERY_KEYS.forEach((key) => params.delete(key))
  const next = params.toString()
  return next ? `?${next}` : ''
}

export const parseFolderIdsInput = (value) => {
  if (typeof value !== 'string') return []

  return Array.from(new Set(
    value
      .split(/[\n,]/)
      .map((part) => part.trim())
      .filter(Boolean)
  ))
}

