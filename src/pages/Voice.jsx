import React from 'react'
import { Phone } from 'lucide-react'

const Voice = () => {
    return (
        <div className="am-page-content">
            <div className="am-voice-container">
                <div className="am-page-header">
                    <div>
                        <h1 className="am-page-title">Chat on Phone</h1>
                        <p className="am-page-subtitle">
                            Phone sessions are created by the backend per project.
                        </p>
                    </div>
                </div>

                <div className="am-voice-stack">
                    <section className="am-card am-voice-card">
                        <div className="am-voice-card-title">
                            <Phone size={18} />
                            <span>Phone Session Not Configured</span>
                        </div>
                        <p className="am-text-2">
                            A phone session must be created by the backend before a number is available.
                        </p>
                        <ol className="am-step-list">
                            <li>
                                <span className="am-step-index">1</span>
                                <span>Configure a conversation template for this project</span>
                            </li>
                            <li>
                                <span className="am-step-index">2</span>
                                <span>Create a call session in the backend</span>
                            </li>
                            <li>
                                <span className="am-step-index">3</span>
                                <span>Return here to see the assigned phone number</span>
                            </li>
                        </ol>
                    </section>
                </div>
            </div>
        </div>
    )
}

export default Voice
