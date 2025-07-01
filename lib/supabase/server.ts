import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '../../types/database'

export const createClient = async () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!url || !key) {
    // Return a mock client during build time or when env vars are missing
    return {
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        signUp: () => Promise.resolve({ data: { user: null }, error: new Error('Supabase not configured') }),
        signInWithPassword: () => Promise.resolve({ data: { user: null }, error: new Error('Supabase not configured') }),
        signOut: () => Promise.resolve({ error: null }),
        resetPasswordForEmail: () => Promise.resolve({ error: new Error('Supabase not configured') }),
        updateUser: () => Promise.resolve({ error: new Error('Supabase not configured') }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
      from: () => ({
        select: () => ({ data: [], error: null }),
        insert: () => ({ data: null, error: new Error('Supabase not configured') }),
        update: () => ({ data: null, error: new Error('Supabase not configured') }),
        delete: () => ({ data: null, error: new Error('Supabase not configured') }),
        eq: function() { return this },
        or: function() { return this },
        order: function() { return this },
        limit: function() { return this },
        range: function() { return this },
        single: function() { return this },
      }),
      storage: {
        from: () => ({
          upload: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
          remove: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
          getPublicUrl: () => ({ data: { publicUrl: '' } }),
        }),
      },
    } as any
  }

  const cookieStore = await cookies()

  return createServerClient<Database>(
    url,
    key,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch (error) {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

// Helper function to get the authenticated user
export const getUser = async () => {
  const supabase = await createClient()
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

// Helper function to get the session
export const getSession = async () => {
  const supabase = await createClient()
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