import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import Knowledge from '../Knowledge'
import { getKnowledgeSources } from '../../services/knowledge'

vi.mock('../../services/knowledge', () => ({
    getKnowledgeSources: vi.fn(),
}))

describe('Knowledge page', () => {
    it('renders table headers', async () => {
        vi.mocked(getKnowledgeSources).mockResolvedValue([])

        render(
            <MemoryRouter initialEntries={['/org_1/proj_1/knowledge']}>
                <Routes>
                    <Route path="/:orgId/:projId/knowledge" element={<Knowledge />} />
                </Routes>
            </MemoryRouter>
        )

        expect(getKnowledgeSources).toHaveBeenCalledWith('org_1')
        expect(screen.getByRole('heading', { name: 'Knowledge Base' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Upload File' })).toBeDisabled()

        expect(await screen.findByText('File Name')).toBeInTheDocument()
        expect(screen.getByText('Type')).toBeInTheDocument()
        expect(screen.getByText('Source')).toBeInTheDocument()
        expect(screen.getByText('Status')).toBeInTheDocument()
        expect(screen.getByText('Uploaded')).toBeInTheDocument()
    })
})
