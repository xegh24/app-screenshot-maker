import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '../../types/database'

export const createClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!url || !key) {
    // Return a mock client during build time or when env vars are missing
    return {
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
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
  
  return createBrowserClient<Database>(url, key)
}

// Default client instance for browser usage
export const supabase = createClient()