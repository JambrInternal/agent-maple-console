import React from 'react'
import { NavLink, useParams } from 'react-router-dom'
import { useApiQuery } from '../../hooks/useApiQuery'
import { useFeatureFlag } from '../../featureFlags/useFeatureFlag'
import { getProjectAgentContact } from '../../services/agentFacade'
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
    const betaFlag = useFeatureFlag('ff_beta')

    // Determine current section (Org vs Project)
    const isProjectContext = !!projId

    const orgNavItems = [
        { icon: LayoutGrid, label: 'Projects', path: `/${orgId}/projects` },
        { icon: Shield, label: 'Team', path: `/${orgId}/team` },
        {
            icon: CreditCard,
            label: 'Billing',
            path: `/${orgId}/billing`,
            enabled: betaFlag.enabled,
            beta: true,
        },
        {
            icon: Activity,
            label: 'Usage',
            path: `/${orgId}/usage`,
            enabled: betaFlag.enabled,
            beta: true,
        },
        {
            icon: Settings,
            label: 'Organization Settings',
            path: `/${orgId}/settings`,
            enabled: betaFlag.enabled,
            beta: true,
        },
    ]

    const projectNavSections = [
        {
            title: 'Agent',
            items: [
                { icon: Lightbulb, label: 'Personality', path: `/${orgId}/${projId}/personality` },
                { icon: Users, label: 'Contacts', path: `/${orgId}/${projId}/contacts` },
                {
                    icon: MessageSquare,
                    label: 'SMS',
                    path: `/${orgId}/${projId}/sms`,
                    enabled: betaFlag.enabled,
                    beta: true,
                },
                { icon: Phone, label: 'Voice', path: `/${orgId}/${projId}/voice` },
                {
                    icon: Mail,
                    label: 'Email',
                    path: `/${orgId}/${projId}/email`,
                    enabled: betaFlag.enabled,
                    beta: true,
                },
                {
                    icon: Zap,
                    label: 'Skills & Tools',
                    path: `/${orgId}/${projId}/tools-skills`,
                    enabled: betaFlag.enabled,
                    beta: true,
                },
            ],
        },
        {
            title: 'Data',
            items: [
                {
                    icon: MessageSquare,
                    label: 'Threads',
                    path: `/${orgId}/${projId}/threads`,
                    enabled: betaFlag.enabled,
                    beta: true,
                },
                {
                    icon: AlertCircle,
                    label: 'Issues',
                    path: `/${orgId}/${projId}/issues`,
                    enabled: betaFlag.enabled,
                    beta: true,
                },
                { icon: Database, label: 'Knowledge', path: `/${orgId}/${projId}/knowledge` },
                {
                    icon: BarChart3,
                    label: 'Insights',
                    path: `/${orgId}/${projId}/insights`,
                    enabled: betaFlag.enabled,
                    beta: true,
                },
            ],
        },
    ]

    const currentNavItems = isProjectContext ? [] : orgNavItems

    const renderNavItem = (item) => {
        if (item.enabled === false) return null

        return (
            <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                    `am-nav-item ${isActive ? 'active' : ''}`
                }
            >
                <item.icon size={18} />
                <span className="am-nav-item-label">{item.label}</span>
                {item.beta ? (
                    <span className="am-nav-beta-badge" title="Beta" aria-hidden="true">
                        β
                    </span>
                ) : null}
            </NavLink>
        )
    }

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
    const agentFirstName = projectAgentContact?.firstName || null
    const agentContactDetail = projectAgentContact?.phoneNumber || null

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
                            {isProjectAgentLoading || !agentFirstName
                                ? <span className="am-skeleton am-skeleton-text" />
                                : `${agentFirstName} Agent`}
                        </div>
                        <div className="am-agent-card-detail">
                            {isProjectAgentLoading
                                ? <span className="am-skeleton am-skeleton-text-sm" />
                                : (agentContactDetail || 'Not configured')}
                        </div>
                    </div>
                )}

                {!isProjectContext && <h3 className="am-nav-group-title">Organization</h3>}
                {!isProjectContext && currentNavItems.map((item) => renderNavItem(item))}

                {isProjectContext && projectNavSections.map((section) => (
                    <div key={section.title}>
                        <h3 className="am-nav-group-title">{section.title}</h3>
                        {section.items.map((item) => renderNavItem(item))}
                    </div>
                ))}
            </div>
        </aside>
    )
}

export default Sidebar
