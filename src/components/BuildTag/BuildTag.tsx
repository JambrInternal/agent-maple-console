import React from 'react'
import { getAppConfig } from '../../config/runtimeConfig'

const UNKNOWN_COMMIT_VALUES = new Set(['unknown', 'dev', 'null', 'undefined', 'n/a'])

const normalizeCommit = (value) => {
  if (typeof value !== 'string') return ''

  const trimmed = value.trim()
  if (!trimmed) return ''
  if (UNKNOWN_COMMIT_VALUES.has(trimmed.toLowerCase())) return ''
  if (/^[0-9a-f]{7,40}$/i.test(trimmed)) return trimmed.slice(0, 7)

  return trimmed
}

const BuildTag = () => {
  const runtimeCommit = getAppConfig().GIT_COMMIT
  const envCommit = import.meta.env.VITE_GIT_COMMIT
  const globalCommit = typeof window !== 'undefined' ? window.__APP_COMMIT__ : ''
  const commit = normalizeCommit(runtimeCommit) || normalizeCommit(envCommit) || normalizeCommit(globalCommit) || 'dev'

  return (
    <div className="am-build-tag">
            Version {commit}
    </div>
  )
}

export default BuildTag
