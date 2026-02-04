import React from 'react'
import { Plus } from 'lucide-react'

const Contacts = () => {
    const contacts = [
        {
            id: 'contact_1',
            name: 'Joe Henderson',
            role: 'GC Superintendent',
            contactInfo: '+1 (555) 0123',
            escalation: 'Level 1 (Direct)',
            status: 'active',
        },
        {
            id: 'contact_2',
            name: 'Sarah Jenkins',
            role: 'Senior Architect',
            contactInfo: 'sarah@firm.com',
            escalation: 'Level 2 (Technical)',
            status: 'active',
        },
        {
            id: 'contact_3',
            name: 'Mike Ross',
            role: 'Safety Officer',
            contactInfo: '+1 (555) 9988',
            escalation: 'Emergency Only',
            status: 'on-break',
        },
    ]

    const statusLabels = {
        active: 'Active',
        'on-break': 'On-Break',
    }

    return (
        <div className="am-page-content">
            <div className="am-contacts-container">
                <div className="am-page-header">
                    <div>
                        <h1 className="am-page-title">Contacts</h1>
                        <p className="am-page-subtitle">
                            Assign escalation paths and manage emergency contacts for the AI agent.
                        </p>
                    </div>
                    <button className="am-btn-primary" type="button">
                        <Plus size={16} />
                        <span>Add Contact</span>
                    </button>
                </div>

                <div className="am-table-card">
                    <table className="am-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Role</th>
                                <th>Contact Info</th>
                                <th>Escalation Level</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contacts.map((contact) => (
                                <tr key={contact.id}>
                                    <td className="am-contact-name">{contact.name}</td>
                                    <td className="am-text-2">{contact.role}</td>
                                    <td className="am-contact-info">{contact.contactInfo}</td>
                                    <td className="am-text-2">{contact.escalation}</td>
                                    <td>
                                        <span className={`am-status-pill is-${contact.status}`}>
                                            {statusLabels[contact.status] || contact.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default Contacts
