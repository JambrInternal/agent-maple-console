import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Voice from '../Voice'

describe('Voice page', () => {
    it('renders the phone session placeholder', () => {
        render(<Voice />)

        expect(screen.getByRole('heading', { name: 'Chat on Phone' })).toBeInTheDocument()
        expect(screen.getByText('Phone Session Not Configured')).toBeInTheDocument()
        expect(screen.getByText('A phone session must be created by the backend before a number is available.')).toBeInTheDocument()
    })
})
