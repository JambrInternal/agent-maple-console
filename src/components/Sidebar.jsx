import React from 'react'
import { NavLink, useParams } from 'react-router-dom'
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
    Construction
} from 'lucide-react'

const Sidebar = () => {
    const { orgId, projId } = useParams()

    // Determine current section (Org vs Project)
    const isProjectContext = !!projId

    const orgNavItems = [
        { icon: LayoutGrid, label: 'Projects', path: `/${orgId}/projects` },
        { icon: Shield, label: 'Team', path: `/${orgId}/team` },
        { icon: CreditCard, label: 'Billing', path: `/${orgId}/billing` },
        { icon: Activity, label: 'Usage', path: `/${orgId}/usage` },
        { icon: Settings, label: 'Organization Settings', path: `/${orgId}/settings` },
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

    return (
        <aside className="am-nav-panel">
            <div className="am-panel-content">
                {isProjectContext && (
                    <div className="am-panel-title">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Construction size={16} className="am-text-2" />
                            <span>{projId.replace('_', ' ')}</span>
                        </div>
                    </div>
                )}

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
            </div>
        </aside>
    )
}

export default Sidebar
