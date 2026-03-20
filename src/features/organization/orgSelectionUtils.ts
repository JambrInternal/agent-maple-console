export const filterOrganizationsBySearch = (organizations, searchTerm) => {
    const normalizedSearch = (searchTerm || '').trim().toLowerCase()
    if (!normalizedSearch) return organizations

    return organizations.filter((organization) => {
        return (organization.name || '').toLowerCase().includes(normalizedSearch)
    })
}

export const shouldShowCreateTile = ({
    isSuperAdmin,
    hasOrganizations,
}) => isSuperAdmin || !hasOrganizations

export const buildCreateOrganizationRequest = ({
    name,
    description,
    twilioNumber,
    obtainTwilio,
}) => {
    const trimmedName = (name || '').trim()
    if (!trimmedName) {
        return null
    }

    return {
        name: trimmedName,
        description: (description || '').trim() || undefined,
        twilioNumber: (twilioNumber || '').trim() || undefined,
        obtainTwilioPhoneNumber: !!obtainTwilio,
    }
}
