import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Contacts from '../Contacts'

describe('Contacts page', () => {
    it('renders the contacts table and header', () => {
        render(<Contacts />)

        expect(screen.getByRole('heading', { name: 'Contacts' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Add Contact' })).toBeInTheDocument()

        expect(screen.getByText('Role')).toBeInTheDocument()
        expect(screen.getByText('Company')).toBeInTheDocument()
        expect(screen.getByText('Email')).toBeInTheDocument()
        expect(screen.getByText('Phone')).toBeInTheDocument()
        expect(screen.getByText('Reports To')).toBeInTheDocument()
        expect(screen.getByText('Status')).toBeInTheDocument()

        expect(screen.getByText('GC Superintendent')).toBeInTheDocument()
        expect(screen.getByText('Iron Maple Construction')).toBeInTheDocument()
        expect(screen.getAllByRole('button', { name: 'Contact actions' }).length).toBeGreaterThan(0)
    })
})

it('adds a contact from the modal', async () => {
    const user = userEvent.setup()
    render(<Contacts />)

    await user.click(screen.getByRole('button', { name: 'Add Contact' }))
    expect(screen.getByRole('heading', { name: 'Add Contact' })).toBeInTheDocument()

    await user.type(screen.getByLabelText('Name'), 'Alex Carter')
    await user.type(screen.getByLabelText('Role'), 'Field Lead')
    await user.type(screen.getByLabelText('Company'), 'Iron Maple Construction')
    await user.type(screen.getByLabelText('Email'), 'alex@ironmaple.ca')
    await user.type(screen.getByLabelText('Phone'), '+1 (555) 200-0000')

    await user.click(screen.getByRole('button', { name: 'Save Contact' }))

    expect(screen.getByText('Field Lead')).toBeInTheDocument()
    expect(screen.getByText('alex@ironmaple.ca')).toBeInTheDocument()
})
