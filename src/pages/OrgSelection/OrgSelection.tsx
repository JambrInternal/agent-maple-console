import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createOrganization, getOrganizations } from '../../services/organizations'
import { useApiQuery } from '../../hooks/useApiQuery'
import CreateOrganizationTile from '../../features/organization/components/CreateOrganizationTile/CreateOrganizationTile'
import CreateOrganizationModal from '../../features/organization/components/CreateOrganizationModal/CreateOrganizationModal'
import OrganizationCard from '../../features/organization/components/OrganizationCard/OrganizationCard'
import OrganizationSearchInput from '../../features/organization/components/OrganizationSearchInput/OrganizationSearchInput'
import {
  buildCreateOrganizationRequest,
  filterOrganizationsBySearch,
  shouldShowCreateTile,
} from '../../features/organization/orgSelectionUtils'
import { withStatus } from '../../utils/errors'
import { getAdminMode } from '../../utils/admin'
import { dispatchTenantChange } from '../../featureFlags/featureFlagService'
import logger from '../../utils/verboseLogger'

const OrgSelection = () => {
  const {
    data: orgsData = [],
    isLoading: loading,
  } = useApiQuery('organizations', getOrganizations)
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [createName, setCreateName] = useState('')
  const [createDescription, setCreateDescription] = useState('')
  const [createTwilioNumber, setCreateTwilioNumber] = useState('')
  const [obtainTwilio, setObtainTwilio] = useState(false)
  const [createError, setCreateError] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const navigate = useNavigate()

  const filteredOrgs = filterOrganizationsBySearch(orgsData, searchTerm)
  const hasOrganizations = orgsData.length > 0
  const isSuperAdmin = getAdminMode()
  const showCreateTile = shouldShowCreateTile({ isSuperAdmin, hasOrganizations })
  const showNoMatches = hasOrganizations && filteredOrgs.length === 0

  const openCreateModal = () => {
    setCreateName('')
    setCreateDescription('')
    setCreateTwilioNumber('')
    setObtainTwilio(false)
    setCreateError('')
    setIsCreateOpen(true)
  }

  const closeCreateModal = () => {
    if (isCreating) return
    setIsCreateOpen(false)
  }

  const handleCreate = async (event) => {
    event.preventDefault()
    const request = buildCreateOrganizationRequest({
      name: createName,
      description: createDescription,
      twilioNumber: createTwilioNumber,
      obtainTwilio,
    })

    if (!request) {
      setCreateError('Organization name is required.')
      return
    }

    setCreateError('')
    setIsCreating(true)
    try {
      const org = await createOrganization(request)
      localStorage.setItem('am_tenant_id', org.id)
      dispatchTenantChange(org.id)
      setIsCreateOpen(false)
      navigate(`/${org.id}/projects`)
    } catch (error) {
      logger.error('Failed to create organization:', error)
      setCreateError(withStatus('Organization could not be created. Try again.', error))
    } finally {
      setIsCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="am-page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
        <div className="am-text-2">Loading organizations...</div>
      </div>
    )
  }

  return (
    <div className="am-page-content" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <h1 className="am-text-1" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Welcome back</h1>
        <p className="am-text-2">Select an organization to manage projects and contacts</p>
      </div>

      <OrganizationSearchInput value={searchTerm} onChange={setSearchTerm} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {showCreateTile && (
          <CreateOrganizationTile onClick={openCreateModal} />
        )}
        {filteredOrgs.map((org) => (
          <OrganizationCard
            key={org.id}
            organization={org}
            onSelect={() => {
              localStorage.setItem('am_tenant_id', org.id)
              dispatchTenantChange(org.id)
              navigate(`/${org.id}/projects`)
            }}
          />
        ))}

        {showNoMatches && (
          <div className="am-text-2" style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '3rem' }}>
                        No organizations found matching your search.
          </div>
        )}
      </div>

      <CreateOrganizationModal
        isOpen={isCreateOpen}
        isCreating={isCreating}
        createError={createError}
        name={createName}
        description={createDescription}
        twilioNumber={createTwilioNumber}
        obtainTwilio={obtainTwilio}
        onNameChange={setCreateName}
        onDescriptionChange={setCreateDescription}
        onTwilioNumberChange={setCreateTwilioNumber}
        onObtainTwilioChange={setObtainTwilio}
        onClose={closeCreateModal}
        onSubmit={handleCreate}
      />
    </div>
  )
}

export default OrgSelection
