import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Voice from '../Voice'

describe('Voice page', () => {
    it('renders the phone instructions and number', () => {
        render(<Voice />)

        expect(screen.getByRole('heading', { name: 'Chat on Phone' })).toBeInTheDocument()
        expect(screen.getByText('How to Make a Chat on Phone')).toBeInTheDocument()
        expect(screen.getByText('+1 (506) 502-3431')).toBeInTheDocument()
        expect(screen.getByText('Tips for Best Results')).toBeInTheDocument()
    })
})
