import React from 'react'
import { NavLink, useParams } from 'react-router-dom'
import { useApiQuery } from '../hooks/useApiQuery'
import { useFeatureFlag } from '../featureFlags/useFeatureFlag'
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
    const personalityEditorFlag = useFeatureFlag('ff_personality_editor')
    const billingPageFlag = useFeatureFlag('ff_billing_page')
    const usagePageFlag = useFeatureFlag('ff_usage_page')
    const orgSettingsPageFlag = useFeatureFlag('ff_org_settings_page')
    const threadsPageFlag = useFeatureFlag('ff_threads_page')
    const issuesPageFlag = useFeatureFlag('ff_issues_page')
    const toolsSkillsPageFlag = useFeatureFlag('ff_tools_skills_page')
    const insightsPageFlag = useFeatureFlag('ff_insights_page')
    const smsPageFlag = useFeatureFlag('ff_sms_page')
    const emailPageFlag = useFeatureFlag('ff_email_page')

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
        {
            icon: CreditCard,
            label: 'Billing',
            path: `/${orgId}/billing`,
            enabled: billingPageFlag.enabled,
            beta: true,
        },
        {
            icon: Activity,
            label: 'Usage',
            path: `/${orgId}/usage`,
            enabled: usagePageFlag.enabled,
            beta: true,
        },
        {
            icon: Settings,
            label: 'Organization Settings',
            path: `/${orgId}/settings`,
            enabled: orgSettingsPageFlag.enabled,
            beta: true,
        },
    ]

    const projectNavSections = [
        {
            title: 'Agent',
            items: [
                ...(personalityEditorFlag.enabled
                    ? [{ icon: Lightbulb, label: 'Personality', path: `/${orgId}/${projId}/personality` }]
                    : []),
                { icon: Users, label: 'Contacts', path: `/${orgId}/${projId}/contacts` },
                {
                    icon: MessageSquare,
                    label: 'SMS',
                    path: `/${orgId}/${projId}/sms`,
                    enabled: smsPageFlag.enabled,
                    beta: true,
                },
                { icon: Phone, label: 'Voice', path: `/${orgId}/${projId}/voice` },
                {
                    icon: Mail,
                    label: 'Email',
                    path: `/${orgId}/${projId}/email`,
                    enabled: emailPageFlag.enabled,
                    beta: true,
                },
                {
                    icon: Zap,
                    label: 'Skills & Tools',
                    path: `/${orgId}/${projId}/tools-skills`,
                    enabled: toolsSkillsPageFlag.enabled,
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
                    enabled: threadsPageFlag.enabled,
                    beta: true,
                },
                {
                    icon: AlertCircle,
                    label: 'Issues',
                    path: `/${orgId}/${projId}/issues`,
                    enabled: issuesPageFlag.enabled,
                    beta: true,
                },
                { icon: Database, label: 'Knowledge', path: `/${orgId}/${projId}/knowledge` },
                {
                    icon: BarChart3,
                    label: 'Insights',
                    path: `/${orgId}/${projId}/insights`,
                    enabled: insightsPageFlag.enabled,
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
