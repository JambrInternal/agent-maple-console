import React, { useEffect, useRef, useState } from 'react'
import { Outlet, useNavigate, useParams } from 'react-router-dom'
import Sidebar from './Sidebar'
import Breadcrumbs from './Breadcrumbs'
import { useAuth } from '../contexts/AuthContext'

const Layout = () => {
    const { orgId } = useParams()
    const showSidebar = Boolean(orgId)
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [menuOpen, setMenuOpen] = useState(false)
    const menuRef = useRef(null)
    const isMockMode = import.meta.env.VITE_USE_MOCKS !== 'false'

    const getInitials = (value) => {
        if (!value) return 'AM'
        const parts = value.trim().split(/\s+/)
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    }

    const initials = getInitials(user?.name || user?.email)

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!menuRef.current || menuRef.current.contains(event.target)) return
            setMenuOpen(false)
        }
        if (menuOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [menuOpen])

    const handleLogout = async () => {
        await logout()
        navigate('/login')
    }

    return (
        <div className="am-app-shell">
            <header className="am-topbar">
                <div className="am-topbar-left">
                    <Breadcrumbs />
                </div>
                {isMockMode && (
                    <div className="am-mock-banner">
                        <span>Mock Mode</span>
                        <span className="am-mock-banner-cred">
                            Demo: jeremy@agentmaple.ca / password
                        </span>
                    </div>
                )}
                <div className="am-topbar-right" ref={menuRef}>
                    <button
                        type="button"
                        className="am-avatar"
                        aria-label="Account"
                        aria-haspopup="menu"
                        aria-expanded={menuOpen}
                        onClick={() => setMenuOpen((prev) => !prev)}
                    >
                        {initials}
                    </button>
                    {menuOpen && (
                        <div className="am-user-menu" role="menu">
                            <button type="button" className="am-user-menu-item" onClick={handleLogout}>
                                Log out
                            </button>
                        </div>
                    )}
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
            <div className="am-build-tag">
                Build {typeof window !== 'undefined' && window.__APP_COMMIT__ ? window.__APP_COMMIT__ : 'dev'}
            </div>
        </div>
    )
}

export default Layout
