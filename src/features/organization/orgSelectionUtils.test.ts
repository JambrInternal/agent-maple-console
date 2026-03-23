import { describe, expect, it } from 'vitest'
import {
  buildCreateOrganizationRequest,
  filterOrganizationsBySearch,
  shouldShowCreateTile,
} from './orgSelectionUtils'

describe('orgSelectionUtils', () => {
  it('filters organizations by name with case-insensitive search', () => {
    const result = filterOrganizationsBySearch([
      { id: '1', name: 'Alpha Construction' },
      { id: '2', name: 'Beta Builders' },
    ], 'BETA')

    expect(result).toEqual([{ id: '2', name: 'Beta Builders' }])
  })

  it('returns all organizations for empty search', () => {
    const organizations = [{ id: '1', name: 'Alpha Construction' }]
    expect(filterOrganizationsBySearch(organizations, '   ')).toEqual(organizations)
  })

  it('returns whether create tile should be shown', () => {
    expect(shouldShowCreateTile({ isSuperAdmin: true, hasOrganizations: true })).toBe(true)
    expect(shouldShowCreateTile({ isSuperAdmin: false, hasOrganizations: false })).toBe(true)
    expect(shouldShowCreateTile({ isSuperAdmin: false, hasOrganizations: true })).toBe(false)
  })

  it('builds create organization request payload with trimmed fields', () => {
    const payload = buildCreateOrganizationRequest({
      name: '  Org One  ',
      description: '  Description  ',
      twilioNumber: '  +1234567890  ',
      obtainTwilio: true,
    })

    expect(payload).toEqual({
      name: 'Org One',
      description: 'Description',
      twilioNumber: '+1234567890',
      obtainTwilioPhoneNumber: true,
    })
  })

  it('returns null when name is blank', () => {
    expect(buildCreateOrganizationRequest({
      name: '   ',
      description: '',
      twilioNumber: '',
      obtainTwilio: false,
    })).toBeNull()
  })
})
