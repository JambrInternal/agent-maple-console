import React from 'react'
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import KnowledgeSourceBadge from './KnowledgeSourceBadge'

describe('KnowledgeSourceBadge', () => {
  it('renders google drive badge', () => {
    render(<KnowledgeSourceBadge type="google_drive" />)

    expect(screen.getByText('Google Drive')).toBeInTheDocument()
  })

  it('renders sharepoint badge', () => {
    render(<KnowledgeSourceBadge type="sharepoint" />)

    expect(screen.getByText('SharePoint')).toBeInTheDocument()
  })

  it('renders upload badge for non-cloud sources', () => {
    render(<KnowledgeSourceBadge type="pdf" />)

    expect(screen.getByText('Upload')).toBeInTheDocument()
  })
})
