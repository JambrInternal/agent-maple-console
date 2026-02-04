import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Knowledge from '../Knowledge'

describe('Knowledge page', () => {
    it('renders tabs and table headers', () => {
        render(<Knowledge />)

        expect(screen.getByRole('heading', { name: 'Knowledge Base' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'File Upload' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Cloud Storage' })).toBeInTheDocument()

        expect(screen.getByText('File Name')).toBeInTheDocument()
        expect(screen.getByText('Knowledge Extraction')).toBeInTheDocument()
        expect(screen.getByText('Uploaded')).toBeInTheDocument()
    })
})
