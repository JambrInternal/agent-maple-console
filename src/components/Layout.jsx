import React from 'react'
import { Outlet, useParams } from 'react-router-dom'
import Sidebar from './Sidebar'
import Breadcrumbs from './Breadcrumbs'
import { useAuth } from '../contexts/AuthContext'

const Layout = () => {
    const { orgId } = useParams()
    const showSidebar = Boolean(orgId)
    const { user } = useAuth()

    const getInitials = (value) => {
        if (!value) return 'AM'
        const parts = value.trim().split(/\s+/)
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    }

    const initials = getInitials(user?.name || user?.email)

    return (
        <div className="am-app-shell">
            <header className="am-topbar">
                <div className="am-topbar-left">
                    <div className="am-logo-mark" aria-hidden="true" />
                    <span className="am-logo-text">Agent Maple</span>
                </div>
                <div className="am-topbar-center">
                    <Breadcrumbs />
                </div>
                <div className="am-topbar-right">
                    <div className="am-avatar" aria-label="Account">
                        {initials}
                    </div>
                </div>
            </header>

            <div className="am-shell-body">
                {showSidebar && <Sidebar />}
                <main className="am-main-layout">
                    <div className="am-page-content">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    )
}

export default Layout
