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
import KnowledgeChunks from '../pages/KnowledgeChunks'
import Login from '../pages/Login'
import OrgSelection from '../pages/OrgSelection'
import OrgTeam from '../pages/OrgTeam'
import Personality from '../pages/Personality'
import Projects from '../pages/Projects'
import Voice from '../pages/Voice'

const buildBetaComingSoonRoute = (title, description) => (
    <FeatureGateRoute
        flagKey="ff_beta"
        title={`${title} Unavailable`}
        description={description}
    >
        <ComingSoon title={title} beta />
    </FeatureGateRoute>
)

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
                        <Route
                            path="billing"
                            element={buildBetaComingSoonRoute(
                                'Billing',
                                'Billing is disabled for this deployment or rollout target.'
                            )}
                        />
                        <Route
                            path="usage"
                            element={buildBetaComingSoonRoute(
                                'Usage',
                                'Usage is disabled for this deployment or rollout target.'
                            )}
                        />
                        <Route
                            path="settings"
                            element={buildBetaComingSoonRoute(
                                'Organization Settings',
                                'Organization Settings is disabled for this deployment or rollout target.'
                            )}
                        />

                        {/* Project Context */}
                        <Route path=":projId">
                            <Route index element={<Navigate to="contacts" replace />} />
                            <Route
                                path="threads"
                                element={buildBetaComingSoonRoute(
                                    'Threads',
                                    'Threads is disabled for this deployment or rollout target.'
                                )}
                            />
                            <Route
                                path="issues"
                                element={buildBetaComingSoonRoute(
                                    'Issues',
                                    'Issues is disabled for this deployment or rollout target.'
                                )}
                            />
                            <Route
                                path="tools-skills"
                                element={buildBetaComingSoonRoute(
                                    'Skills & Tools',
                                    'Skills & Tools is disabled for this deployment or rollout target.'
                                )}
                            />
                            <Route path="knowledge" element={<Knowledge />} />
                            <Route path="datasources/:datasourceId/chunks" element={<KnowledgeChunks />} />
                            <Route path="contacts" element={<Contacts />} />
                            <Route
                                path="insights"
                                element={buildBetaComingSoonRoute(
                                    'Insights',
                                    'Insights is disabled for this deployment or rollout target.'
                                )}
                            />
                            <Route
                                path="sms"
                                element={buildBetaComingSoonRoute(
                                    'SMS',
                                    'SMS is disabled for this deployment or rollout target.'
                                )}
                            />
                            <Route path="voice" element={<Voice />} />
                            <Route path="personality" element={<Personality />} />
                            <Route
                                path="email"
                                element={buildBetaComingSoonRoute(
                                    'Email',
                                    'Email is disabled for this deployment or rollout target.'
                                )}
                            />
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
