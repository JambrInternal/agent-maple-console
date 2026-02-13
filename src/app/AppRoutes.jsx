import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import AuthGuard from '../components/AuthGuard'
import Layout from '../components/Layout'
import BuildTag from '../components/BuildTag'
import AcceptInvitation from '../pages/AcceptInvitation'
import ComingSoon from '../pages/ComingSoon'
import Contacts from '../pages/Contacts'
import FeatureGateRoute from '../featureFlags/FeatureGateRoute'
import Knowledge from '../pages/Knowledge'
import Login from '../pages/Login'
import OrgSelection from '../pages/OrgSelection'
import OrgTeam from '../pages/OrgTeam'
import Personality from '../pages/Personality'
import Projects from '../pages/Projects'
import Voice from '../pages/Voice'

const AppRoutes = () => {
    return (
        <>
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/accept-invitation" element={<AcceptInvitation />} />
                <Route path="/user/accept-invitation" element={<AcceptInvitation />} />

                {/* Protected Console Routes */}
                <Route element={<AuthGuard><Layout /></AuthGuard>}>
                    <Route path="/" element={<OrgSelection />} />

                    {/* Organization Context */}
                    <Route path="/:orgId">
                        <Route index element={<Navigate to="projects" replace />} />

                        {/* Org Level Pages */}
                        <Route path="projects" element={<Projects />} />
                        <Route path="team" element={<OrgTeam />} />
                        <Route path="billing" element={<ComingSoon title="Billing" />} />
                        <Route path="usage" element={<ComingSoon title="Usage" />} />
                        <Route path="settings" element={<ComingSoon title="Organization Settings" />} />

                        {/* Project Context */}
                        <Route path=":projId">
                            <Route index element={<Navigate to="contacts" replace />} />
                            <Route path="threads" element={<ComingSoon title="Threads" />} />
                            <Route path="issues" element={<ComingSoon title="Issues" />} />
                            <Route path="tools-skills" element={<ComingSoon title="Skills & Tools" />} />
                            <Route path="knowledge" element={<Knowledge />} />
                            <Route path="contacts" element={<Contacts />} />
                            <Route path="insights" element={<ComingSoon title="Insights" />} />
                            <Route path="sms" element={<ComingSoon title="SMS" />} />
                            <Route path="voice" element={<Voice />} />
                            <Route
                                path="personality"
                                element={(
                                    <FeatureGateRoute
                                        flagKey="ff_personality_editor"
                                        title="Personality Unavailable"
                                        description="Personality is disabled for this deployment or rollout target."
                                    >
                                        <Personality />
                                    </FeatureGateRoute>
                                )}
                            />
                            <Route path="email" element={<ComingSoon title="Email" />} />
                        </Route>
                    </Route>
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <BuildTag />
        </>
    )
}

export default AppRoutes
