import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { UploadCloud } from 'lucide-react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import QueryError from '../components/QueryError'
import KnowledgeCloudSyncDialog from '../features/knowledge/components/KnowledgeCloudSyncDialog'
import KnowledgeTable from '../features/knowledge/components/KnowledgeTable'
import {
    applyKnowledgeSourceTabToSearch,
    getKnowledgeSourceFilterFromTab,
    getKnowledgeSourceTabFromSearch,
    KNOWLEDGE_SOURCE_TABS,
    parseFolderIdsInput,
    removeOAuthParamsFromSearch,
} from '../features/knowledge/knowledgeFilters'
import { useApiQuery } from '../hooks/useApiQuery'
import {
    completeKnowledgeCloudCallback,
    deleteKnowledgeSource,
    disconnectKnowledgeCloudProvider,
    getKnowledgeCloudAuthorizeUrl,
    getKnowledgeSourceDownloadUrl,
    getKnowledgeSources,
    listKnowledgeCloudTokens,
    listKnowledgeGoogleDriveConfig,
    listKnowledgeSharePointConfig,
    reindexKnowledgeSource,
    syncKnowledgeGoogleDrive,
    syncKnowledgeSharePoint,
    uploadKnowledgeSource,
} from '../services/knowledge'
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

const isScopeReady = (scope) => Boolean(scope?.organizationId && scope?.projectId)

