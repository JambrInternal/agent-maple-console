import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Contacts from '../Contacts'

describe('Contacts page', () => {
    it('renders the contacts table and header', () => {
        render(<Contacts />)

        expect(screen.getByRole('heading', { name: 'Contacts' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Add Contact' })).toBeInTheDocument()

        expect(screen.getByText('Name')).toBeInTheDocument()
        expect(screen.getByText('Role')).toBeInTheDocument()
        expect(screen.getByText('Contact Info')).toBeInTheDocument()
        expect(screen.getByText('Escalation Level')).toBeInTheDocument()
        expect(screen.getByText('Status')).toBeInTheDocument()

        expect(screen.getByText('Joe Henderson')).toBeInTheDocument()
        expect(screen.getByText('GC Superintendent')).toBeInTheDocument()
    })
})
