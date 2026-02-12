import React, { useEffect, useState } from 'react'
import { Link, useParams, useLocation } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { getOrganization } from '../services/organizations'
import { getProject } from '../services/projects'
import logger from '../utils/verboseLogger'

const Breadcrumbs = () => {
    const { orgId, projId } = useParams()
    const { pathname } = useLocation()
    const [orgName, setOrgName] = useState('')
    const [projectName, setProjectName] = useState('')
    const [theme, setTheme] = useState(() => {
        if (typeof document !== 'undefined') {
            return document.documentElement.dataset.theme || 'light';
        }
        return 'light';
    });

    useEffect(() => {
        const handler = () => {
            setTheme(document.documentElement.dataset.theme || 'light');
        };
        // Listen for theme changes (custom event)
        window.addEventListener('am-theme-change', handler);
        // Also listen for mutation of dataset.theme
        const observer = new MutationObserver(() => handler());
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
        return () => {
            window.removeEventListener('am-theme-change', handler);
            observer.disconnect();
        };
    }, []);

    // Format ID to Label (e.g., iron_maple -> Iron Maple)
    const formatLabel = (str) => {
        if (!str) return ''
        return str.split(/[_ ]/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    }

    const pathSegments = pathname.split('/').filter(Boolean)

    useEffect(() => {
        let isActive = true
        if (!orgId) {
            setOrgName('')
            return undefined
        }

        const cacheKey = `am_org_name_${orgId}`
        const cached = localStorage.getItem(cacheKey)
        if (cached) {
            setOrgName(cached)
            return undefined
        }

        const loadOrg = async () => {
            try {
                const org = await getOrganization(orgId)
                if (!isActive) return
                const name = org?.name || ''
                setOrgName(name)
                if (name) {
                    localStorage.setItem(cacheKey, name)
                }
            } catch (error) {
                logger.warn('Failed to load organization name:', error)
                if (isActive) setOrgName('')
            }
        }

        loadOrg()
        return () => {
            isActive = false
        }
    }, [orgId])

    useEffect(() => {
        let isActive = true
        if (!orgId || !projId) {
            setProjectName('')
            return undefined
        }

        const cacheKey = `am_project_name_${orgId}_${projId}`
        const cached = localStorage.getItem(cacheKey)
        if (cached) {
            setProjectName(cached)
            return undefined
        }

        const loadProject = async () => {
            try {
                const project = await getProject(projId)
                if (!isActive) return
                const name = project?.name || ''
                setProjectName(name)
                if (name) {
                    localStorage.setItem(cacheKey, name)
                }
            } catch (error) {
                logger.warn('Failed to load project name:', error)
                if (isActive) setProjectName('')
            }
        }

        loadProject()
        return () => {
            isActive = false
        }
    }, [orgId, projId])

    // Determine the current view label
    let viewLabel = ''
    if (pathSegments.length > 0) {
        const lastPortion = pathSegments[pathSegments.length - 1]
        if (lastPortion === 'threads') viewLabel = 'Threads'
        else if (lastPortion === 'issues') viewLabel = 'Issues'
        else if (lastPortion === 'knowledge') viewLabel = 'Knowledge'
        else if (lastPortion === 'contacts') viewLabel = 'Contacts'
        else if (lastPortion === 'tools-skills') viewLabel = 'Skills & Tools'
        else if (lastPortion === 'insights') viewLabel = 'Insights'
        else if (lastPortion === 'sms') viewLabel = 'SMS'
        else if (lastPortion === 'voice') viewLabel = 'Phone'
        else if (lastPortion === 'email') viewLabel = 'Email'
        else viewLabel = formatLabel(lastPortion)
    }

    return (
        <nav className="am-breadcrumbs" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
            <Link to="/" className="am-text-2" style={{ display: 'flex', alignItems: 'center' }}>
                <img
                    src={theme === 'dark' ? '/favicon/favicon-dark.svg' : '/favicon/favicon-light.svg'}
                    alt="Agent Maple"
                    className="am-brand-icon"
                />
            </Link>

            {orgId && (
                <>
                    <ChevronRight size={14} className="am-text-2" style={{ opacity: 0.5 }} />
                    <Link to={`/${orgId}/projects`} className="am-text-2">
                        {orgName || formatLabel(orgId)}
                    </Link>
                </>
            )}

            {projId && (
                <>
                    <ChevronRight size={14} className="am-text-2" style={{ opacity: 0.5 }} />
                    <span className="am-text-2">
                        {projectName || formatLabel(projId)}
                    </span>
                </>
            )}

            {viewLabel && projId && pathSegments.length > 2 && (
                <>
                    <ChevronRight size={14} className="am-text-2" style={{ opacity: 0.5 }} />
                    <span className="am-text-1" style={{ fontWeight: 600 }}>
                        {viewLabel}
                    </span>
                </>
            )}
        </nav>
    )
}

export default Breadcrumbs
