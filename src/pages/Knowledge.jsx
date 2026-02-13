import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { UploadCloud } from 'lucide-react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import {
    completeKnowledgeCloudCallback,
    getKnowledgeCloudAuthorizeUrl,
    getKnowledgeSources,
    listKnowledgeCloudTokens,
    syncKnowledgeGoogleDrive,
    syncKnowledgeSharePoint,
    uploadKnowledgeSource,
} from '../services/knowledge'
import { useApiQuery } from '../hooks/useApiQuery'
import QueryError from '../components/QueryError';
import KnowledgeTable from '../features/knowledge/components/KnowledgeTable'
import { withStatus } from '../utils/errors'

const OAUTH_STATE_STORAGE_PREFIX = 'am_knowledge_oauth_state'
const CLOUD_PROVIDER_META = {
    google_drive: { label: 'Google Drive' },
    sharepoint: { label: 'SharePoint' },
}

const buildOAuthStateStorageKey = (orgId, projId, provider) =>
    `${OAUTH_STATE_STORAGE_PREFIX}:${orgId || 'none'}:${projId || 'none'}:${provider}`

const isCloudProvider = (provider) => provider === 'google_drive' || provider === 'sharepoint'
const getCloudProviderLabel = (provider) => CLOUD_PROVIDER_META[provider]?.label || provider

const buildOAuthRedirectUri = (pathname, provider) => {
    const redirectUrl = new URL(pathname, window.location.origin)
    redirectUrl.searchParams.set('oauth_provider', provider)
    return redirectUrl.toString()
}

