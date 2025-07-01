import { createClient } from './client'
import { createClient as createServerClient } from './server'
import type { Provider } from '@supabase/supabase-js'

// Client-side auth helpers
export const signUp = async (email: string, password: string) => {
  const supabase = createClient()
  return await supabase.auth.signUp({
    email,
    password,
  })
}

export const signIn = async (email: string, password: string) => {
  const supabase = createClient()
  return await supabase.auth.signInWithPassword({
    email,
    password,
  })
}

export const signInWithProvider = async (provider: Provider) => {
  const supabase = createClient()
  return await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })
}

export const signOut = async () => {
  const supabase = createClient()
  return await supabase.auth.signOut()
}

export const resetPassword = async (email: string) => {
  const supabase = createClient()
  return await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  })
}

export const updatePassword = async (password: string) => {
  const supabase = createClient()
  return await supabase.auth.updateUser({ password })
}

// Server-side auth helpers
export const getServerUser = async () => {
  const supabase = await createServerClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    console.error('Error getting user:', error)
    return null
  }

  return user
}

export const getServerSession = async () => {
  const supabase = await createServerClient()
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (error) {
    console.error('Error getting session:', error)
    return null
  }

  return session
}

// Utility function to check if user is authenticated
export const isAuthenticated = async () => {
  const user = await getServerUser()
  return !!user
}

// Utility function to require authentication (throws if not authenticated)
export const requireAuth = async () => {
  const user = await getServerUser()
  if (!user) {
    throw new Error('Authentication required')
  }
  return user
}