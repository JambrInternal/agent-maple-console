import React from 'react'
import { NavLink, useParams } from 'react-router-dom'
import { useApiQuery } from '../hooks/useApiQuery'
import { getProjectAgentContact } from '../services/agentFacade'
import {
    LayoutGrid,
    MessageSquare,
    AlertCircle,
    Database,
    Zap,
    Users,
    BarChart3,
    Mail,
    Phone,
    Lightbulb,
    Settings,
    Shield,
    CreditCard,
    Activity
} from 'lucide-react'

const Sidebar = () => {
    const { orgId, projId } = useParams()

    // Determine current section (Org vs Project)
    const isProjectContext = !!projId

    const formatLabel = (value) => {
        if (!value) return ''
        return value
            .split(/[_-]/)
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
    }

    const orgNavItems = [
        { icon: LayoutGrid, label: 'Projects', path: `/${orgId}/projects` },
        { icon: Shield, label: 'Team', path: `/${orgId}/team` },
        { icon: CreditCard, label: 'Billing', path: `/${orgId}/billing`, comingSoon: true },
        { icon: Activity, label: 'Usage', path: `/${orgId}/usage`, comingSoon: true },
        { icon: Settings, label: 'Organization Settings', path: `/${orgId}/settings`, comingSoon: true },
    ]

    const projectNavSections = [
        {
            title: 'Agent',
            items: [
                { icon: Lightbulb, label: 'Personality', path: `/${orgId}/${projId}/personality` },
                { icon: Users, label: 'Contacts', path: `/${orgId}/${projId}/contacts` },
                { icon: MessageSquare, label: 'SMS', path: `/${orgId}/${projId}/sms`, comingSoon: true },
                { icon: Phone, label: 'Voice', path: `/${orgId}/${projId}/voice` },
                { icon: Mail, label: 'Email', path: `/${orgId}/${projId}/email`, comingSoon: true },
                { icon: Zap, label: 'Skills & Tools', path: `/${orgId}/${projId}/tools-skills`, comingSoon: true },
            ],
        },
        {
            title: 'Data',
            items: [
                { icon: MessageSquare, label: 'Threads', path: `/${orgId}/${projId}/threads`, comingSoon: true },
                { icon: AlertCircle, label: 'Issues', path: `/${orgId}/${projId}/issues`, comingSoon: true },
                { icon: Database, label: 'Knowledge', path: `/${orgId}/${projId}/knowledge` },
                { icon: BarChart3, label: 'Insights', path: `/${orgId}/${projId}/insights`, comingSoon: true },
            ],
        },
    ]

    const currentNavItems = isProjectContext ? [] : orgNavItems

    const projectName = formatLabel(projId)
    const {
        data: projectAgentContact,
        isLoading: isProjectAgentLoading,
    } = useApiQuery(
        orgId && projId
            ? ['projectAgentContact', orgId, projId]
            : ['projectAgentContact', 'none'],
        () => (
            orgId && projId
                ? getProjectAgentContact({ organizationId: orgId, projectId: projId })
                : Promise.resolve({ firstName: null, phoneNumber: null, source: 'unconfigured' })
        ),
        { enabled: !!orgId && !!projId }
    )
    const agentFirstName = projectAgentContact?.firstName || projectName || 'Project'
    const agentContactDetail = isProjectAgentLoading
        ? 'Loading contact...'
        : (projectAgentContact?.phoneNumber || 'Not configured')

    return (
        <aside className="am-nav-panel">
            <div className="am-panel-content">
                {isProjectContext && (
                    <div className="am-agent-card" aria-disabled="true">
                        <div className="am-agent-card-title">
                            <Phone size={16} />
                            <span>Agent Contact</span>
                        </div>
                        <div className="am-agent-card-name">
                            {agentFirstName} Agent
                        </div>
                        <div className="am-agent-card-detail">{agentContactDetail}</div>
                    </div>
                )}

                {!isProjectContext && <h3 className="am-nav-group-title">Organization</h3>}
                {!isProjectContext && currentNavItems.map((item) => {
                    if (item.comingSoon) {
                        return (
                            <div
                                key={item.path}
                                className="am-nav-item am-nav-item--disabled"
                                title="Coming soon"
                            >
                                <item.icon size={18} />
                                <span>{item.label}</span>
                            </div>
                        )
                    }

                    return (
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
                    )
                })}

                {isProjectContext && projectNavSections.map((section) => (
                    <div key={section.title}>
                        <h3 className="am-nav-group-title">{section.title}</h3>
                        {section.items.map((item) => {
                            if (item.comingSoon) {
                                return (
                                    <div
                                        key={item.path}
                                        className="am-nav-item am-nav-item--disabled"
                                        title="Coming soon"
                                    >
                                        <item.icon size={18} />
                                        <span>{item.label}</span>
                                    </div>
                                )
                            }

                            return (
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
                            )
                        })}
                    </div>
                ))}
            </div>
        </aside>
    )
}

export default Sidebar
