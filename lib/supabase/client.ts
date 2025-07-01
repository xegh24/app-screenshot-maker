import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '../../types/database'

export const createClient = () =>
  createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

// Default client instance for browser usage
export const supabase = createClient()