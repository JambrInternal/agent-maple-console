import React from 'react'
import { useParams } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { getContacts } from '../../services/people'
import { useApiQuery } from '../../hooks/useApiQuery'
import QueryError from '../../components/QueryError/QueryError';
import ContactsTable from '../../features/contacts/components/ContactsTable/ContactsTable'
import { Button } from '../../components/ui'

const Contacts = () => {
    const { orgId, projId } = useParams()

    const {
        data: contacts = [],
        isLoading: loading,
        error,
        refetch
    } = useApiQuery(
        orgId && projId ? ['contacts', orgId, projId] : ['contacts', 'none'],
        () => (
            orgId && projId
                ? getContacts({ organizationId: orgId, projectId: projId })
                : Promise.resolve([])
        ),
        { enabled: !!orgId && !!projId }
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
                    <Button type="button" variant="primary" disabled>
                        <Plus size={16} />
                        <span>Add Contact</span>
                    </Button>
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
