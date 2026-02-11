export const INVITATION_PATH_PREFIXES = ['/accept-invitation', '/user/accept-invitation']

const INVITE_TOKEN_KEYS = new Set(['token', 'invitation_token', 'invite_token'])

const decodeRawValue = (value) => {
    if (!value) return ''
    try {
        return decodeURIComponent(value)
    } catch {
        return value
    }
}

const normalizeToken = (value) => {
    if (!value) return null
    const trimmed = value.trim()
    if (!trimmed) return null
    return trimmed.replace(/\s+/g, '+')
}

const getTokenFromRawQuery = (query) => {
    if (!query) return null
    const raw = query.startsWith('?') ? query.slice(1) : query
    if (!raw) return null

    const entries = raw.split('&')
    for (const entry of entries) {
        if (!entry) continue
        const splitIndex = entry.indexOf('=')
        const rawKey = splitIndex >= 0 ? entry.slice(0, splitIndex) : entry
        const rawValue = splitIndex >= 0 ? entry.slice(splitIndex + 1) : ''
        const key = decodeRawValue(rawKey)
        if (!INVITE_TOKEN_KEYS.has(key)) continue
        return normalizeToken(decodeRawValue(rawValue))
    }

    return null
}

export const getInvitationToken = (search, hash) => {
    const fromQuery = getTokenFromRawQuery(search || '')
    if (fromQuery) return fromQuery

    if (hash) {
        const hashValue = hash.startsWith('#') ? hash.slice(1) : hash
        const hashQueryIndex = hashValue.indexOf('?')
        const hashQuery = hashQueryIndex >= 0 ? hashValue.slice(hashQueryIndex + 1) : hashValue
        return getTokenFromRawQuery(hashQuery)
    }

    return null
}

export const isInvitationPath = (path) => {
    if (!path) return false
    return INVITATION_PATH_PREFIXES.some((prefix) => path.startsWith(prefix))
}
