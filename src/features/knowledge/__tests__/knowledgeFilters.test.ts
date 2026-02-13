import { describe, expect, it } from 'vitest'
import {
    DEFAULT_KNOWLEDGE_SOURCE_TAB,
    applyKnowledgeSourceTabToSearch,
    getKnowledgeSourceFilterFromTab,
    getKnowledgeSourceTabFromSearch,
    parseFolderIdsInput,
    removeOAuthParamsFromSearch,
} from '../knowledgeFilters'

describe('knowledgeFilters', () => {
    it('defaults invalid source tab to all', () => {
        expect(getKnowledgeSourceTabFromSearch('?source=unknown')).toBe(DEFAULT_KNOWLEDGE_SOURCE_TAB)
        expect(getKnowledgeSourceFilterFromTab('unknown')).toBeUndefined()
    })

    it('reads source tab from search and maps to API source filter', () => {
        expect(getKnowledgeSourceTabFromSearch('?source=google_drive')).toBe('google_drive')
        expect(getKnowledgeSourceFilterFromTab('google_drive')).toBe('google_drive')
        expect(getKnowledgeSourceFilterFromTab('all')).toBeUndefined()
    })

    it('writes source tab to search params and removes it for all', () => {
        expect(applyKnowledgeSourceTabToSearch('?foo=bar', 'sharepoint')).toBe('?foo=bar&source=sharepoint')
        expect(applyKnowledgeSourceTabToSearch('?foo=bar&source=upload', 'all')).toBe('?foo=bar')
    })

    it('removes OAuth params and preserves unrelated query params', () => {
        const next = removeOAuthParamsFromSearch('?source=upload&oauth_provider=google_drive&code=abc&state=xyz')
        expect(next).toBe('?source=upload')
    })

    it('parses and deduplicates folder IDs from comma/newline separated text', () => {
        expect(parseFolderIdsInput('root, team-drive\nroot\n  shared ')).toEqual(['root', 'team-drive', 'shared'])
        expect(parseFolderIdsInput('   ')).toEqual([])
    })
})

