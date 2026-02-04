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
                                    <Route index element={<Navigate to="threads" replace />} />
                                    <Route path="threads" element={<ComingSoon title="Threads" />} />
                                    <Route path="issues" element={<ComingSoon title="Issues" />} />
                                    <Route path="tools-skills" element={<ComingSoon title="Skills & Tools" />} />
                                    <Route path="knowledge" element={<ComingSoon title="Knowledge" />} />
                                    <Route path="contacts" element={<Contacts />} />
                                    <Route path="insights" element={<ComingSoon title="Insights" />} />
                                    <Route path="sms" element={<ComingSoon title="SMS" />} />
                                    <Route path="voice" element={<ComingSoon title="Voice" />} />
                                    <Route path="email" element={<ComingSoon title="Email" />} />
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
