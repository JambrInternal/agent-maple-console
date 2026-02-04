import React, { useState } from 'react'
import { Phone, Copy, Check } from 'lucide-react'

const Voice = () => {
    const phoneNumberDisplay = '+1 (506) 502-3431'
    const phoneNumberRaw = '+15065023431'
    const [copied, setCopied] = useState(false)

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(phoneNumberRaw)
            setCopied(true)
            setTimeout(() => setCopied(false), 1500)
        } catch (error) {
            console.error('Failed to copy phone number', error)
        }
    }

    return (
        <div className="am-page-content">
            <div className="am-voice-container">
                <div className="am-page-header">
                    <div>
                        <h1 className="am-page-title">Chat on Phone</h1>
                        <p className="am-page-subtitle">
                            Simulate phone call scenarios with the AI agent.
                        </p>
                    </div>
                </div>

                <div className="am-voice-stack">
                    <section className="am-card am-voice-card">
                        <div className="am-voice-card-title">
                            <Phone size={18} />
                            <span>How to Make a Chat on Phone</span>
                        </div>
                        <p className="am-text-2">
                            Follow these steps to test your phone call scenario with the AI agent.
                        </p>
                        <ol className="am-step-list">
                            <li>
                                <span className="am-step-index">1</span>
                                <span>Use your phone to dial the number shown below</span>
                            </li>
                            <li>
                                <span className="am-step-index">2</span>
                                <span>When prompted, follow the instructions</span>
                            </li>
                            <li>
                                <span className="am-step-index">3</span>
                                <span>Start your conversation with the AI agent</span>
                            </li>
                        </ol>
                    </section>

                    <section className="am-card am-voice-card">
                        <div className="am-voice-card-title">
                            <Phone size={18} />
                            <span>Phone Number</span>
                        </div>
                        <p className="am-text-2">
                            Dial this number from your phone to connect to the AI agent.
                        </p>
                        <div className="am-phone-callout">
                            <div>
                                <div className="am-phone-number">{phoneNumberDisplay}</div>
                                <div className="am-phone-number-sub">{phoneNumberRaw}</div>
                            </div>
                            <button
                                type="button"
                                className="am-btn-secondary"
                                onClick={handleCopy}
                            >
                                {copied ? <Check size={16} /> : <Copy size={16} />}
                                <span>{copied ? 'Copied' : 'Copy'}</span>
                            </button>
                        </div>
                    </section>

                    <section className="am-card am-voice-callout">
                        <h2>Tips for Best Results</h2>
                        <ul className="am-callout-list">
                            <li>Speak clearly and at a moderate pace</li>
                            <li>Use a quiet environment to minimize background noise</li>
                            <li>Allow the AI agent to finish speaking before responding</li>
                            <li>The call will be recorded for analysis and training purposes</li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    )
}

export default Voice