const Knowledge = () => {
    const fileInputRef = useRef(null)
    const handledOAuthSearchRef = useRef('')
    const { orgId, projId } = useParams()
    const location = useLocation()
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const [isUploading, setIsUploading] = useState(false)
    const [connectingProvider, setConnectingProvider] = useState('')
    const [isHandlingOAuthCallback, setIsHandlingOAuthCallback] = useState(false)
    const [uploadSummary, setUploadSummary] = useState(null)
    const [cloudMessage, setCloudMessage] = useState('')
    const [cloudError, setCloudError] = useState('')

    const scope = useMemo(
        () => (
            orgId && projId
                ? { organizationId: orgId, projectId: projId }
                : null
        ),
        [orgId, projId]
    )
    const knowledgeQueryKey = useMemo(
        () => (orgId && projId ? ['knowledgeSources', orgId, projId] : ['knowledgeSources', 'none']),
        [orgId, projId]
    )
    const cloudTokensQueryKey = useMemo(
        () => (orgId && projId ? ['knowledgeCloudTokens', orgId, projId] : ['knowledgeCloudTokens', 'none']),
        [orgId, projId]
    )

    const {
        data: sources = [],
        isLoading: loading,
        error,
        refetch
    } = useApiQuery(
        knowledgeQueryKey,
        () => (
            scope
                ? getKnowledgeSources(scope)
                : Promise.resolve([])
        ),
        { enabled: !!orgId && !!projId }
    )
    const {
        data: cloudTokens = [],
        error: cloudTokensError,
    } = useApiQuery(
        cloudTokensQueryKey,
        () => (
            scope
                ? listKnowledgeCloudTokens(scope)
                : Promise.resolve([])
        ),
        { enabled: !!orgId && !!projId }
    )
    const rows = useMemo(() => sources, [sources])
    const connectedProviders = useMemo(
        () => new Set(cloudTokens.map((token) => (token.provider || '').toLowerCase())),
        [cloudTokens]
    )

    const refreshKnowledgeData = useCallback(
        async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: knowledgeQueryKey }),
                queryClient.invalidateQueries({ queryKey: cloudTokensQueryKey }),
            ])
        },
        [cloudTokensQueryKey, knowledgeQueryKey, queryClient]
    )

    const handleUploadButtonClick = () => {
        fileInputRef.current?.click()
    }

    const handleFilesSelected = async (event) => {
        const files = Array.from(event.target.files || [])
        event.target.value = ''
        if (!scope || files.length === 0) return

        setUploadSummary(null)
        setCloudError('')
        setCloudMessage('')
        setIsUploading(true)

        try {
            let successCount = 0
            const failures = []

            for (const file of files) {
                try {
                    await uploadKnowledgeSource(scope, file)
                    successCount += 1
                } catch (uploadError) {
                    failures.push(withStatus(`${file.name}: upload failed.`, uploadError))
                }
            }

            await refreshKnowledgeData()
            setUploadSummary({
                successCount,
                failures,
            })
        } catch (uploadFlowError) {
            setUploadSummary({
                successCount: 0,
                failures: [withStatus('Failed to refresh knowledge sources after upload.', uploadFlowError)],
            })
        } finally {
            setIsUploading(false)
        }
    }

    const startCloudConnect = async (provider) => {
        if (!scope || !isCloudProvider(provider)) return

        setUploadSummary(null)
        setCloudMessage('')
        setCloudError('')
        setConnectingProvider(provider)

        try {
            const redirectUri = buildOAuthRedirectUri(location.pathname, provider)
            const authorizeResult = await getKnowledgeCloudAuthorizeUrl(scope, provider, redirectUri)
            if (!authorizeResult.authorizationUrl) {
                throw new Error('Authorization URL was empty')
            }

            if (authorizeResult.state) {
                sessionStorage.setItem(
                    buildOAuthStateStorageKey(orgId, projId, provider),
                    authorizeResult.state
                )
            }
            window.open(authorizeResult.authorizationUrl, '_self')
        } catch (connectError) {
            setCloudError(withStatus(`Failed to start ${getCloudProviderLabel(provider)} connection.`, connectError))
        } finally {
            setConnectingProvider('')
        }
    }

    useEffect(() => {
        if (!scope) return

        const params = new URLSearchParams(location.search)
        const provider = params.get('oauth_provider')
        if (!provider) {
            handledOAuthSearchRef.current = ''
            return
        }

        if (handledOAuthSearchRef.current === location.search) {
            return
        }
        handledOAuthSearchRef.current = location.search

        const clearCallbackParams = () => {
            navigate(location.pathname, { replace: true })
        }

        if (!isCloudProvider(provider)) {
            setCloudMessage('')
            setCloudError('Unknown cloud provider in OAuth callback.')
            clearCallbackParams()
            return
        }

        const callbackError = params.get('error')
        if (callbackError) {
            const callbackErrorDescription = params.get('error_description')
            const message = callbackErrorDescription || callbackError
            setCloudMessage('')
            setCloudError(`Failed to connect ${getCloudProviderLabel(provider)}: ${message}`)
            clearCallbackParams()
            return
        }

        const code = params.get('code')
        if (!code) {
            setCloudMessage('')
            setCloudError(`Missing OAuth code for ${getCloudProviderLabel(provider)} callback.`)
            clearCallbackParams()
            return
        }

        const returnedState = params.get('state')
        const stateStorageKey = buildOAuthStateStorageKey(orgId, projId, provider)
        const expectedState = sessionStorage.getItem(stateStorageKey)
        if (expectedState !== null) {
            if (!returnedState || returnedState !== expectedState) {
                sessionStorage.removeItem(stateStorageKey)
                setCloudMessage('')
                setCloudError(`OAuth state mismatch for ${getCloudProviderLabel(provider)}. Please reconnect.`)
                clearCallbackParams()
                return
            }
        }
        sessionStorage.removeItem(stateStorageKey)

        let cancelled = false
        const finalizeOAuthFlow = async () => {
            setUploadSummary(null)
            setCloudError('')
            setCloudMessage(`Finalizing ${getCloudProviderLabel(provider)} connection...`)
            setIsHandlingOAuthCallback(true)

            try {
                const redirectUri = buildOAuthRedirectUri(location.pathname, provider)
                await completeKnowledgeCloudCallback(scope, provider, code, redirectUri)
                if (provider === 'google_drive') {
                    await syncKnowledgeGoogleDrive(scope, { recursive: false })
                } else {
                    await syncKnowledgeSharePoint(scope, { recursive: false })
                }
                await refreshKnowledgeData()

                if (!cancelled) {
                    setCloudMessage(`${getCloudProviderLabel(provider)} connected. Root sync started.`)
                    setCloudError('')
                }
            } catch (oauthError) {
                if (!cancelled) {
                    setCloudMessage('')
                    setCloudError(withStatus(`Failed to finish ${getCloudProviderLabel(provider)} connection.`, oauthError))
                }
            } finally {
                if (!cancelled) {
                    setIsHandlingOAuthCallback(false)
                    clearCallbackParams()
                }
            }
        }

        finalizeOAuthFlow()
        return () => {
            cancelled = true
        }
    }, [location.pathname, location.search, navigate, orgId, projId, refreshKnowledgeData, scope])

    return (
        <div className="am-page-content">
            <div className="am-knowledge-container">
                <div className="am-page-header">
                    <div>
                        <h1 className="am-page-title">Knowledge Base</h1>
                        <p className="am-page-subtitle">
                            Manage your uploaded files and data sources for this project.
                        </p>
                    </div>
                    <button
                        className="am-btn-primary"
                        type="button"
                        disabled={isUploading || isHandlingOAuthCallback || !scope}
                        onClick={handleUploadButtonClick}
                    >
                        <UploadCloud size={16} />
                        <span>{isUploading ? 'Uploading...' : 'Upload Files'}</span>
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        style={{ display: 'none' }}
                        onChange={handleFilesSelected}
                    />
                </div>

                <div className="am-table-card" style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                        {Object.entries(CLOUD_PROVIDER_META).map(([provider, meta]) => {
                            const isConnected = connectedProviders.has(provider)
                            const isConnecting = connectingProvider === provider
                            const disabled = isConnecting || isHandlingOAuthCallback || !scope

                            return (
                                <div
                                    key={provider}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        gap: '1rem',
                                        padding: '0.75rem 1rem',
                                        border: '1px solid var(--am-border)',
                                        borderRadius: '10px',
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div className="am-text-1" style={{ fontWeight: 600 }}>{meta.label}</div>
                                        <span className={`am-pill ${isConnected ? 'is-ready' : 'is-pending'}`}>
                                            {isConnected ? 'Connected' : 'Not Connected'}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        className="am-btn-secondary"
                                        disabled={disabled}
                                        onClick={() => startCloudConnect(provider)}
                                    >
                                        {isConnecting ? 'Connecting...' : isConnected ? 'Reconnect' : 'Connect'}
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {cloudTokensError && (
                    <div className="am-text-2" style={{ paddingBottom: '1rem', color: '#ef4444' }}>
                        <QueryError
                            message="Failed to load cloud connection status."
                            error={cloudTokensError}
                            onRetry={refreshKnowledgeData}
                        />
                    </div>
                )}

                {uploadSummary && (
                    <div className="am-text-2" style={{ paddingBottom: '1rem', color: uploadSummary.failures.length ? '#f59e0b' : '#22c55e' }}>
                        Uploaded {uploadSummary.successCount} file(s)
                        {uploadSummary.failures.length ? `, ${uploadSummary.failures.length} failed.` : ' successfully.'}
                        {uploadSummary.failures.length > 0 && (
                            <ul style={{ marginTop: '0.5rem', marginBottom: 0, paddingLeft: '1.2rem', color: '#ef4444' }}>
                                {uploadSummary.failures.map((failure) => (
                                    <li key={failure}>{failure}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}

                {cloudMessage && (
                    <div className="am-text-2" style={{ paddingBottom: '1rem', color: '#38bdf8' }}>
                        {cloudMessage}
                    </div>
                )}

                {cloudError && (
                    <div className="am-text-2" style={{ paddingBottom: '1rem', color: '#ef4444' }}>
                        {cloudError}
                    </div>
                )}

                {loading && (
                    <div className="am-text-2" style={{ padding: '2rem 0' }}>
                        Loading knowledge sources...
                    </div>
                )}

                {!loading && error && (
                    <div className="am-text-2" style={{ padding: '2rem 0', color: '#ef4444' }}>
                        <QueryError message="Failed to load knowledge." error={error} onRetry={refetch} />
                    </div>
                )}

                {!loading && !error && (
                    <KnowledgeTable rows={rows} />
                )}
            </div>
        </div>
    )
}

export default Knowledge
