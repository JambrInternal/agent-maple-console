import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { getContacts } from '../services/people'
import { withStatus } from '../utils/errors'

const formatDate = (value) => {
    if (!value) return '—'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return '—'
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })
}

const Contacts = () => {
    const { orgId, projId } = useParams()
    const [contacts, setContacts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        if (!orgId || !projId) return
        const fetchContacts = async () => {
            setLoading(true)
            setError('')
            try {
                const data = await getContacts(orgId)
                setContacts(data)
            } catch (err) {
                console.error('Failed to fetch contacts:', err)
                setError(withStatus('Contacts could not be loaded. Try again.', err))
            } finally {
                setLoading(false)
            }
        }
        fetchContacts()
    }, [orgId, projId])

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
                        {error}
                    </div>
                )}

                {!loading && !error && (
                    <div className="am-table-card">
                        <table className="am-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Company</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Created</th>
                                </tr>
                            </thead>
                            <tbody>
                                {contacts.map((contact) => (
                                    <tr key={contact.id}>
                                        <td className="am-contact-name">{contact.name}</td>
                                        <td className="am-text-2">{contact.company || '—'}</td>
                                        <td className="am-contact-info">{contact.email || '—'}</td>
                                        <td className="am-contact-info">{contact.phone || '—'}</td>
                                        <td className="am-text-2">{formatDate(contact.createdAt)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {contacts.length === 0 && (
                            <div className="am-text-2" style={{ padding: '2rem 0' }}>
                                No contacts found for this project.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Contacts
