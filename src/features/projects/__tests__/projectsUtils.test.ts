import { describe, expect, it } from 'vitest'
import {
    filterProjects,
    formatProjectLastActivity,
    getProjectStatusLabel,
    PROJECT_STATUS_OPTIONS,
} from '../projectsUtils'

const mockProjects = [
    {
        id: 'proj_1',
        name: 'Site A',
        agentStatus: 'online',
    },
    {
        id: 'proj_2',
        name: 'Site B',
        agentStatus: 'offline',
    },
]

describe('projectsUtils', () => {
    it('exposes expected status options', () => {
        expect(PROJECT_STATUS_OPTIONS).toEqual([
            { key: 'all', label: 'All' },
            { key: 'online', label: 'Online' },
            { key: 'offline', label: 'Offline' },
        ])
    })

    it('returns status labels with fallback', () => {
        expect(getProjectStatusLabel('online')).toBe('Online')
        expect(getProjectStatusLabel('offline')).toBe('Offline')
        expect(getProjectStatusLabel('unknown')).toBe('Unknown')
    })

    it('formats valid last activity timestamp and handles invalid values', () => {
        expect(formatProjectLastActivity('2026-02-11T21:00:00Z')).not.toBe('—')
        expect(formatProjectLastActivity('')).toBe('—')
        expect(formatProjectLastActivity('not-a-date')).toBe('—')
    })

    it('filters projects by search term and status', () => {
        expect(filterProjects({
            projects: mockProjects,
            searchTerm: 'site',
            statusFilter: 'all',
        })).toHaveLength(2)

        expect(filterProjects({
            projects: mockProjects,
            searchTerm: 'A',
            statusFilter: 'all',
        })).toEqual([mockProjects[0]])

        expect(filterProjects({
            projects: mockProjects,
            searchTerm: '',
            statusFilter: 'offline',
        })).toEqual([mockProjects[1]])
    })
})