const Knowledge = () => {
    const fileInputRef = useRef(null)
    const handledOAuthSearchRef = useRef('')
    const { orgId, projId } = useParams()
    const location = useLocation()
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const [isUploading, setIsUploading] = useState(false)
    const [connectingProvider, setConnectingProvider] = useState('')
    const [disconnectingProvider, setDisconnectingProvider] = useState('')
    const [isHandlingOAuthCallback, setIsHandlingOAuthCallback] = useState(false)
    const [isSyncSubmitting, setIsSyncSubmitting] = useState(false)
    const [isBulkDeleting, setIsBulkDeleting] = useState(false)
    const [rowActionBusyId, setRowActionBusyId] = useState('')
    const [openSyncProvider, setOpenSyncProvider] = useState('')
    const [syncFolderInput, setSyncFolderInput] = useState('')
    const [syncRecursive, setSyncRecursive] = useState(false)
    const [selectedRowIds, setSelectedRowIds] = useState(new Set())

    const [uploadSummary, setUploadSummary] = useState(null)
    const [bulkDeleteSummary, setBulkDeleteSummary] = useState(null)
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
    const selectedSourceTab = useMemo(() => getKnowledgeSourceTabFromSearch(location.search), [location.search])
    const sourceFilter = useMemo(() => getKnowledgeSourceFilterFromTab(selectedSourceTab), [selectedSourceTab])
    const knowledgeQueryKey = useMemo(
        () => (orgId && projId
            ? ['knowledgeSources', orgId, projId, sourceFilter || 'all']
            : ['knowledgeSources', 'none']),
        [orgId, projId, sourceFilter]
    )
    const cloudTokensQueryKey = useMemo(
        () => (orgId && projId ? ['knowledgeCloudTokens', orgId, projId] : ['knowledgeCloudTokens', 'none']),
        [orgId, projId]
    )
    const googleDriveConfigQueryKey = useMemo(
        () => (orgId && projId ? ['knowledgeGoogleDriveConfig', orgId, projId] : ['knowledgeGoogleDriveConfig', 'none']),
        [orgId, projId]
    )
    const sharePointConfigQueryKey = useMemo(
        () => (orgId && projId ? ['knowledgeSharePointConfig', orgId, projId] : ['knowledgeSharePointConfig', 'none']),
        [orgId, projId]
    )
    const {
        data: sources = [],
        isLoading: loading,
        error,
        refetch,
    } = useApiQuery(
        knowledgeQueryKey,
        () => (
            scope
                ? getKnowledgeSources(scope, { source: sourceFilter })
                : Promise.resolve([])
        ),
        { enabled: isScopeReady(scope) }
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
        { enabled: isScopeReady(scope) }
    )
    const {
        data: googleDriveConfig = [],
        error: googleDriveConfigError,
        isLoading: isGoogleDriveConfigLoading,
    } = useApiQuery(
        googleDriveConfigQueryKey,
        () => (
            scope
                ? listKnowledgeGoogleDriveConfig(scope)
                : Promise.resolve([])
        ),
        { enabled: isScopeReady(scope) }
    )
    const {
        data: sharePointConfig = [],
        error: sharePointConfigError,
        isLoading: isSharePointConfigLoading,
    } = useApiQuery(
        sharePointConfigQueryKey,
        () => (
            scope
                ? listKnowledgeSharePointConfig(scope)
                : Promise.resolve([])
        ),
        { enabled: isScopeReady(scope) }
    )

    const rows = useMemo(() => sources, [sources])
    const connectedProviders = useMemo(
        () => new Set(cloudTokens.map((token) => (token.provider || '').toLowerCase())),
        [cloudTokens]
    )
    const syncDialogProviderLabel = getCloudProviderLabel(openSyncProvider)
    const syncConfigLoading = openSyncProvider === 'google_drive'
        ? isGoogleDriveConfigLoading
        : isSharePointConfigLoading
    const syncConfigError = openSyncProvider === 'google_drive'
        ? googleDriveConfigError
        : sharePointConfigError
    const existingSyncFolderIds = useMemo(() => {
        const config = openSyncProvider === 'google_drive' ? googleDriveConfig : sharePointConfig
        return Array.from(new Set(
            config
                .map((item) => item.folderId)
                .filter(Boolean)
        ))
    }, [googleDriveConfig, openSyncProvider, sharePointConfig])

    const refreshKnowledgeData = useCallback(
        async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: knowledgeQueryKey }),
                queryClient.invalidateQueries({ queryKey: cloudTokensQueryKey }),
                queryClient.invalidateQueries({ queryKey: googleDriveConfigQueryKey }),
                queryClient.invalidateQueries({ queryKey: sharePointConfigQueryKey }),
            ])
        },
        [cloudTokensQueryKey, googleDriveConfigQueryKey, knowledgeQueryKey, queryClient, sharePointConfigQueryKey]
    )

    useEffect(() => {
        setSelectedRowIds((previous) => {
            const visibleIds = new Set(rows.map((row) => row.id))
            const next = new Set(Array.from(previous).filter((id) => visibleIds.has(id)))
            if (next.size === previous.size) {
                let changed = false
                previous.forEach((id) => {
                    if (!next.has(id)) changed = true
                })
                if (!changed) return previous
            }
            return next
        })
    }, [rows])

    const clearInlineMessages = () => {
        setCloudMessage('')
        setCloudError('')
        setBulkDeleteSummary(null)
    }

    const handleUploadButtonClick = () => {
        fileInputRef.current?.click()
    }

    const handleSourceTabChange = (nextTab) => {
        const nextSearch = applyKnowledgeSourceTabToSearch(location.search, nextTab)
        navigate(`${location.pathname}${nextSearch}`)
    }

    const handleFilesSelected = async (event) => {
        const files = Array.from(event.target.files || [])
        event.target.value = ''
        if (!scope || files.length === 0) return

        clearInlineMessages()
        setUploadSummary(null)
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
        clearInlineMessages()
        setConnectingProvider(provider)

        try {
            const redirectUri = buildOAuthRedirectUri(location.pathname, provider)
            const authorizeResult = await getKnowledgeCloudAuthorizeUrl(scope, provider, redirectUri)
            if (!authorizeResult.authorizationUrl) {
                throw new Error('Authorization URL was empty')
            }
            if (!authorizeResult.state) {
                throw new Error('Authorization state was empty')
            }

            sessionStorage.setItem(
                buildOAuthStateStorageKey(orgId, projId, provider),
                authorizeResult.state
            )
            window.location.assign(authorizeResult.authorizationUrl)
        } catch (connectError) {
            setCloudError(withStatus(`Failed to start ${getCloudProviderLabel(provider)} connection.`, connectError))
        } finally {
            setConnectingProvider('')
        }
    }

    const openCloudSyncDialog = (provider) => {
        if (!scope || !isCloudProvider(provider)) return

        setOpenSyncProvider(provider)
        setSyncFolderInput('')
        setSyncRecursive(false)
        setUploadSummary(null)
        clearInlineMessages()
    }

    const closeCloudSyncDialog = () => {
        if (isSyncSubmitting) return
        setOpenSyncProvider('')
        setSyncFolderInput('')
        setSyncRecursive(false)
    }

    const handleCloudSyncSubmit = async (event) => {
        event.preventDefault()
        if (!scope || !openSyncProvider || !isCloudProvider(openSyncProvider)) return

        setIsSyncSubmitting(true)
        setUploadSummary(null)
        clearInlineMessages()

        try {
            const folderIds = parseFolderIdsInput(syncFolderInput)
            if (openSyncProvider === 'google_drive') {
                await syncKnowledgeGoogleDrive(scope, {
                    recursive: syncRecursive,
                    folderIds,
                })
            } else {
                await syncKnowledgeSharePoint(scope, {
                    recursive: syncRecursive,
                    folderIds,
                })
            }
            await refreshKnowledgeData()
            setCloudMessage(`${syncDialogProviderLabel} sync started.`)
            setOpenSyncProvider('')
            setSyncFolderInput('')
            setSyncRecursive(false)
        } catch (syncError) {
            setCloudError(withStatus(`Failed to start ${syncDialogProviderLabel} sync.`, syncError))
        } finally {
            setIsSyncSubmitting(false)
        }
    }

    const handleCloudDisconnect = async (provider) => {
        if (!scope || !isCloudProvider(provider)) return
        if (!window.confirm(`Disconnect ${getCloudProviderLabel(provider)} for this project?`)) return

        setDisconnectingProvider(provider)
        setUploadSummary(null)
        clearInlineMessages()
        try {
            await disconnectKnowledgeCloudProvider(scope, provider)
            await refreshKnowledgeData()
            setCloudMessage(`${getCloudProviderLabel(provider)} disconnected.`)
        } catch (disconnectError) {
            setCloudError(withStatus(`Failed to disconnect ${getCloudProviderLabel(provider)}.`, disconnectError))
        } finally {
            setDisconnectingProvider('')
        }
    }

    const runRowAction = async (rowId, action) => {
        setUploadSummary(null)
        clearInlineMessages()
        setRowActionBusyId(rowId)
        try {
            await action()
        } catch (error) {
            setCloudError(withStatus('Action failed. Please try again.', error))
        } finally {
            setRowActionBusyId('')
        }
    }

    const handleViewChunks = (row) => {
        if (!scope) return
        navigate(`/${orgId}/${projId}/datasources/${row.id}/chunks`)
    }

    const handleDownloadSource = async (row) => {
        if (!scope) return
        await runRowAction(row.id, async () => {
            const result = await getKnowledgeSourceDownloadUrl(scope, row.id)
            if (!result.downloadUrl) {
                throw new Error('Download URL was empty')
            }
            window.open(result.downloadUrl, '_blank', 'noopener,noreferrer')
            setCloudMessage(`Download link opened for ${row.name}.`)
        })
    }

    const handleReprocessSource = async (row) => {
        if (!scope) return
        await runRowAction(row.id, async () => {
            await reindexKnowledgeSource(row.id, scope)
            await refreshKnowledgeData()
            setCloudMessage(`Reprocess started for ${row.name}.`)
        })
    }

    const handleDeleteSource = async (row) => {
        if (!scope) return
        if (!window.confirm(`Delete ${row.name}?`)) return

        await runRowAction(row.id, async () => {
            await deleteKnowledgeSource(row.id, scope)
            await refreshKnowledgeData()
            setSelectedRowIds((previous) => {
                const next = new Set(previous)
                next.delete(row.id)
                return next
            })
            setCloudMessage(`${row.name} deleted.`)
        })
    }

    const handleToggleRowSelection = (rowId) => {
        setSelectedRowIds((previous) => {
            const next = new Set(previous)
            if (next.has(rowId)) {
                next.delete(rowId)
            } else {
                next.add(rowId)
            }
            return next
        })
    }

    const handleToggleAllRowSelection = () => {
        setSelectedRowIds((previous) => {
            if (rows.length === 0) return previous
            const allIds = rows.map((row) => row.id)
            const areAllSelected = allIds.every((id) => previous.has(id))
            if (areAllSelected) return new Set()
            return new Set(allIds)
        })
    }

    const handleBulkDelete = async () => {
        if (!scope || selectedRowIds.size === 0) return

        const selectedIds = Array.from(selectedRowIds)
        const confirmation = `Delete ${selectedIds.length} selected source(s)?`
        if (!window.confirm(confirmation)) return

        setIsBulkDeleting(true)
        setUploadSummary(null)
        clearInlineMessages()

        try {
            const results = await Promise.allSettled(
                selectedIds.map((rowId) => deleteKnowledgeSource(rowId, scope))
            )

            const failedIds = []
            const failures = []
            let successCount = 0
            results.forEach((result, index) => {
                if (result.status === 'fulfilled') {
                    successCount += 1
                    return
                }
                const failedId = selectedIds[index]
                failedIds.push(failedId)
                failures.push(withStatus(`Failed to delete source ${failedId}.`, result.reason))
            })

            await refreshKnowledgeData()
            setSelectedRowIds(new Set(failedIds))
            setBulkDeleteSummary({
                successCount,
                failures,
            })
            if (failures.length === 0) {
                setCloudMessage(`Deleted ${successCount} source(s).`)
            } else {
                setCloudError(`${failures.length} source delete action(s) failed.`)
            }
        } catch (bulkDeleteError) {
            setCloudError(withStatus('Failed to complete bulk delete.', bulkDeleteError))
        } finally {
            setIsBulkDeleting(false)
        }
    }

    const handleClearSelected = () => {
        setSelectedRowIds(new Set())
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
            const nextSearch = removeOAuthParamsFromSearch(location.search)
            navigate(`${location.pathname}${nextSearch}`, { replace: true })
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

        if (!returnedState) {
            sessionStorage.removeItem(stateStorageKey)
            setCloudMessage('')
            setCloudError(`Missing OAuth state for ${getCloudProviderLabel(provider)} callback. Please reconnect.`)
            clearCallbackParams()
            return
        }

        if (expectedState === null) {
            sessionStorage.removeItem(stateStorageKey)
            setCloudMessage('')
            setCloudError(`OAuth state missing or expired for ${getCloudProviderLabel(provider)}. Please reconnect.`)
            clearCallbackParams()
            return
        }

        if (returnedState !== expectedState) {
            sessionStorage.removeItem(stateStorageKey)
            setCloudMessage('')
            setCloudError(`OAuth state mismatch for ${getCloudProviderLabel(provider)}. Please reconnect.`)
            clearCallbackParams()
            return
        }
        sessionStorage.removeItem(stateStorageKey)

        let cancelled = false
        const finalizeOAuthFlow = async () => {
            setUploadSummary(null)
            clearInlineMessages()
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
    }, [
        location.pathname,
        location.search,
        navigate,
        orgId,
        projId,
        refreshKnowledgeData,
        scope,
    ])

    const selectedCount = selectedRowIds.size
    const isRowActionBusy = (rowId) => (
        rowActionBusyId === rowId ||
        isBulkDeleting ||
        isUploading ||
        isHandlingOAuthCallback ||
        isSyncSubmitting
    )

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

                <div className="am-tabs" role="tablist" aria-label="Knowledge source filters">
                    {KNOWLEDGE_SOURCE_TABS.map((tab) => (
                        <button
                            key={tab.key}
                            type="button"
                            className={`am-tab ${selectedSourceTab === tab.key ? 'active' : ''}`}
                            aria-pressed={selectedSourceTab === tab.key}
                            onClick={() => handleSourceTabChange(tab.key)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="am-table-card" style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                        {Object.entries(CLOUD_PROVIDER_META).map(([provider, meta]) => {
                            const isConnected = connectedProviders.has(provider)
                            const isConnecting = connectingProvider === provider
                            const isDisconnecting = disconnectingProvider === provider
                            const disabled = isConnecting || isHandlingOAuthCallback || !scope || isSyncSubmitting

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
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        <button
                                            type="button"
                                            className="am-btn-secondary"
                                            disabled={disabled}
                                            onClick={() => startCloudConnect(provider)}
                                        >
                                            {isConnecting ? 'Connecting...' : isConnected ? 'Reconnect' : 'Connect'}
                                        </button>
                                        <button
                                            type="button"
                                            className="am-btn-secondary"
                                            disabled={disabled || !isConnected}
                                            onClick={() => openCloudSyncDialog(provider)}
                                        >
                                            Sync
                                        </button>
                                        {isConnected && (
                                            <button
                                                type="button"
                                                className="am-btn-secondary"
                                                disabled={disabled || isDisconnecting}
                                                onClick={() => handleCloudDisconnect(provider)}
                                            >
                                                {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
                                            </button>
                                        )}
                                    </div>
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

                {selectedCount > 0 && (
                    <div className="am-table-card" style={{ marginBottom: '1rem', padding: '0.85rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                            <div className="am-text-2">{selectedCount} source(s) selected</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <button
                                    type="button"
                                    className="am-btn-secondary"
                                    onClick={handleClearSelected}
                                    disabled={isBulkDeleting}
                                >
                                    Clear Selection
                                </button>
                                <button
                                    type="button"
                                    className="am-btn-secondary"
                                    onClick={handleBulkDelete}
                                    disabled={isBulkDeleting}
                                >
                                    {isBulkDeleting ? 'Deleting...' : 'Delete Selected'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {uploadSummary && (
                    <div className="am-text-2" style={{ paddingBottom: '1rem', color: uploadSummary.failures.length ? '#f59e0b' : '#22c55e' }}>
                        Uploaded {uploadSummary.successCount} file(s)
                        {uploadSummary.failures.length ? `, ${uploadSummary.failures.length} failed.` : ' successfully.'}
                        {uploadSummary.failures.length > 0 && (
                            <ul style={{ marginTop: '0.5rem', marginBottom: 0, paddingLeft: '1.2rem', color: '#ef4444' }}>
                                {uploadSummary.failures.map((failure, index) => (
                                    <li key={index}>{failure}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}

                {bulkDeleteSummary && (
                    <div className="am-text-2" style={{ paddingBottom: '1rem', color: bulkDeleteSummary.failures.length ? '#f59e0b' : '#22c55e' }}>
                        Deleted {bulkDeleteSummary.successCount} source(s)
                        {bulkDeleteSummary.failures.length ? `, ${bulkDeleteSummary.failures.length} failed.` : ' successfully.'}
                        {bulkDeleteSummary.failures.length > 0 && (
                            <ul style={{ marginTop: '0.5rem', marginBottom: 0, paddingLeft: '1.2rem', color: '#ef4444' }}>
                                {bulkDeleteSummary.failures.map((failure, index) => (
                                    <li key={index}>{failure}</li>
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
                    <KnowledgeTable
                        rows={rows}
                        selectedRowIds={selectedRowIds}
                        onToggleRowSelection={handleToggleRowSelection}
                        onToggleAllRowSelection={handleToggleAllRowSelection}
                        onViewChunks={handleViewChunks}
                        onDownload={handleDownloadSource}
                        onReprocess={handleReprocessSource}
                        onDelete={handleDeleteSource}
                        isRowActionBusy={isRowActionBusy}
                    />
                )}

                <KnowledgeCloudSyncDialog
                    isOpen={Boolean(openSyncProvider)}
                    providerLabel={syncDialogProviderLabel}
                    folderInput={syncFolderInput}
                    recursive={syncRecursive}
                    isSubmitting={isSyncSubmitting}
                    configLoading={syncConfigLoading}
                    configError={syncConfigError ? withStatus('Failed to load sync folder config.', syncConfigError) : ''}
                    existingFolderIds={existingSyncFolderIds}
                    onFolderInputChange={setSyncFolderInput}
                    onRecursiveChange={setSyncRecursive}
                    onClose={closeCloudSyncDialog}
                    onSubmit={handleCloudSyncSubmit}
                />
            </div>
        </div>
    )
}

export default Knowledge
