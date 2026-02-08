import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, Search, ArrowRight, Plus } from 'lucide-react'
import { createOrganization, getOrganizations } from '../services/organizations'
import { withStatus } from '../utils/errors'

const OrgSelection = () => {
    const [orgs, setOrgs] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [createName, setCreateName] = useState('')
    const [createError, setCreateError] = useState('')
    const [isCreating, setIsCreating] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchOrgs = async () => {
            try {
                const data = await getOrganizations()
                setOrgs(data)
            } catch (error) {
                console.error('Failed to fetch organizations:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchOrgs()
    }, [])

    const filteredOrgs = orgs.filter(org =>
        org.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    const hasOrganizations = orgs.length > 0
    const showCreateTile = !hasOrganizations
    const showNoMatches = hasOrganizations && filteredOrgs.length === 0

    const openCreateModal = () => {
        setCreateName('')
        setCreateError('')
        setIsCreateOpen(true)
    }

    const closeCreateModal = () => {
        if (isCreating) return
        setIsCreateOpen(false)
    }

    const handleCreate = async (event) => {
        event.preventDefault()
        const trimmed = createName.trim()
        if (!trimmed) {
            setCreateError('Organization name is required.')
            return
        }
        setCreateError('')
        setIsCreating(true)
        try {
            const org = await createOrganization(trimmed)
            setOrgs((prev) => [org, ...prev])
            localStorage.setItem('am_tenant_id', org.id)
            setIsCreateOpen(false)
            navigate(`/${org.id}/projects`)
        } catch (error) {
            console.error('Failed to create organization:', error)
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

            <div style={{ position: 'relative', marginBottom: '2.5rem' }}>
                <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--am-text-2)' }} />
                <input
                    type="text"
                    placeholder="Search organizations..."
                    className="am-input"
                    style={{
                        width: '100%',
                        padding: '0.75rem 1rem 0.75rem 3rem',
                        backgroundColor: 'var(--am-bg-1)',
                        border: '1px solid var(--am-border)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--am-text-1)',
                        fontSize: '1rem'
                    }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {showCreateTile && (
                    <button
                        type="button"
                        className="am-card"
                        aria-label="Create a New Organization"
                        style={{
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.75rem',
                            textAlign: 'left',
                            borderStyle: 'dashed',
                            borderWidth: '1px',
                            borderColor: 'var(--am-border)',
                            background: 'transparent',
                            opacity: 0.85,
                        }}
                        onClick={openCreateModal}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                backgroundColor: 'var(--am-bg-0)',
                                color: 'var(--am-accent)',
                                borderRadius: 'var(--radius-md)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px dashed var(--am-border)'
                            }}>
                                <Plus size={24} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 className="am-text-1" style={{ fontSize: '1.125rem', marginBottom: '0.25rem' }}>
                                    Create a New Organization
                                </h3>
                                <p className="am-text-2" style={{ fontSize: '0.875rem' }}>
                                    You don&apos;t belong to any organizations yet.
                                </p>
                            </div>
                            <ArrowRight size={20} className="am-text-2" />
                        </div>
                    </button>
                )}
                {filteredOrgs.map((org) => (
                    <div
                        key={org.id}
                        className="am-card"
                        style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '1rem' }}
                        onClick={() => {
                            localStorage.setItem('am_tenant_id', org.id);
                            navigate(`/${org.id}/projects`);
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                backgroundColor: 'var(--am-bg-0)',
                                color: 'var(--am-accent)',
                                borderRadius: 'var(--radius-md)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid var(--am-border)'
                            }}>
                                <Building2 size={24} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 className="am-text-1" style={{ fontSize: '1.125rem', marginBottom: '0.25rem' }}>{org.name}</h3>
                                <p className="am-text-2" style={{ fontSize: '0.875rem' }}>{org.projectCount} {org.projectCount === 1 ? 'Project' : 'Projects'}</p>
                            </div>
                            <ArrowRight size={20} className="am-text-2" />
                        </div>
                    </div>
                ))}

                {showNoMatches && (
                    <div className="am-text-2" style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '3rem' }}>
                        No organizations found matching your search.
                    </div>
                )}
            </div>

            {isCreateOpen && (
                <div className="am-modal-backdrop" role="presentation" onClick={closeCreateModal}>
                    <div
                        className="am-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="create-org-title"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="am-modal-header">
                            <h2 className="am-modal-title" id="create-org-title">
                                Create Organization
                            </h2>
                            <button type="button" className="am-icon-button" onClick={closeCreateModal} aria-label="Close">
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleCreate}>
                            <div className="am-text-2" style={{ marginBottom: '1rem' }}>
                                Create a new organization to start managing projects.
                            </div>
                            {createError && (
                                <div className="am-text-2" style={{ color: '#ef4444', marginBottom: '0.75rem' }}>
                                    {createError}
                                </div>
                            )}
                            <div className="am-form">
                                <div className="am-form-field">
                                    <label className="am-label" htmlFor="org-name">
                                        Organization Name
                                    </label>
                                    <input
                                        id="org-name"
                                        className="am-input"
                                        type="text"
                                        placeholder="Enter organization name"
                                        value={createName}
                                        onChange={(event) => setCreateName(event.target.value)}
                                        disabled={isCreating}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="am-modal-footer">
                                <button type="button" className="am-btn-secondary" onClick={closeCreateModal} disabled={isCreating}>
                                    Cancel
                                </button>
                                <button type="submit" className="am-btn-primary" disabled={isCreating}>
                                    {isCreating ? 'Creating...' : 'Create Organization'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default OrgSelection
