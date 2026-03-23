import React from 'react'
import { ArrowRight, Plus } from 'lucide-react'
import { Button } from '../../../../components/ui'

export default function CreateOrganizationTile({ onClick }) {
    return (
        <Button
            type="button"
            variant="ghost"
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
            onClick={onClick}
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
                    border: '1px dashed var(--am-border)',
                }}>
                    <Plus size={24} />
                </div>
                <div style={{ flex: 1 }}>
                    <h3 className="am-text-1" style={{ fontSize: '1.125rem', marginBottom: '0.25rem' }}>
                        Create a New Organization
                    </h3>
                    <p className="am-text-2" style={{ fontSize: '0.875rem' }}>
                        Start a new organization or select one you already belong to.
                    </p>
                </div>
                <ArrowRight size={20} className="am-text-2" />
            </div>
        </Button>
    )
}
