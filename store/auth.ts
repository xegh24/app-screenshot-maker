import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { persist } from 'zustand/middleware'
// Import supabase lazily to avoid build-time initialization
let supabaseClient: any = null
const getSupabase = () => {
  if (!supabaseClient) {
    const { supabase } = require('@/lib/supabase/client')
    supabaseClient = supabase
  }
  return supabaseClient
}
import type { User, Session, AuthError } from '@supabase/supabase-js'
import type { Database } from '../types/database'

// User profile interface
export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
  plan: 'free' | 'pro' | 'enterprise'
  usage: {
    designs_created: number
    designs_limit: number
    storage_used: number
    storage_limit: number
  }
}

// Authentication state interface
export interface AuthState {
  // User state
  user: User | null
  session: Session | null
  profile: UserProfile | null
  
  // Loading states
  isLoading: boolean
  isInitialized: boolean
  
  // Error states
  error: string | null
  
  // Actions
  // Initialize auth
  initialize: () => Promise<void>
  
  // Authentication actions
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: AuthError | null }>
  signInWithProvider: (provider: 'google' | 'github') => Promise<{ error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
  
  // Password actions
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
  updatePassword: (password: string) => Promise<{ error: AuthError | null }>
  
  // Profile actions
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: any }>
  refreshProfile: () => Promise<void>
  uploadAvatar: (file: File) => Promise<{ error: any; url?: string }>
  
  // Session actions
  refreshSession: () => Promise<void>
  
  // Utility actions
  clearError: () => void
  setError: (error: string) => void
  
  // Helper getters
  isAuthenticated: () => boolean
  isPro: () => boolean
  canCreateDesign: () => boolean
  getRemainingDesigns: () => number
  getStorageUsage: () => { used: number; limit: number; percentage: number }
}

