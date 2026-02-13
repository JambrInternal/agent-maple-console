import React, { useEffect, useMemo, useRef, useState } from 'react'
import posthog from 'posthog-js'
import { useAuth } from '../contexts/AuthContext'
import { getAppConfig } from '../config/runtimeConfig'
import { getAdminMode } from '../utils/admin'
import { FEATURE_FLAG_KEYS, type FeatureFlagKey } from './flagCatalog'
import { FeatureFlagContext } from './flagContext'
import {
    readCurrentOrganizationId,
    resolveDeploymentEnv,
    resolvePostHogEnabled,
    resolvePostHogHost,
    resolvePostHogTargetingMode,
    shouldAttemptGroupTargeting,
    type PostHogTargetingMode,
} from './featureFlagService'

const TENANT_POLL_INTERVAL_MS = 1000

type PostHogProviderProps = {
    children: React.ReactNode
}

const syncPostHogValues = (): Partial<Record<FeatureFlagKey, boolean>> => {
    const nextValues: Partial<Record<FeatureFlagKey, boolean>> = {}

    for (const flagKey of FEATURE_FLAG_KEYS) {
        const enabled = posthog.isFeatureEnabled(flagKey, { send_event: false })
        if (typeof enabled === 'boolean') {
            nextValues[flagKey] = enabled
        }
    }

    return nextValues
}

const PostHogFeatureFlagProvider = ({ children }: PostHogProviderProps) => {
    const appConfig = getAppConfig()
    const { user } = useAuth()
    const initRef = useRef(false)
    const previousUserIdRef = useRef<string | null>(null)
    const [autoGroupFallbackToPersonOnly, setAutoGroupFallbackToPersonOnly] = useState(false)
    const [posthogReady, setPosthogReady] = useState(false)
    const [posthogValues, setPosthogValues] = useState<Partial<Record<FeatureFlagKey, boolean>>>({})
    const [refreshVersion, setRefreshVersion] = useState(0)
    useEffect(() => {
        // Intentionally read refreshVersion to ensure this state is not write-only.
        // This avoids unused-state warnings without changing behavior.
        void refreshVersion
    }, [refreshVersion])
    const [organizationId, setOrganizationId] = useState<string | null>(() => readCurrentOrganizationId())

    const deploymentEnv = useMemo(
        () => resolveDeploymentEnv({
            appEnv: appConfig.APP_ENV,
            hostname: typeof window !== 'undefined' ? window.location.hostname : '',
        }),
        [appConfig.APP_ENV]
    )
    const posthogEnabled = resolvePostHogEnabled(appConfig.POSTHOG_ENABLED)
    const posthogHost = resolvePostHogHost(appConfig.POSTHOG_HOST)
    const configuredTargetingMode = resolvePostHogTargetingMode(appConfig.POSTHOG_TARGETING_MODE)
    const effectiveTargetingMode: PostHogTargetingMode = (
        configuredTargetingMode === 'auto' && autoGroupFallbackToPersonOnly
            ? 'person_only'
            : configuredTargetingMode
    )
    const shouldInitializePostHog = posthogEnabled && appConfig.POSTHOG_KEY !== ''

    useEffect(() => {
        const syncOrganizationId = () => {
            const nextValue = readCurrentOrganizationId()
            setOrganizationId((previous) => (previous === nextValue ? previous : nextValue))
        }

        syncOrganizationId()

        const intervalId = window.setInterval(syncOrganizationId, TENANT_POLL_INTERVAL_MS)
        const handleStorage = (event: StorageEvent) => {
            if (event.key === null || event.key === 'am_tenant_id') {
                syncOrganizationId()
            }
        }

        window.addEventListener('storage', handleStorage)
        return () => {
            window.clearInterval(intervalId)
            window.removeEventListener('storage', handleStorage)
        }
    }, [])

    useEffect(() => {
        if (!shouldInitializePostHog) {
            setPosthogReady(true)
            setPosthogValues({})
            setRefreshVersion((current) => current + 1)
            return
        }

        if (initRef.current) return
        initRef.current = true

        setPosthogReady(false)
        posthog.init(appConfig.POSTHOG_KEY, {
            api_host: posthogHost,
            autocapture: false,
            rageclick: false,
            capture_pageview: false,
            capture_pageleave: false,
            disable_session_recording: true,
            disable_surveys: true,
            disable_surveys_automatic_display: true,
            person_profiles: 'identified_only',
        })

        const unsubscribe = posthog.onFeatureFlags(() => {
            const values = syncPostHogValues()
            setPosthogValues(values)
            setPosthogReady(true)
            setRefreshVersion((current) => current + 1)
        })

        posthog.reloadFeatureFlags()

        return () => {
            unsubscribe()
        }
    }, [appConfig.POSTHOG_KEY, posthogHost, shouldInitializePostHog])

    useEffect(() => {
        if (!shouldInitializePostHog || !initRef.current) return

        const currentUserId = user?.id || null
        const previousUserId = previousUserIdRef.current

        if (previousUserId && !currentUserId) {
            posthog.reset()
            setPosthogValues({})
            setPosthogReady(false)
            posthog.reloadFeatureFlags()
            setRefreshVersion((current) => current + 1)
        }

        previousUserIdRef.current = currentUserId
    }, [shouldInitializePostHog, user?.id])

    useEffect(() => {
        if (!shouldInitializePostHog || !initRef.current || !user?.id) return

        const personProperties: Record<string, string | boolean> = {
            email: user.email || '',
            role: user.role || '',
            is_super_admin: getAdminMode(),
            deployment_env: deploymentEnv,
            organization_id: organizationId || '',
        }

        posthog.identify(user.id, personProperties)

        posthog.setPersonPropertiesForFlags(personProperties, false)

        const shouldUseGroups = shouldAttemptGroupTargeting({
            targetingMode: configuredTargetingMode,
            autoFallbackToPersonOnly: autoGroupFallbackToPersonOnly,
        })

        if (shouldUseGroups && organizationId) {
            try {
                posthog.group('organization', organizationId, {
                    organization_id: organizationId,
                    deployment_env: deploymentEnv,
                })
            } catch (error) {
                if (configuredTargetingMode === 'auto') {
                    setAutoGroupFallbackToPersonOnly(true)
                }
            }
        }

        posthog.reloadFeatureFlags()
    }, [
        autoGroupFallbackToPersonOnly,
        configuredTargetingMode,
        deploymentEnv,
        organizationId,
        shouldInitializePostHog,
        user?.email,
        user?.id,
        user?.role,
    ])

    return (
        <FeatureFlagContext.Provider
            value={{
                deploymentEnv,
                posthogEnabled: shouldInitializePostHog,
                posthogReady,
                posthogValues,
                targetingMode: effectiveTargetingMode,
                refreshVersion,
            }}
        >
            {children}
        </FeatureFlagContext.Provider>
    )
}

export default PostHogFeatureFlagProvider
