import React from 'react'
import { CheckCircle2 } from 'lucide-react'

export default function InvitationSuccessCard() {
    return (
        <div className="am-app-shell" style={{ alignItems: 'center', justifyContent: 'center' }}>
            <div className="am-card" style={{ width: 'min(520px, 92vw)', textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <CheckCircle2 size={18} style={{ color: '#22c55e' }} />
                    <span style={{ fontWeight: 600 }}>Invitation Accepted</span>
                </div>
                <p className="am-text-2">Redirecting you now.</p>
            </div>
        </div>
    )
}
