export const INVITATION_PATH_PREFIXES = ['/accept-invitation', '/user/accept-invitation']

const INVITE_TOKEN_KEYS = new Set(['token', 'invitation_token', 'invite_token'])
const INVITE_EMAIL_KEYS = new Set(['email', 'invite_email', 'invited_email', 'invitation_email', 'invitee_email'])

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

const normalizeEmail = (value) => {
  if (!value) return null
  const trimmed = value.trim()
  if (!trimmed) return null
  return trimmed.toLowerCase()
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

const getEmailFromRawQuery = (query) => {
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
    if (!INVITE_EMAIL_KEYS.has(key)) continue
    return normalizeEmail(decodeRawValue(rawValue))
  }

  return null
}

const decodeBase64Url = (value) => {
  if (!value) return null
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padding = normalized.length % 4
  const padded = padding === 0 ? normalized : `${normalized}${'='.repeat(4 - padding)}`

  try {
    if (typeof atob === 'function') {
      return atob(padded)
    }
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(padded, 'base64').toString('utf8')
    }
    return null
  } catch {
    return null
  }
}

const getEmailFromTokenPayload = (token) => {
  if (!token || typeof token !== 'string') return null
  const parts = token.split('.')
  if (parts.length < 2) return null

  const payloadRaw = decodeBase64Url(parts[1])
  if (!payloadRaw) return null

  try {
    const payload = JSON.parse(payloadRaw)
    const candidates = [
      payload?.invitation_email,
      payload?.invited_email,
      payload?.invitee_email,
      payload?.email,
    ]
    for (const candidate of candidates) {
      const normalized = normalizeEmail(typeof candidate === 'string' ? candidate : '')
      if (normalized) return normalized
    }
  } catch {
    return null
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

export const getInvitationEmail = (search, hash) => {
  const fromQuery = getEmailFromRawQuery(search || '')
  if (fromQuery) return fromQuery

  if (hash) {
    const hashValue = hash.startsWith('#') ? hash.slice(1) : hash
    const hashQueryIndex = hashValue.indexOf('?')
    const hashQuery = hashQueryIndex >= 0 ? hashValue.slice(hashQueryIndex + 1) : hashValue
    const fromHash = getEmailFromRawQuery(hashQuery)
    if (fromHash) return fromHash
  }

  const token = getInvitationToken(search, hash)
  return getEmailFromTokenPayload(token)
}

export const isInvitationPath = (path) => {
  if (!path) return false
  return INVITATION_PATH_PREFIXES.some((prefix) => path.startsWith(prefix))
}
