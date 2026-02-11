import React from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import ErrorBoundary from '../components/ErrorBoundary'
import { AuthProvider } from '../contexts/AuthContext'
import queryClient from '../queryClient'

const AppProviders = ({ children }) => {
    return (
        <QueryClientProvider client={queryClient}>
            <ErrorBoundary>
                <AuthProvider>{children}</AuthProvider>
            </ErrorBoundary>
        </QueryClientProvider>
    )
}

export default AppProviders