// Create the auth store
export const useAuthStore = create<AuthState>()(
  persist(
    immer((set, get) => ({
      // Initial state
      user: null,
      session: null,
      profile: null,
      isLoading: false,
      isInitialized: false,
      error: null,

      // Initialize auth
      initialize: async () => {
        set((state) => {
          state.isLoading = true
          state.error = null
        })

        try {
          // Get initial session
          const { data: { session }, error } = await getSupabase().auth.getSession()
          
          if (error) {
            throw error
          }

          if (session) {
            set((state) => {
              state.session = session
              state.user = session.user
            })
            
            // Fetch user profile
            await get().refreshProfile()
          }

          // Set up auth state change listener
          getSupabase().auth.onAuthStateChange(async (event: any, session: any) => {
            set((state) => {
              state.session = session
              state.user = session?.user || null
            })

            if (session?.user) {
              await get().refreshProfile()
            } else {
              set((state) => {
                state.profile = null
              })
            }
          })

          set((state) => {
            state.isInitialized = true
            state.isLoading = false
          })
        } catch (error: any) {
          set((state) => {
            state.error = error.message || 'Failed to initialize authentication'
            state.isLoading = false
            state.isInitialized = true
          })
        }
      },

      // Authentication actions
      signIn: async (email, password) => {
        set((state) => {
          state.isLoading = true
          state.error = null
        })

        try {
          const { data, error } = await getSupabase().auth.signInWithPassword({
            email,
            password
          })

          if (error) {
            set((state) => {
              state.error = error.message
              state.isLoading = false
            })
            return { error }
          }

          set((state) => {
            state.user = data.user
            state.session = data.session
            state.isLoading = false
          })

          // Fetch user profile
          await get().refreshProfile()

          return { error: null }
        } catch (error: any) {
          set((state) => {
            state.error = error.message || 'Sign in failed'
            state.isLoading = false
          })
          return { error: error as AuthError }
        }
      },

      signUp: async (email, password, fullName) => {
        set((state) => {
          state.isLoading = true
          state.error = null
        })

        try {
          const { data, error } = await getSupabase().auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName || ''
              }
            }
          })

          if (error) {
            set((state) => {
              state.error = error.message
              state.isLoading = false
            })
            return { error }
          }

          set((state) => {
            state.user = data.user
            state.session = data.session
            state.isLoading = false
          })

          return { error: null }
        } catch (error: any) {
          set((state) => {
            state.error = error.message || 'Sign up failed'
            state.isLoading = false
          })
          return { error: error as AuthError }
        }
      },

      signInWithProvider: async (provider) => {
        set((state) => {
          state.isLoading = true
          state.error = null
        })

        try {
          const { data, error } = await getSupabase().auth.signInWithOAuth({
            provider,
            options: {
              redirectTo: `${window.location.origin}/auth/callback`
            }
          })

          if (error) {
            set((state) => {
              state.error = error.message
              state.isLoading = false
            })
            return { error }
          }

          return { error: null }
        } catch (error: any) {
          set((state) => {
            state.error = error.message || 'Provider sign in failed'
            state.isLoading = false
          })
          return { error: error as AuthError }
        }
      },

      signOut: async () => {
        set((state) => {
          state.isLoading = true
          state.error = null
        })

        try {
          const { error } = await getSupabase().auth.signOut()

          if (error) {
            set((state) => {
              state.error = error.message
              state.isLoading = false
            })
            return { error }
          }

          set((state) => {
            state.user = null
            state.session = null
            state.profile = null
            state.isLoading = false
          })

          return { error: null }
        } catch (error: any) {
          set((state) => {
            state.error = error.message || 'Sign out failed'
            state.isLoading = false
          })
          return { error: error as AuthError }
        }
      },

      // Password actions
      resetPassword: async (email) => {
        set((state) => {
          state.isLoading = true
          state.error = null
        })

        try {
          const { error } = await getSupabase().auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/reset-password`
          })

          if (error) {
            set((state) => {
              state.error = error.message
              state.isLoading = false
            })
            return { error }
          }

          set((state) => {
            state.isLoading = false
          })

          return { error: null }
        } catch (error: any) {
          set((state) => {
            state.error = error.message || 'Password reset failed'
            state.isLoading = false
          })
          return { error: error as AuthError }
        }
      },

      updatePassword: async (password) => {
        set((state) => {
          state.isLoading = true
          state.error = null
        })

        try {
          const { error } = await getSupabase().auth.updateUser({
            password
          })

          if (error) {
            set((state) => {
              state.error = error.message
              state.isLoading = false
            })
            return { error }
          }

          set((state) => {
            state.isLoading = false
          })

          return { error: null }
        } catch (error: any) {
          set((state) => {
            state.error = error.message || 'Password update failed'
            state.isLoading = false
          })
          return { error: error as AuthError }
        }
      },

      // Profile actions
      updateProfile: async (updates) => {
        set((state) => {
          state.isLoading = true
          state.error = null
        })

        try {
          const { error } = await getSupabase().auth.updateUser({
            data: updates
          })

          if (error) {
            set((state) => {
              state.error = error.message
              state.isLoading = false
            })
            return { error }
          }

          // Update local profile
          set((state) => {
            if (state.profile) {
              state.profile = { ...state.profile, ...updates }
            }
            state.isLoading = false
          })

          return { error: null }
        } catch (error: any) {
          set((state) => {
            state.error = error.message || 'Profile update failed'
            state.isLoading = false
          })
          return { error }
        }
      },

      refreshProfile: async () => {
        const state = get()
        if (!state.user) return

        try {
          // Note: This would require a user profiles table in your database
          // For now, we'll create a mock profile from the auth user
          const profile: UserProfile = {
            id: state.user.id,
            email: state.user.email || '',
            full_name: state.user.user_metadata?.full_name || null,
            avatar_url: state.user.user_metadata?.avatar_url || null,
            created_at: state.user.created_at,
            updated_at: state.user.updated_at || state.user.created_at,
            plan: 'free',
            usage: {
              designs_created: 0,
              designs_limit: 10,
              storage_used: 0,
              storage_limit: 100 * 1024 * 1024 // 100MB
            }
          }

          set((state) => {
            state.profile = profile
          })
        } catch (error: any) {
          console.error('Failed to refresh profile:', error)
        }
      },

      uploadAvatar: async (file) => {
        set((state) => {
          state.isLoading = true
          state.error = null
        })

        try {
          const fileExt = file.name.split('.').pop()
          const fileName = `${get().user?.id}-${Date.now()}.${fileExt}`

          const { data, error } = await getSupabase().storage
            .from('avatars')
            .upload(fileName, file)

          if (error) {
            set((state) => {
              state.error = error.message
              state.isLoading = false
            })
            return { error }
          }

          const { data: { publicUrl } } = getSupabase().storage
            .from('avatars')
            .getPublicUrl(fileName)

          // Update user metadata
          await getSupabase().auth.updateUser({
            data: { avatar_url: publicUrl }
          })

          set((state) => {
            if (state.profile) {
              state.profile.avatar_url = publicUrl
            }
            state.isLoading = false
          })

          return { error: null, url: publicUrl }
        } catch (error: any) {
          set((state) => {
            state.error = error.message || 'Avatar upload failed'
            state.isLoading = false
          })
          return { error }
        }
      },

      // Session actions
      refreshSession: async () => {
        try {
          const { data, error } = await getSupabase().auth.refreshSession()

          if (error) {
            throw error
          }

          set((state) => {
            state.session = data.session
            state.user = data.user
          })
        } catch (error: any) {
          console.error('Failed to refresh session:', error)
        }
      },

      // Utility actions
      clearError: () => set((state) => {
        state.error = null
      }),

      setError: (error) => set((state) => {
        state.error = error
      }),

      // Helper getters
      isAuthenticated: () => {
        const state = get()
        return !!state.user && !!state.session
      },

      isPro: () => {
        const state = get()
        return state.profile?.plan === 'pro' || state.profile?.plan === 'enterprise'
      },

      canCreateDesign: () => {
        const state = get()
        if (!state.profile) return false
        return state.profile.usage.designs_created < state.profile.usage.designs_limit
      },

      getRemainingDesigns: () => {
        const state = get()
        if (!state.profile) return 0
        return Math.max(0, state.profile.usage.designs_limit - state.profile.usage.designs_created)
      },

      getStorageUsage: () => {
        const state = get()
        if (!state.profile) {
          return { used: 0, limit: 0, percentage: 0 }
        }
        
        const { storage_used, storage_limit } = state.profile.usage
        const percentage = storage_limit > 0 ? (storage_used / storage_limit) * 100 : 0
        
        return {
          used: storage_used,
          limit: storage_limit,
          percentage: Math.round(percentage)
        }
      }
    })),
    {
      name: 'auth-store',
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        profile: state.profile
      })
    }
  )
)