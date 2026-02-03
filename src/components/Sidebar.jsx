import React from 'react'
import { NavLink } from 'react-router-dom'
import {
    Users,
    Phone,
    MessageSquare,
    Mail,
    Calendar,
    MessageCircle,
    AlertCircle,
    Database,
    Brain,
    Lightbulb,
    LogOut,
    User,
    ChevronLeft,
    ChevronRight
} from 'lucide-react'

const Sidebar = ({ isCollapsed, toggleSidebar }) => {
    const menuGroups = [
        {
            title: 'Agent',
            items: [
                { icon: Users, label: 'Contacts', path: '/contacts' },
                { icon: Phone, label: 'Phone', path: '/phone' },
                { icon: MessageSquare, label: 'SMS', path: '/sms' },
                { icon: Mail, label: 'Email', path: '/email' },
                { icon: Calendar, label: 'Calendar', path: '/calendar' },
                { icon: MessageCircle, label: 'Threads', path: '/threads' },
                { icon: AlertCircle, label: 'Issues', path: '/issues' },
                { icon: Database, label: 'Data Sources', path: '/data-sources' },
            ]
        },
        {
            title: 'Analytics',
            items: [
                { icon: Brain, label: 'Knowledge', path: '/knowledge' },
                { icon: Lightbulb, label: 'Insights', path: '/insights' },
            ]
        }
    ]

    return (
        <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            {/* Brand Header */}
            <div className="sidebar-header">
                <div className="brand-logo">
                    {isCollapsed ? (
                        <img src="/src/assets/logo-icon.png" alt="AM" className="logo-icon" />
                    ) : (
                        <img src="/src/assets/logo.png" alt="Agent Maple" className="logo-image" />
                    )}
                </div>
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav">
                {menuGroups.map((group, index) => (
                    <div key={index} className="nav-group">
                        {!isCollapsed && <h3 className="group-title">{group.title}</h3>}
                        {group.items.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `nav-item ${isActive ? 'active' : ''}`
                                }
                                title={isCollapsed ? item.label : ''}
                            >
                                <item.icon size={20} className="nav-icon" />
                                {!isCollapsed && <span className="nav-label">{item.label}</span>}
                            </NavLink>
                        ))}
                    </div>
                ))}
            </nav>

            {/* Footer Toggle & User */}
            <div className="sidebar-footer">
                <button className="toggle-btn" onClick={toggleSidebar}>
                    {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>

                {!isCollapsed && (
                    <div className="user-profile">
                        <div className="user-avatar">
                            <User size={16} />
                        </div>
                        <div className="user-info">
                            <span className="user-name">Jeremy Legere</span>
                            <span className="user-org">Iron Maple</span>
                        </div>
                    </div>
                )}

                <button className="logout-btn">
                    <LogOut size={16} />
                    {!isCollapsed && <span>Log out</span>}
                </button>
            </div>
        </aside>
    )
}

export default Sidebar
