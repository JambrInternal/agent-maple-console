import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
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

        render(
            <MemoryRouter initialEntries={["/org_1/proj_1/contacts"]}>
                <Routes>
                    <Route path="/:orgId/:projId/contacts" element={<Contacts />} />
                </Routes>
            </MemoryRouter>
        )

        expect(await screen.findByRole('heading', { name: 'Contacts' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Add Contact' })).toBeDisabled()

        expect(screen.getByText('Name')).toBeInTheDocument()
        expect(screen.getByText('Company')).toBeInTheDocument()
        expect(screen.getByText('Email')).toBeInTheDocument()
        expect(screen.getByText('Phone')).toBeInTheDocument()
        expect(screen.getByText('Created')).toBeInTheDocument()

        expect(screen.getByText('Joe Henderson')).toBeInTheDocument()
        expect(screen.getByText('Iron Maple Construction')).toBeInTheDocument()
        expect(screen.getByText('joe@ironmaple.ca')).toBeInTheDocument()
    })
})
