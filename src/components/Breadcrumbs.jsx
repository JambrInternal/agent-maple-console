import React from 'react'
import { Link, useParams, useLocation } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

const Breadcrumbs = () => {
    const { orgId, projId } = useParams()
    const { pathname } = useLocation()

    // Format ID to Label (e.g., iron_maple -> Iron Maple)
    const formatLabel = (str) => {
        if (!str) return ''
        return str.split(/[_ ]/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    }

    const pathSegments = pathname.split('/').filter(Boolean)

    // Determine the current view label
    let viewLabel = ''
    if (pathSegments.length > 0) {
        const lastPortion = pathSegments[pathSegments.length - 1]
        // Special case for triage -> Threads
        if (lastPortion === 'triage') viewLabel = 'Threads'
        else if (lastPortion === 'kb') viewLabel = 'Knowledge Base'
        else if (lastPortion === 'people') viewLabel = 'Contacts'
        else if (lastPortion === 'config') viewLabel = 'Tools & Skills'
        else if (lastPortion === 'data') viewLabel = 'Insights'
        else viewLabel = formatLabel(lastPortion)
    }

    return (
        <nav className="am-breadcrumbs" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
            <Link to="/" className="am-text-2" style={{ display: 'flex', alignItems: 'center' }}>
                <Home size={14} />
            </Link>

            {orgId && (
                <>
                    <ChevronRight size={14} className="am-text-2" style={{ opacity: 0.5 }} />
                    <Link to={`/${orgId}/projects`} className="am-text-2">
                        {formatLabel(orgId)}
                    </Link>
                </>
            )}

            {projId && (
                <>
                    <ChevronRight size={14} className="am-text-2" style={{ opacity: 0.5 }} />
                    <span className="am-text-2">
                        {formatLabel(projId)}
                    </span>
                </>
            )}

            {viewLabel && !projId && pathSegments.length > 1 && (
                <>
                    <ChevronRight size={14} className="am-text-2" style={{ opacity: 0.5 }} />
                    <span className="am-text-1" style={{ fontWeight: 600 }}>
                        {viewLabel}
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
