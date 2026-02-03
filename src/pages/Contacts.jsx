import React from 'react'
import { Plus, MoreHorizontal } from 'lucide-react'

const Contacts = () => {
    // Mock Data
    const contacts = [
        { id: 1, name: 'Aaron i Ho', email: 'cnhefang+i@gmail.com', phone: '+15062926575', created: '2025-11-25', updated: '2025-11-25' },
        { id: 2, name: 'Jeremy Legere', email: 'jeremy@jambr.ca', phone: '+15066092430', created: '2025-11-25', updated: '2025-11-25' },
        { id: 3, name: 'Joe Joe', email: 'Joe@jambr.ca', phone: '+15065120191', created: '2025-11-25', updated: '2025-11-25' },
        { id: 4, name: 'Andre Comeau', email: 'Andre@jambr.ca', phone: '+15062339368', created: '2025-11-27', updated: '2025-11-27' },
        { id: 5, name: 'Chad Tupper', email: 'Chad@jambr.ca', phone: '+15065120038', created: '2025-11-27', updated: '2025-11-27' },
        { id: 6, name: 'Logan Carr', email: 'logan@jambr.ca', phone: '+15069771423', created: '2025-11-27', updated: '2025-11-27' },
        { id: 7, name: 'Je Le', email: 'legere@fastmail.com', phone: '-', created: '2025-11-25', updated: '2025-11-25' },
        { id: 8, name: 'AaronL Ho', email: 'cnhefang+l@gmail.com', phone: '-', created: '2025-11-25', updated: '2025-11-25' },
    ]

    return (
        <div className="contacts-page">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Contacts</h1>
                    <p className="page-subtitle">Manage your users and Agent Maple's Contacts</p>
                </div>
                <button className="btn-primary">
                    <Plus size={16} />
                    <span>Invite User</span>
                </button>
            </div>

            {/* Table */}
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone Number</th>
                            <th>Created</th>
                            <th>Last Updated</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {contacts.map((contact) => (
                            <tr key={contact.id}>
                                <td>
                                    <div className="user-cell">
                                        <div className="user-initials">
                                            {contact.name.charAt(0).toUpperCase()}
                                        </div>
                                        <span>{contact.name}</span>
                                    </div>
                                </td>
                                <td>{contact.email}</td>
                                <td>{contact.phone}</td>
                                <td>{contact.created}</td>
                                <td>{contact.updated}</td>
                                <td className="action-cell">
                                    <button className="icon-btn">
                                        <MoreHorizontal size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default Contacts
