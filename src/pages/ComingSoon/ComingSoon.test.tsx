import React from 'react'
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import ComingSoon from './ComingSoon'

describe('ComingSoon', () => {
  it('renders beta symbol when beta mode is enabled', () => {
    render(<ComingSoon title="Insights" beta />)

    expect(screen.getByRole('heading', { name: /Insights/i })).toBeInTheDocument()
    expect(screen.getByLabelText('Beta')).toHaveTextContent('β')
  })

  it('does not render beta symbol when beta mode is disabled', () => {
    render(<ComingSoon title="Insights" />)

    expect(screen.queryByLabelText('Beta')).not.toBeInTheDocument()
  })
})
