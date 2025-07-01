'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/store/auth'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { refreshSession, isLoading, error } = useAuthStore()

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Get the current URL hash which contains auth data
      const hashFragment = window.location.hash
      
      if (hashFragment) {
        // Parse the hash fragment for auth data
        const params = new URLSearchParams(hashFragment.substring(1))
        const accessToken = params.get('access_token')
        const refreshToken = params.get('refresh_token')
        
        if (accessToken) {
          // Refresh the session to get the latest auth state
          await refreshSession()
          
          // Get redirect destination
          const redirectTo = searchParams.get('redirectTo') || '/dashboard'
          
          // Redirect after successful authentication
          router.replace(redirectTo)
          return
        }
      }
      
      // Check for error in URL params
      const authError = searchParams.get('error')
      const errorDescription = searchParams.get('error_description')
      
      if (authError) {
        console.error('Auth error:', authError, errorDescription)
        router.replace(`/login?error=${encodeURIComponent(errorDescription || authError)}`)
        return
      }
      
      // If no auth data found, redirect to login
      router.replace('/login')
    }

    handleAuthCallback()
  }, [router, searchParams, refreshSession])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4">
            <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.962-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Authentication Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/login')}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Completing Authentication</h1>
        <p className="text-gray-600">Please wait while we sign you in...</p>
      </div>
    </div>
  )
}