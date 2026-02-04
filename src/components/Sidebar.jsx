import React from 'react'
import { NavLink, useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
    LayoutGrid,
    MessageSquare,
    AlertCircle,
    Database,
    Zap,
    Users,
    BarChart3,
    Settings,
    Shield,
    CreditCard,
    Activity,
    LogOut,
    User,
    Building2,
    Construction
} from 'lucide-react'

const Sidebar = () => {
    const { orgId, projId } = useParams()
    const navigate = useNavigate()
    const { logout } = useAuth()

    // Determine current section (Org vs Project)
    const isProjectContext = !!projId

    const orgNavItems = [
        { icon: LayoutGrid, label: 'Projects', path: `/${orgId}/projects` },
        { icon: Shield, label: 'Team', path: `/${orgId}/team` },
        { icon: CreditCard, label: 'Billing', path: `/${orgId}/billing` },
        { icon: Activity, label: 'Usage', path: `/${orgId}/usage` },
        { icon: Settings, label: 'Settings', path: `/${orgId}/settings` },
    ]

    const projectNavItems = [
        { icon: MessageSquare, label: 'Threads', path: `/${orgId}/${projId}/triage` },
        { icon: AlertCircle, label: 'Issues', path: `/${orgId}/${projId}/issues` },
        { icon: Zap, label: 'Tools & Skills', path: `/${orgId}/${projId}/config` },
        { icon: Database, label: 'Knowledge', path: `/${orgId}/${projId}/kb` },
        { icon: Users, label: 'Contacts', path: `/${orgId}/${projId}/people` },
        { icon: BarChart3, label: 'Insights', path: `/${orgId}/${projId}/data` },
    ]

    const currentNavItems = isProjectContext ? projectNavItems : orgNavItems
    const panelTitle = isProjectContext ? 'Project' : 'Organization'

    const handleLogout = async () => {
        await logout()
        navigate('/login')
    }

    return (
        <aside className="am-nav-panel">
            <div className="am-panel-icons">
                <button className="am-panel-icon active" title="Console" type="button">
                    <Building2 size={18} />
                </button>
                <button className="am-panel-icon" title="Settings" type="button">
                    <Settings size={18} />
                </button>
                <button className="am-panel-icon" title="Account" type="button">
                    <User size={18} />
                </button>
            </div>

            <div className="am-panel-header">
                {isProjectContext ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Construction size={16} className="am-text-2" />
                        <span>{projId.replace('_', ' ')}</span>
                    </div>
                ) : (
                    <span>{orgId?.replace('_', ' ') || 'Management'}</span>
                )}
            </div>
            <div className="am-panel-content">
                <h3 className="am-nav-group-title">{panelTitle}</h3>
                {currentNavItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `am-nav-item ${isActive ? 'active' : ''}`
                        }
                    >
                        <item.icon size={18} />
                        <span>{item.label}</span>
                    </NavLink>
                ))}

                <div style={{ marginTop: '2rem' }}>
                    <button className="am-nav-item" style={{ width: '100%' }} onClick={handleLogout}>
                        <LogOut size={18} />
                        <span>Log out</span>
                    </button>
                </div>
            </div>
        </aside>
    )
}

export default Sidebar
