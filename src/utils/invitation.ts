/**
 * Compute a non-cryptographic hash of a token.
 * Used to avoid storing raw invitation tokens in sessionStorage keys.
 * @param {string} token - The token to hash
 * @returns {string} - Base36 hash of the token
 */
const hashToken = (token) => {
    if (!token) return 'unknown'

    // Simple non-cryptographic hash to avoid storing the raw token in sessionStorage keys
    let hash = 0
    for (let i = 0; i < token.length; i += 1) {
        hash = (hash << 5) - hash + token.charCodeAt(i)
        hash |= 0 // Convert to 32-bit integer
    }

    return Math.abs(hash).toString(36)
}

/**
 * Generate a sessionStorage key for tracking invite reauth completion.
 * Includes token length to reduce collision risk.
 * @param {string} token - The invitation token
 * @returns {string} - The sessionStorage key
 */
export const inviteReauthKey = (token) => {
    if (!token) {
        return 'am_invite_reauth_done_unknown'
    }

    const lengthPart = token.length.toString(36)
    const hashPart = hashToken(token)

    return `am_invite_reauth_done_${lengthPart}_${hashPart}`
}
