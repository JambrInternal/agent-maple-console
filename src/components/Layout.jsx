import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Breadcrumbs from './Breadcrumbs'

const Layout = () => {
    return (
        <div className="am-app-shell">
            <Sidebar />
            <main className="am-main-layout">
                <header className="am-header">
                    <Breadcrumbs />
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--am-bg-1)',
                            border: '1px solid var(--am-border)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '9px',
                            fontWeight: 700,
                            color: 'var(--am-text-2)'
                        }}>
                            JL
                        </div>
                    </div>
                </header>
                <div className="am-page-content">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}

export default Layout
