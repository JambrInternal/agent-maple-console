import React from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import ErrorBoundary from '../components/ErrorBoundary/ErrorBoundary'
import { AuthProvider } from '../contexts/AuthContext'
import PostHogFeatureFlagProvider from '../featureFlags/posthogProvider'
import queryClient from '../queryClient'

const AppProviders = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <AuthProvider>
          <PostHogFeatureFlagProvider>
            {children}
          </PostHogFeatureFlagProvider>
        </AuthProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  )
}

export default AppProviders
