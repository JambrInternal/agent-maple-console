import React, { useEffect, useRef, useState } from 'react'
import { MoreVertical, Plus } from 'lucide-react'

const Contacts = () => {
    const contacts = [
        {
            id: 'contact_1',
            name: 'Joe Henderson',
            role: 'GC Superintendent',
            company: 'Iron Maple Construction',
            email: 'joe@ironmaple.ca',
            phone: '+1 (555) 0123',
            reportsTo: 'Sarah Jenkins',
            status: 'active',
        },
        {
            id: 'contact_2',
            name: 'Sarah Jenkins',
            role: 'Senior Architect',
            company: 'Signal Studio',
            email: 'sarah@firm.com',
            phone: '+1 (555) 4422',
            reportsTo: '—',
            status: 'inactive',
        },
        {
            id: 'contact_3',
            name: 'Mike Ross',
            role: 'Safety Officer',
            company: 'Harbor Safety',
            email: 'mike@harborsafety.com',
            phone: '+1 (555) 9988',
            reportsTo: 'Joe Henderson',
            status: 'inactive',
        },
    ]

    const statusLabels = {
        active: 'Active',
        inactive: 'Inactive',
    }

    const [openMenuId, setOpenMenuId] = useState(null)
    const menuRefs = useRef({})

    const toggleMenu = (contactId) => {
        setOpenMenuId((prev) => (prev === contactId ? null : contactId))
    }

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (!event.target) return
            const currentMenu = openMenuId ? menuRefs.current[openMenuId] : null
            if (currentMenu && !currentMenu.contains(event.target)) {
                setOpenMenuId(null)
            }
        }
        if (openMenuId) {
            document.addEventListener('mousedown', handleOutsideClick)
        }
        return () => document.removeEventListener('mousedown', handleOutsideClick)
    }, [openMenuId])

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
                                <th>Role</th>
                                <th>Company</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Reports To</th>
                                <th>Status</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {contacts.map((contact) => (
                                <tr key={contact.id}>
                                    <td className="am-contact-name">{contact.role}</td>
                                    <td className="am-text-2">{contact.company}</td>
                                    <td className="am-contact-info">{contact.email}</td>
                                    <td className="am-contact-info">{contact.phone}</td>
                                    <td className="am-text-2">{contact.reportsTo}</td>
                                    <td>
                                        <span className={`am-status-pill is-${contact.status}`}>
                                            {statusLabels[contact.status] || contact.status}
                                        </span>
                                    </td>
                                    <td className="am-table-action">
                                        <div
                                            className="am-row-menu"
                                            ref={(node) => {
                                                if (node) {
                                                    menuRefs.current[contact.id] = node
                                                } else {
                                                    delete menuRefs.current[contact.id]
                                                }
                                            }}
                                        >
                                            <button
                                                type="button"
                                                className="am-icon-button"
                                                aria-label="Contact actions"
                                                aria-haspopup="menu"
                                                aria-expanded={openMenuId === contact.id}
                                                onClick={() => toggleMenu(contact.id)}
                                            >
                                                <MoreVertical size={16} />
                                            </button>
                                            {openMenuId === contact.id && (
                                                <div className="am-row-menu-dropdown" role="menu">
                                                    <button type="button" className="am-row-menu-item">
                                                        View
                                                    </button>
                                                    <button type="button" className="am-row-menu-item">
                                                        Edit
                                                    </button>
                                                </div>
                                            )}
                                        </div>
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
