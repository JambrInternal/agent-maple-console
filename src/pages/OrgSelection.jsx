import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, Search, ArrowRight } from 'lucide-react'
import { getOrganizations } from '../services/organizations'

const OrgSelection = () => {
    const [orgs, setOrgs] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
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

                {filteredOrgs.length === 0 && (
                    <div className="am-text-2" style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '3rem' }}>
                        No organizations found matching your search.
                    </div>
                )}
            </div>
        </div>
    )
}

export default OrgSelection
