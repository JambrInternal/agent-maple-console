import React from 'react'
import { Construction } from 'lucide-react'

const ComingSoon = ({ title, description }) => {
    return (
        <div className="am-page-content">
            <div className="am-coming-soon">
                <div className="am-card am-coming-soon-card">
                    <div className="am-coming-soon-icon">
                        <Construction size={24} />
                    </div>
                    <h1 className="am-page-title">{title}</h1>
                    <p className="am-text-2">
                        {description || `${title} is coming soon.`}
                    </p>
                </div>
            </div>
        </div>
    )
}

export default ComingSoon
