import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Phone, Copy, Check } from 'lucide-react'
import { useApiQuery } from '../hooks/useApiQuery'
import { getProjectAgentContact } from '../services/agentFacade'
import QueryError from '../components/QueryError'

const Voice = () => {
    const { orgId, projId } = useParams()
    const [copied, setCopied] = useState(false)

    const {
        data: projectAgentContact,
        isLoading,
        error,
        refetch,
    } = useApiQuery(
        orgId && projId ? ['projectAgentContact', orgId, projId] : ['projectAgentContact', 'none'],
        () => (
            orgId && projId
                ? getProjectAgentContact({ organizationId: orgId, projectId: projId })
                : Promise.resolve(null)
        ),
        { enabled: !!orgId && !!projId }
    )

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(projectAgentContact.phoneNumber)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch {}
    }

    return (
        <div className="am-page-content">
            <div className="am-voice-container">
                <div className="am-page-header">
                    <div>
                        <h1 className="am-page-title">Chat on Phone</h1>
                        <p className="am-page-subtitle">
                            Phone sessions are created by the backend per project.
                        </p>
                    </div>
                </div>

                <div className="am-voice-stack">
                    {isLoading && (
                        <div className="am-text-2" style={{ padding: '1rem 0' }}>
                            Loading phone configuration...
                        </div>
                    )}

                    {!isLoading && error && (
                        <QueryError
                            message="Failed to load phone configuration."
                            error={error}
                            onRetry={refetch}
                        />
                    )}

                    {!isLoading && !error && projectAgentContact?.source === 'tenant_twilio' && (
                        <>
                            <div className="am-phone-callout">
                                <div>
                                    <div className="am-phone-number">
                                        {projectAgentContact.phoneNumber}
                                    </div>
                                    <div className="am-phone-number-sub">
                                        Project phone number
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleCopy}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '0.5rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'var(--am-text-2)',
                                    }}
                                    title={copied ? 'Copied!' : 'Copy phone number'}
                                >
                                    {copied ? (
                                        <Check size={20} />
                                    ) : (
                                        <Copy size={20} />
                                    )}
                                </button>
                            </div>

                            <section className="am-card am-voice-callout">
                                <h2>How to use this number</h2>
                                <ul className="am-callout-list">
                                    <li>Call this number to start a conversation with the agent</li>
                                    <li>Each call creates a new conversation thread</li>
                                    <li>Call history appears in the Threads page</li>
                                </ul>
                            </section>
                        </>
                    )}

                    {!isLoading && !error && projectAgentContact?.source !== 'tenant_twilio' && (
                        <section className="am-card am-voice-card">
                            <div className="am-voice-card-title">
                                <Phone size={18} />
                                <span>Phone Session Not Configured</span>
                            </div>
                            <p className="am-text-2">
                                A phone session must be created by the backend before a number is available.
                            </p>
                            <ol className="am-step-list">
                                <li>
                                    <span className="am-step-index">1</span>
                                    <span>Configure a conversation template for this project</span>
                                </li>
                                <li>
                                    <span className="am-step-index">2</span>
                                    <span>Create a call session in the backend</span>
                                </li>
                                <li>
                                    <span className="am-step-index">3</span>
                                    <span>Return here to see the assigned phone number</span>
                                </li>
                            </ol>
                        </section>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Voice
