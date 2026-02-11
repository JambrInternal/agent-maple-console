import React from 'react'
import { ArrowRight, Building2 } from 'lucide-react'

export default function OrganizationCard({ organization, onSelect }) {
    return (
        <div
            className="am-card"
            style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '1rem' }}
            onClick={onSelect}
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
                    border: '1px solid var(--am-border)',
                }}>
                    <Building2 size={24} />
                </div>
                <div style={{ flex: 1 }}>
                    <h3 className="am-text-1" style={{ fontSize: '1.125rem', marginBottom: '0.25rem' }}>{organization.name}</h3>
                    {typeof organization.projectCount === 'number' && (
                        <p className="am-text-2" style={{ fontSize: '0.875rem' }}>
                            {organization.projectCount} {organization.projectCount === 1 ? 'Project' : 'Projects'}
                        </p>
                    )}
                </div>
                <ArrowRight size={20} className="am-text-2" />
            </div>
        </div>
    )
}
