import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import Contacts from '../Contacts'
import { getContacts } from '../../services/people'

vi.mock('../../services/people', () => ({
    getContacts: vi.fn(),
}))

describe('Contacts page', () => {
    it('renders the contacts table and header', async () => {
        vi.mocked(getContacts).mockResolvedValue([
            {
                id: 'contact_1',
                projectId: 'proj_1',
                name: 'Joe Henderson',
                company: 'Iron Maple Construction',
                email: 'joe@ironmaple.ca',
                phone: '+1 (555) 0123',
                createdAt: '2026-02-01T10:00:00Z',
            },
        ])

        const queryClient = new QueryClient()
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={["/org_1/proj_1/contacts"]}>
                    <Routes>
                        <Route path="/:orgId/:projId/contacts" element={<Contacts />} />
                    </Routes>
                </MemoryRouter>
            </QueryClientProvider>
        )

        expect(getContacts).toHaveBeenCalledWith({
            organizationId: 'org_1',
            projectId: 'proj_1',
        })
        expect(await screen.findByRole('heading', { name: 'Contacts' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Add Contact' })).toBeDisabled()

        await screen.findByText('Name')
        await screen.findByText('Company')
        await screen.findByText('Email')
        await screen.findByText('Phone')
        await screen.findByText('Created')

        await screen.findByText('Joe Henderson')
        await screen.findByText('Iron Maple Construction')
        await screen.findByText('joe@ironmaple.ca')
    })
})
