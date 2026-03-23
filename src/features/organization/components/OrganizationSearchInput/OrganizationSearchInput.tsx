import React from 'react'
import { Search } from 'lucide-react'
import { Input } from '../../../../components/ui'

export default function OrganizationSearchInput({ value, onChange }) {
    return (
        <div style={{ position: 'relative', marginBottom: '2.5rem' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--am-text-2)' }} />
            <Input
                type="text"
                placeholder="Search organizations..."
                style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 3rem',
                    backgroundColor: 'var(--am-bg-1)',
                    border: '1px solid var(--am-border)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--am-text-1)',
                    fontSize: '1rem',
                }}
                value={value}
                onChange={(event) => onChange(event.target.value)}
            />
        </div>
    )
}
