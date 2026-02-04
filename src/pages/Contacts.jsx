import React, { useEffect, useRef, useState } from 'react'
import { MoreVertical, Plus, X } from 'lucide-react'

const Contacts = () => {
    const initialContacts = [
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

    const [contacts, setContacts] = useState(initialContacts)
    const [openMenuId, setOpenMenuId] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        role: '',
        company: '',
        email: '',
        phone: '',
        reportsTo: '',
        status: 'active',
    })
    const menuRefs = useRef({})

    const toggleMenu = (contactId) => {
        setOpenMenuId((prev) => (prev === contactId ? null : contactId))
    }

    const openModal = () => {
        setOpenMenuId(null)
        setFormData({
            name: '',
            role: '',
            company: '',
            email: '',
            phone: '',
            reportsTo: '',
            status: 'active',
        })
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
    }

    const handleChange = (event) => {
        const { name, value } = event.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        const newContact = {
            id: `contact_${Date.now()}`,
            name: formData.name.trim() || 'Unnamed',
            role: formData.role.trim() || '—',
            company: formData.company.trim() || '—',
            email: formData.email.trim() || '—',
            phone: formData.phone.trim() || '—',
            reportsTo: formData.reportsTo || '—',
            status: formData.status || 'active',
        }
        setContacts((prev) => [...prev, newContact])
        setIsModalOpen(false)
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

    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                setIsModalOpen(false)
            }
        }
        if (isModalOpen) {
            document.addEventListener('keydown', handleEscape)
        }
        return () => document.removeEventListener('keydown', handleEscape)
    }, [isModalOpen])

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
                    <button className="am-btn-primary" type="button" onClick={openModal}>
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
                                    <td className="am-contact-name">{contact.name}</td>
                                    <td className="am-contact-role">{contact.role}</td>
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

            {isModalOpen && (
                <div className="am-modal-backdrop" role="presentation" onClick={closeModal}>
                    <div
                        className="am-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="add-contact-title"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="am-modal-header">
                            <h2 className="am-modal-title" id="add-contact-title">
                                Add Contact
                            </h2>
                            <button type="button" className="am-icon-button" onClick={closeModal} aria-label="Close">
                                <X size={16} />
                            </button>
                        </div>
                        <form className="am-form" onSubmit={handleSubmit}>
                            <div className="am-form-grid">
                                <div className="am-form-field">
                                    <label className="am-label" htmlFor="contact-name">
                                        Name
                                    </label>
                                    <input
                                        id="contact-name"
                                        name="name"
                                        className="am-input"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Full name"
                                    />
                                </div>
                                <div className="am-form-field">
                                    <label className="am-label" htmlFor="contact-role">
                                        Role
                                    </label>
                                    <input
                                        id="contact-role"
                                        name="role"
                                        className="am-input"
                                        value={formData.role}
                                        onChange={handleChange}
                                        placeholder="Role or title"
                                    />
                                </div>
                                <div className="am-form-field">
                                    <label className="am-label" htmlFor="contact-company">
                                        Company
                                    </label>
                                    <input
                                        id="contact-company"
                                        name="company"
                                        className="am-input"
                                        value={formData.company}
                                        onChange={handleChange}
                                        placeholder="Organization or vendor"
                                    />
                                </div>
                                <div className="am-form-field">
                                    <label className="am-label" htmlFor="contact-email">
                                        Email
                                    </label>
                                    <input
                                        id="contact-email"
                                        name="email"
                                        type="email"
                                        className="am-input"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="name@company.com"
                                    />
                                </div>
                                <div className="am-form-field">
                                    <label className="am-label" htmlFor="contact-phone">
                                        Phone
                                    </label>
                                    <input
                                        id="contact-phone"
                                        name="phone"
                                        className="am-input"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="+1 (555) 123-4567"
                                    />
                                </div>
                                <div className="am-form-field">
                                    <label className="am-label" htmlFor="contact-reports">
                                        Reports To
                                    </label>
                                    <select
                                        id="contact-reports"
                                        name="reportsTo"
                                        className="am-input"
                                        value={formData.reportsTo}
                                        onChange={handleChange}
                                    >
                                        <option value="">None</option>
                                        {contacts.map((contact) => (
                                            <option key={contact.id} value={contact.name}>
                                                {contact.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="am-form-field">
                                    <label className="am-label" htmlFor="contact-status">
                                        Status
                                    </label>
                                    <select
                                        id="contact-status"
                                        name="status"
                                        className="am-input"
                                        value={formData.status}
                                        onChange={handleChange}
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                            <div className="am-modal-footer">
                                <button type="button" className="am-btn-secondary" onClick={closeModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="am-btn-primary">
                                    Save Contact
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Contacts
