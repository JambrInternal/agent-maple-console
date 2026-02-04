import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import AuthGuard from './components/AuthGuard'
import Layout from './components/Layout'
import BuildTag from './components/BuildTag'

// Pages
import Login from './pages/Login'
import OrgSelection from './pages/OrgSelection'
import Projects from './pages/Projects'
import Contacts from './pages/Contacts'
import ComingSoon from './pages/ComingSoon'

// Simple Placeholders for the new hierarchy
const ThreadsMonitor = () => <h1 className="am-text-1">Threads</h1>
const IssuesDashboard = () => <h1 className="am-text-1">Issues</h1>
const ToolsSkills = () => <h1 className="am-text-1">Tools & Skills</h1>
const KnowledgeBase = () => <h1 className="am-text-1">Knowledge Base</h1>
const Insights = () => <h1 className="am-text-1">Insights</h1>

function App() {
    return (
        <AuthProvider>
            <Router>
                <>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/login" element={<Login />} />

                        {/* Protected Console Routes */}
                        <Route element={<AuthGuard><Layout /></AuthGuard>}>
                            <Route path="/" element={<OrgSelection />} />

                            {/* Organization Context */}
                            <Route path="/:orgId">
                                <Route index element={<Navigate to="projects" replace />} />

                                {/* Org Level Pages */}
                                <Route path="projects" element={<Projects />} />
                                <Route
                                    path="team"
                                    element={<ComingSoon title="Team" />}
                                />
                                <Route
                                    path="billing"
                                    element={<ComingSoon title="Billing" />}
                                />
                                <Route
                                    path="usage"
                                    element={<ComingSoon title="Usage" />}
                                />
                                <Route
                                    path="settings"
                                    element={<ComingSoon title="Organization Settings" />}
                                />

                                {/* Project Context */}
                                <Route path=":projId">
                                    <Route index element={<Navigate to="triage" replace />} />
                                    <Route path="triage" element={<ThreadsMonitor />} />
                                    <Route path="issues" element={<IssuesDashboard />} />
                                    <Route path="config" element={<ToolsSkills />} />
                                    <Route path="kb" element={<KnowledgeBase />} />
                                    <Route path="people" element={<Contacts />} />
                                    <Route path="data" element={<Insights />} />
                                </Route>
                            </Route>
                        </Route>

                        {/* Fallback */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                    <BuildTag />
                </>
            </Router>
        </AuthProvider>
    )
}

export default App
