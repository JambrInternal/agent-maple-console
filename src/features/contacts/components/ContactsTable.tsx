import React from 'react'
import { formatContactDate } from '../contactsUtils'

export default function ContactsTable({ contacts }) {
    return (
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
                            <td className="am-text-2">{formatContactDate(contact.createdAt)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {contacts.length === 0 && (
                <div className="am-text-2 am-table-empty">
                    No contacts found for this project.
                </div>
            )}
        </div>
    )
}
