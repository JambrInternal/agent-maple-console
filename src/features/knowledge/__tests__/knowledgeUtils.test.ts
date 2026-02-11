import { describe, expect, it } from 'vitest'
import { formatKnowledgeDate, KNOWLEDGE_STATUS_LABELS } from '../knowledgeUtils'

describe('knowledgeUtils', () => {
    it('exposes status labels used by knowledge table', () => {
        expect(KNOWLEDGE_STATUS_LABELS.pending).toBe('Pending')
        expect(KNOWLEDGE_STATUS_LABELS.indexing).toBe('Indexing')
        expect(KNOWLEDGE_STATUS_LABELS.ready).toBe('Ready')
        expect(KNOWLEDGE_STATUS_LABELS.error).toBe('Error')
    })

    it('formats a valid uploaded date', () => {
        expect(formatKnowledgeDate('2026-02-11T10:00:00Z')).not.toBe('—')
    })

    it('returns fallback for empty or invalid dates', () => {
        expect(formatKnowledgeDate('')).toBe('—')
        expect(formatKnowledgeDate('not-a-date')).toBe('—')
    })
})
