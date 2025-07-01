'use client'

import { useEffect, createContext, useContext, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import type { User, Session } from '@supabase/supabase-js'
import type { UserProfile } from '@/store/auth'

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  isLoading: boolean
  isInitialized: boolean
  isAuthenticated: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
  requireAuth?: boolean
  redirectTo?: string
}

export function AuthProvider({ 
  children, 
  requireAuth = false, 
  redirectTo = '/login' 
}: AuthProviderProps) {
  const router = useRouter()
  const { 
    user, 
    session, 
    profile,
    isLoading, 
    isInitialized,
    initialize, 
    signOut: authSignOut,
    isAuthenticated: checkIsAuthenticated 
  } = useAuthStore()

  const isAuthenticated = checkIsAuthenticated()

  // Initialize auth on mount
  useEffect(() => {
    if (!isInitialized) {
      initialize()
    }
  }, [initialize, isInitialized])

  // Handle authentication requirement
  useEffect(() => {
    if (isInitialized && requireAuth && !isAuthenticated && !isLoading) {
      router.replace(redirectTo)
    }
  }, [isInitialized, requireAuth, isAuthenticated, isLoading, router, redirectTo])

  // Handle sign out
  const handleSignOut = async () => {
    await authSignOut()
    router.push('/login')
  }

  const value: AuthContextType = {
    user,
    session,
    profile,
    isLoading,
    isInitialized,
    isAuthenticated,
    signOut: handleSignOut,
  }

  // Show loading spinner while initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show loading spinner for auth-required pages while checking authentication
  if (requireAuth && isLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Authenticating...</p>
        </div>
      </div>
    )
  }

  // Don't render children if auth is required but user is not authenticated
  if (requireAuth && !isAuthenticated && isInitialized && !isLoading) {
    return null
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Higher-order component for protecting routes
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  redirectTo: string = '/login'
) {
  return function ProtectedComponent(props: P) {
    return (
      <AuthProvider requireAuth redirectTo={redirectTo}>
        <Component {...props} />
      </AuthProvider>
    )
  }
}

// Hook for getting current user with loading state
export function useUser() {
  const { user, isLoading, isInitialized } = useAuth()
  
  return {
    user,
    isLoading: isLoading || !isInitialized,
    isAuthenticated: !!user,
  }
}

// Hook for getting user profile with loading state
export function useProfile() {
  const { profile, isLoading, isInitialized } = useAuth()
  
  return {
    profile,
    isLoading: isLoading || !isInitialized,
    hasProfile: !!profile,
  }
}

// Component for protecting specific sections of a page
interface ProtectedSectionProps {
  children: ReactNode
  fallback?: ReactNode
  requireAuth?: boolean
}

export function ProtectedSection({ 
  children, 
  fallback = null, 
  requireAuth = true 
}: ProtectedSectionProps) {
  const { isAuthenticated, isLoading, isInitialized } = useAuth()

  if (!isInitialized || isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    )
  }

  if (requireAuth && !isAuthenticated) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

// Component for showing different content based on auth state
interface AuthStateProps {
  authenticated?: ReactNode
  unauthenticated?: ReactNode
  loading?: ReactNode
}

export function AuthState({ 
  authenticated, 
  unauthenticated, 
  loading 
}: AuthStateProps) {
  const { isAuthenticated, isLoading, isInitialized } = useAuth()

  if (!isInitialized || isLoading) {
    return <>{loading}</>
  }

  return <>{isAuthenticated ? authenticated : unauthenticated}</>
}