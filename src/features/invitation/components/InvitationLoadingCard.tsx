import React from 'react'
import { Loader2 } from 'lucide-react'

export default function InvitationLoadingCard() {
    return (
        <div className="am-app-shell" style={{ alignItems: 'center', justifyContent: 'center' }}>
            <div className="am-card" style={{ width: 'min(520px, 92vw)', textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <Loader2 size={18} className="animate-spin" />
                    <span style={{ fontWeight: 600 }}>Accepting Invitation</span>
                </div>
                <p className="am-text-2">Please wait while we verify your session and join your organization.</p>
            </div>
        </div>
    )
}
