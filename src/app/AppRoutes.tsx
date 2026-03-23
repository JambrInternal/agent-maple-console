import React, { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import AuthGuard from '../components/AuthGuard/AuthGuard'
import Layout from '../components/Layout/Layout'
import BuildTag from '../components/BuildTag/BuildTag'
import FeatureGateRoute from '../featureFlags/FeatureGateRoute'

const AcceptInvitation = lazy(() => import('../pages/AcceptInvitation/AcceptInvitation'))
const ComingSoon = lazy(() => import('../pages/ComingSoon/ComingSoon'))
const Contacts = lazy(() => import('../pages/Contacts/Contacts'))
const Knowledge = lazy(() => import('../pages/Knowledge/Knowledge'))
const KnowledgeChunks = lazy(() => import('../pages/KnowledgeChunks/KnowledgeChunks'))
const Login = lazy(() => import('../pages/Login/Login'))
const OrgSelection = lazy(() => import('../pages/OrgSelection/OrgSelection'))
const OrgTeam = lazy(() => import('../pages/OrgTeam/OrgTeam'))
const Personality = lazy(() => import('../pages/Personality/Personality'))
const Projects = lazy(() => import('../pages/Projects/Projects'))
const Voice = lazy(() => import('../pages/Voice/Voice'))

const withRouteSuspense = (node: React.ReactNode) => (
    <Suspense fallback={null}>
        {node}
    </Suspense>
)

const buildBetaComingSoonRoute = (title, description) => (
    <FeatureGateRoute
        flagKey="ff_beta"
        title={`${title} Unavailable`}
        description={description}
    >
        {withRouteSuspense(<ComingSoon title={title} beta />)}
    </FeatureGateRoute>
)

const AppRoutes = () => {
    return (
        <>
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={withRouteSuspense(<Login />)} />
                <Route path="/accept-invitation" element={withRouteSuspense(<AcceptInvitation />)} />
                <Route path="/user/accept-invitation" element={withRouteSuspense(<AcceptInvitation />)} />

                {/* Protected Console Routes */}
                <Route element={<AuthGuard><Layout /></AuthGuard>}>
                    <Route path="/" element={withRouteSuspense(<OrgSelection />)} />

                    {/* Organization Context */}
                    <Route path="/:orgId">
                        <Route index element={<Navigate to="projects" replace />} />

                        {/* Org Level Pages */}
                        <Route path="projects" element={withRouteSuspense(<Projects />)} />
                        <Route path="team" element={withRouteSuspense(<OrgTeam />)} />
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
                            <Route path="knowledge" element={withRouteSuspense(<Knowledge />)} />
                            <Route path="datasources/:datasourceId/chunks" element={withRouteSuspense(<KnowledgeChunks />)} />
                            <Route path="contacts" element={withRouteSuspense(<Contacts />)} />
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
                            <Route path="voice" element={withRouteSuspense(<Voice />)} />
                            <Route path="personality" element={withRouteSuspense(<Personality />)} />
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
