import React from 'react'
import { Phone as PhoneIcon, Copy, Info } from 'lucide-react'

const Phone = () => {
    const phoneNumber = '+1 (506) 800-8877'
    const sessionNumber = '0287'

    return (
        <div className="phone-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Phone</h1>
                    <p className="page-subtitle">Call Agent Maple using the Phone Number</p>
                </div>
            </div>

            <div className="cards-container">
                {/* Instruction Card */}
                <div className="info-card bg-gray">
                    <div className="card-header">
                        <PhoneIcon size={20} className="card-icon" />
                        <h3 className="card-title">How to Make a Chat on Phone</h3>
                    </div>
                    <p className="card-description">Follow these steps to test your phone call scenario with the AI agent.</p>
                    <div className="steps-list">
                        <div className="step-item">
                            <span className="step-number">1</span>
                            <span>Use your phone to dial the number shown below</span>
                        </div>
                        <div className="step-item">
                            <span className="step-number">2</span>
                            <span>When prompted, enter the session number</span>
                        </div>
                        <div className="step-item">
                            <span className="step-number">3</span>
                            <span>Start your conversation with the AI agent</span>
                        </div>
                    </div>
                </div>

                {/* Phone Number Card */}
                <div className="info-card">
                    <div className="card-header">
                        <PhoneIcon size={20} className="card-icon" />
                        <h3 className="card-title">Phone Number</h3>
                    </div>
                    <p className="card-description">Dial this number from your phone to connect to the AI agent.</p>
                    <div className="number-display">
                        <PhoneIcon size={24} className="display-icon" />
                        <div className="number-content">
                            <span className="large-number">{phoneNumber}</span>
                            <span className="sub-text">+15068008877</span>
                        </div>
                        <button className="copy-btn">
                            <Copy size={16} />
                            <span>Copy</span>
                        </button>
                    </div>
                </div>

                {/* Session Number Card */}
                <div className="info-card">
                    <h3 className="card-title">Session Number</h3>
                    <p className="card-description">Enter this number when prompted during the phone call</p>
                    <div className="number-display">
                        <div className="hashtag-icon">#</div>
                        <div className="number-content">
                            <span className="large-number">{sessionNumber}</span>
                            <span className="sub-text">Keep this number handy</span>
                        </div>
                        <button className="copy-btn">
                            <Copy size={16} />
                            <span>Copy</span>
                        </button>
                    </div>
                </div>

                {/* Tips Card */}
                <div className="info-card bg-blue">
                    <h3 className="card-title text-blue">Tips for Best Results</h3>
                    <ul className="tips-list">
                        <li>Speak clearly and at a moderate pace</li>
                        <li>Use a quiet environment to minimize background noise</li>
                        <li>Allow the AI agent to finish speaking before responding</li>
                        <li>The call will be recorded for analysis and training purposes</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default Phone
