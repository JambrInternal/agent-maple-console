import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AuthDebugToggle from './AuthDebugToggle'

describe('AuthDebugToggle', () => {
    it('renders enable state and fires click', async () => {
        const onToggle = vi.fn()
        const user = userEvent.setup()

        render(<AuthDebugToggle debugEnabled={false} onToggle={onToggle} />)

        const button = screen.getByRole('button', { name: 'Enable Debug' })
        await user.click(button)

        expect(onToggle).toHaveBeenCalledTimes(1)
    })

    it('renders disable state when debug is enabled', () => {
        render(<AuthDebugToggle debugEnabled onToggle={() => {}} />)

        expect(screen.getByRole('button', { name: 'Disable Debug' })).toBeInTheDocument()
    })
})
