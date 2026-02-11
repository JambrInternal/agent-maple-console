import React from 'react'
import { useParams } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { getContacts } from '../services/people'
import { useApiQuery } from '../hooks/useApiQuery'
import QueryError from '../components/QueryError';
import ContactsTable from '../features/contacts/components/ContactsTable'

const Contacts = () => {
    const { orgId } = useParams()

    const {
        data: contacts = [],
        isLoading: loading,
        error,
        refetch
    } = useApiQuery(
        orgId ? ['contacts', orgId] : ['contacts', 'none'],
        () => orgId ? getContacts(orgId) : Promise.resolve([]),
        { enabled: !!orgId }
    )
    return (
        <div className="am-page-content">
            <div className="am-contacts-container">
                <div className="am-page-header">
                    <div>
                        <h1 className="am-page-title">Contacts</h1>
                        <p className="am-page-subtitle">
                            Manage project contacts and escalation points for the AI agent.
                        </p>
                    </div>
                    <button className="am-btn-primary" type="button" disabled>
                        <Plus size={16} />
                        <span>Add Contact</span>
                    </button>
                </div>

                {loading && (
                    <div className="am-text-2" style={{ padding: '2rem 0' }}>
                        Loading contacts...
                    </div>
                )}

                {!loading && error && (
                    <div className="am-text-2" style={{ padding: '2rem 0', color: '#ef4444' }}>
                        <QueryError message="Failed to load contacts." error={error} onRetry={refetch} />
                    </div>
                )}

                {!loading && !error && (
                    <ContactsTable contacts={contacts} />
                )}
            </div>
        </div>
    )
}

export default Contacts
