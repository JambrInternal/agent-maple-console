import React, { useEffect, useRef, useState } from 'react'
import { Outlet, useNavigate, useParams } from 'react-router-dom'
import Sidebar from './Sidebar'
import Breadcrumbs from './Breadcrumbs'
import { useAuth } from '../contexts/AuthContext'
import { getAdminMode } from '../utils/admin'

const Layout = () => {
    const { orgId } = useParams()
    const showSidebar = Boolean(orgId)
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [menuOpen, setMenuOpen] = useState(false)
    const menuRef = useRef(null)
    const isAdminMode = getAdminMode()

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

    useEffect(() => {
        if (orgId) {
            localStorage.setItem('am_tenant_id', orgId)
        }
    }, [orgId])

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
            {isAdminMode && (
                <div className="am-admin-banner" role="status" aria-live="polite">
                    SUPER ADMIN MODE
                </div>
            )}
        </div>
    )
}

export default Layout
