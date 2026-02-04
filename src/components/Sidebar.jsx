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
    Mail,
    Phone,
    Download,
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
        { icon: Shield, label: 'Team', path: `/${orgId}/team`, comingSoon: true },
        { icon: CreditCard, label: 'Billing', path: `/${orgId}/billing`, comingSoon: true },
        { icon: Activity, label: 'Usage', path: `/${orgId}/usage`, comingSoon: true },
        { icon: Settings, label: 'Organization Settings', path: `/${orgId}/settings`, comingSoon: true },
    ]

    const projectNavSections = [
        {
            title: 'Agent',
            items: [
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

    const orgName = formatLabel(orgId)
    const projectName = formatLabel(projId)
    const agentProfile = {
        org: orgName || 'Agent Maple',
        firstName: projectName || 'Project',
        lastName: 'Agent',
        title: 'Agentic AI',
        phone: '+15065023431',
        email: 'agent@agentmaple.ca',
    }

    const handleDownloadVCard = () => {
        const vcard = [
            'BEGIN:VCARD',
            'VERSION:3.0',
            `N:${agentProfile.lastName};${agentProfile.firstName}`,
            `FN:${agentProfile.firstName} ${agentProfile.lastName}`,
            `ORG:${agentProfile.org}`,
            `TITLE:${agentProfile.title}`,
            `TEL;TYPE=WORK,VOICE:${agentProfile.phone}`,
            `EMAIL:${agentProfile.email}`,
            'END:VCARD',
        ].join('\n')
        const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = 'agent-maple.vcf'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    }
    return (
        <aside className="am-nav-panel">
            <div className="am-panel-content">
                {isProjectContext && (
                    <button
                        type="button"
                        className="am-agent-card"
                        onClick={handleDownloadVCard}
                    >
                        <div className="am-agent-card-title">
                            <Phone size={16} />
                            <span>Agent Contact</span>
                        </div>
                        <div className="am-agent-card-name">
                            {agentProfile.firstName} {agentProfile.lastName}
                        </div>
                        <div className="am-agent-card-detail">{agentProfile.title}</div>
                        <div className="am-agent-card-detail">{agentProfile.phone}</div>
                        <div className="am-agent-card-detail">{agentProfile.email}</div>
                        <div className="am-agent-card-download" aria-hidden="true">
                            <Download size={14} />
                        </div>
                    </button>
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
