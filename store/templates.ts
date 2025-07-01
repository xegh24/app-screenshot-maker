import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { persist } from 'zustand/middleware'
import { createClient } from '@supabase/supabase-js'
import type { Database, Template } from '../types/database'
import type { AnyCanvasElement } from './editor'
import { SAMPLE_TEMPLATES } from '../lib/templates'

// Template categories
export const TEMPLATE_CATEGORIES = [
  'mobile-app',
  'web-app',
  'social-media',
  'presentation',
  'marketing',
  'portfolio',
  'blog',
  'e-commerce',
  'dashboard',
  'landing-page',
  'education',
  'food',
  'other'
] as const

export type TemplateCategory = typeof TEMPLATE_CATEGORIES[number]

// Template filters
export interface TemplateFilters {
  category: TemplateCategory | 'all'
  featured: boolean | null
  search: string
  sortBy: 'created_at' | 'name' | 'usage_count'
  sortOrder: 'asc' | 'desc'
}

// Template with canvas data
export interface TemplateWithCanvas extends Template {
  canvas_data: {
    elements: AnyCanvasElement[]
    canvas: {
      width: number
      height: number
      backgroundColor: string
    }
  }
}

// Template usage analytics
export interface TemplateUsage {
  template_id: string
  usage_count: number
  last_used: string
}

// Template state interface
export interface TemplatesState {
  // Templates data
  templates: TemplateWithCanvas[]
  featuredTemplates: TemplateWithCanvas[]
  myTemplates: TemplateWithCanvas[]
  recentTemplates: TemplateWithCanvas[]
  
  // Loading states
  isLoading: boolean
  isFetching: boolean
  
  // Error state
  error: string | null
  
  // Filters and search
  filters: TemplateFilters
  
  // Selected template
  selectedTemplate: TemplateWithCanvas | null
  
  // Template usage
  templateUsage: TemplateUsage[]
  
  // Actions
  // Fetch templates
  fetchTemplates: (filters?: Partial<TemplateFilters>) => Promise<void>
  fetchFeaturedTemplates: () => Promise<void>
  fetchMyTemplates: () => Promise<void>
  fetchRecentTemplates: () => Promise<void>
  
  // Template CRUD
  createTemplate: (template: Omit<TemplateWithCanvas, 'id' | 'created_at' | 'updated_at'>) => Promise<{ error: any; template?: TemplateWithCanvas }>
  updateTemplate: (id: string, updates: Partial<TemplateWithCanvas>) => Promise<{ error: any }>
  deleteTemplate: (id: string) => Promise<{ error: any }>
  duplicateTemplate: (id: string, name?: string) => Promise<{ error: any; template?: TemplateWithCanvas }>
  
  // Template operations
  useTemplate: (template: TemplateWithCanvas) => void
  selectTemplate: (template: TemplateWithCanvas | null) => void
  searchTemplates: (query: string) => void
  
  // Filters
  setFilters: (filters: Partial<TemplateFilters>) => void
  resetFilters: () => void
  
  // Template usage
  recordTemplateUsage: (templateId: string) => Promise<void>
  getTemplateUsage: (templateId: string) => TemplateUsage | null
  
  // Utility actions
  clearError: () => void
  setError: (error: string) => void
  
  // Helper getters
  getTemplatesByCategory: (category: TemplateCategory) => TemplateWithCanvas[]
  getPopularTemplates: () => TemplateWithCanvas[]
  getRecommendedTemplates: () => TemplateWithCanvas[]
}

// Default filters
const defaultFilters: TemplateFilters = {
  category: 'all',
  featured: null,
  search: '',
  sortBy: 'created_at',
  sortOrder: 'desc'
}

// Create the templates store
export const useTemplatesStore = create<TemplatesState>()(
  persist(
    immer((set, get) => ({
      // Initial state
      templates: [],
      featuredTemplates: [],
      myTemplates: [],
      recentTemplates: [],
      isLoading: false,
      isFetching: false,
      error: null,
      filters: defaultFilters,
      selectedTemplate: null,
      templateUsage: [],

      // Fetch templates
      fetchTemplates: async (filters) => {
        set((state) => {
          state.isFetching = true
          state.error = null
          if (filters) {
            state.filters = { ...state.filters, ...filters }
          }
        })

        try {
          // Try to fetch from Supabase if configured
          if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            const supabase = createClient<Database>(
              process.env.NEXT_PUBLIC_SUPABASE_URL!,
              process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            )

            const currentFilters = get().filters
            let query = supabase.from('templates').select('*')

            // Apply filters
            if (currentFilters.category !== 'all') {
              query = query.eq('category', currentFilters.category)
            }

            if (currentFilters.featured !== null) {
              query = query.eq('is_featured', currentFilters.featured)
            }

            if (currentFilters.search) {
              query = query.or(`name.ilike.%${currentFilters.search}%,description.ilike.%${currentFilters.search}%`)
            }

            // Apply sorting
            query = query.order(currentFilters.sortBy, { ascending: currentFilters.sortOrder === 'asc' })

            const { data, error } = await query

            if (error) {
              throw error
            }

            set((state) => {
              state.templates = data as TemplateWithCanvas[]
              state.isFetching = false
            })
          } else {
            // Fallback to sample data
            const currentFilters = get().filters
            let filteredTemplates = [...SAMPLE_TEMPLATES]

            // Apply filters
            if (currentFilters.category !== 'all') {
              filteredTemplates = filteredTemplates.filter(t => t.category === currentFilters.category)
            }

            if (currentFilters.featured !== null) {
              filteredTemplates = filteredTemplates.filter(t => t.is_featured === currentFilters.featured)
            }

            if (currentFilters.search) {
              const searchLower = currentFilters.search.toLowerCase()
              filteredTemplates = filteredTemplates.filter(t =>
                t.name.toLowerCase().includes(searchLower) ||
                t.description?.toLowerCase().includes(searchLower)
              )
            }

            // Apply sorting
            filteredTemplates.sort((a, b) => {
              const aValue = a[currentFilters.sortBy as keyof TemplateWithCanvas]
              const bValue = b[currentFilters.sortBy as keyof TemplateWithCanvas]
              
              if (currentFilters.sortOrder === 'asc') {
                return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
              } else {
                return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
              }
            })

            set((state) => {
              state.templates = filteredTemplates
              state.isFetching = false
            })
          }
        } catch (error: any) {
          // Fallback to sample data on any error
          console.warn('Failed to fetch templates from database, using sample data:', error)
          const currentFilters = get().filters
          let filteredTemplates = [...SAMPLE_TEMPLATES]

          // Apply filters to sample data
          if (currentFilters.category !== 'all') {
            filteredTemplates = filteredTemplates.filter(t => t.category === currentFilters.category)
          }

          if (currentFilters.featured !== null) {
            filteredTemplates = filteredTemplates.filter(t => t.is_featured === currentFilters.featured)
          }

          if (currentFilters.search) {
            const searchLower = currentFilters.search.toLowerCase()
            filteredTemplates = filteredTemplates.filter(t =>
              t.name.toLowerCase().includes(searchLower) ||
              t.description?.toLowerCase().includes(searchLower)
            )
          }

          set((state) => {
            state.templates = filteredTemplates
            state.isFetching = false
            state.error = null // Clear error since we have fallback data
          })
        }
      },

      fetchFeaturedTemplates: async () => {
        set((state) => {
          state.isFetching = true
          state.error = null
        })

        try {
          // Try to fetch from Supabase if configured
          if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            const supabase = createClient<Database>(
              process.env.NEXT_PUBLIC_SUPABASE_URL!,
              process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            )

            const { data, error } = await supabase
              .from('templates')
              .select('*')
              .eq('is_featured', true)
              .order('created_at', { ascending: false })
              .limit(12)

            if (error) {
              throw error
            }

            set((state) => {
              state.featuredTemplates = data as TemplateWithCanvas[]
              state.isFetching = false
            })
          } else {
            // Fallback to sample data
            const featuredTemplates = SAMPLE_TEMPLATES.filter(t => t.is_featured).slice(0, 12)
            
            set((state) => {
              state.featuredTemplates = featuredTemplates
              state.isFetching = false
            })
          }
        } catch (error: any) {
          console.warn('Failed to fetch featured templates from database, using sample data:', error)
          // Fallback to sample data
          const featuredTemplates = SAMPLE_TEMPLATES.filter(t => t.is_featured).slice(0, 12)
          
          set((state) => {
            state.featuredTemplates = featuredTemplates
            state.isFetching = false
            state.error = null
          })
        }
      },

      fetchMyTemplates: async () => {
        set((state) => {
          state.isFetching = true
          state.error = null
        })

        try {
          const supabase = createClient<Database>(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
          )

          const { data: { user } } = await supabase.auth.getUser()
          if (!user) {
            throw new Error('User not authenticated')
          }

          const { data, error } = await supabase
            .from('templates')
            .select('*')
            .eq('created_by', user.id)
            .order('created_at', { ascending: false })

          if (error) {
            throw error
          }

          set((state) => {
            state.myTemplates = data as TemplateWithCanvas[]
            state.isFetching = false
          })
        } catch (error: any) {
          set((state) => {
            state.error = error.message || 'Failed to fetch my templates'
            state.isFetching = false
          })
        }
      },

      fetchRecentTemplates: async () => {
        set((state) => {
          state.isFetching = true
          state.error = null
        })

        try {
          // Try to fetch from Supabase if configured
          if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            const supabase = createClient<Database>(
              process.env.NEXT_PUBLIC_SUPABASE_URL!,
              process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            )

            const { data, error } = await supabase
              .from('templates')
              .select('*')
              .order('created_at', { ascending: false })
              .limit(20)

            if (error) {
              throw error
            }

            set((state) => {
              state.recentTemplates = data as TemplateWithCanvas[]
              state.isFetching = false
            })
          } else {
            // Fallback to sample data
            const recentTemplates = [...SAMPLE_TEMPLATES]
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .slice(0, 20)
            
            set((state) => {
              state.recentTemplates = recentTemplates
              state.isFetching = false
            })
          }
        } catch (error: any) {
          console.warn('Failed to fetch recent templates from database, using sample data:', error)
          // Fallback to sample data
          const recentTemplates = [...SAMPLE_TEMPLATES]
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 20)
          
          set((state) => {
            state.recentTemplates = recentTemplates
            state.isFetching = false
            state.error = null
          })
        }
      },

      // Template CRUD
      createTemplate: async (template) => {
        set((state) => {
          state.isLoading = true
          state.error = null
        })

        try {
          const supabase = createClient<Database>(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
          )

          const { data: { user } } = await supabase.auth.getUser()
          if (!user) {
            throw new Error('User not authenticated')
          }

          const { data, error } = await supabase
            .from('templates')
            .insert({
              ...template,
              created_by: user.id
            })
            .select()
            .single()

          if (error) {
            throw error
          }

          const newTemplate = data as TemplateWithCanvas

          set((state) => {
            state.templates.unshift(newTemplate)
            state.myTemplates.unshift(newTemplate)
            state.isLoading = false
          })

          return { error: null, template: newTemplate }
        } catch (error: any) {
          set((state) => {
            state.error = error.message || 'Failed to create template'
            state.isLoading = false
          })
          return { error }
        }
      },

      updateTemplate: async (id, updates) => {
        set((state) => {
          state.isLoading = true
          state.error = null
        })

        try {
          const supabase = createClient<Database>(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
          )

          const { error } = await supabase
            .from('templates')
            .update(updates)
            .eq('id', id)

          if (error) {
            throw error
          }

          set((state) => {
            // Update in all relevant arrays
            const updateInArray = (array: TemplateWithCanvas[]) => {
              const index = array.findIndex(t => t.id === id)
              if (index !== -1) {
                array[index] = { ...array[index], ...updates }
              }
            }

            updateInArray(state.templates)
            updateInArray(state.featuredTemplates)
            updateInArray(state.myTemplates)
            updateInArray(state.recentTemplates)

            if (state.selectedTemplate?.id === id) {
              state.selectedTemplate = { ...state.selectedTemplate, ...updates }
            }

            state.isLoading = false
          })

          return { error: null }
        } catch (error: any) {
          set((state) => {
            state.error = error.message || 'Failed to update template'
            state.isLoading = false
          })
          return { error }
        }
      },

      deleteTemplate: async (id) => {
        set((state) => {
          state.isLoading = true
          state.error = null
        })

        try {
          const supabase = createClient<Database>(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
          )

          const { error } = await supabase
            .from('templates')
            .delete()
            .eq('id', id)

          if (error) {
            throw error
          }

          set((state) => {
            // Remove from all arrays
            state.templates = state.templates.filter(t => t.id !== id)
            state.featuredTemplates = state.featuredTemplates.filter(t => t.id !== id)
            state.myTemplates = state.myTemplates.filter(t => t.id !== id)
            state.recentTemplates = state.recentTemplates.filter(t => t.id !== id)

            if (state.selectedTemplate?.id === id) {
              state.selectedTemplate = null
            }

            state.isLoading = false
          })

          return { error: null }
        } catch (error: any) {
          set((state) => {
            state.error = error.message || 'Failed to delete template'
            state.isLoading = false
          })
          return { error }
        }
      },

      duplicateTemplate: async (id, name) => {
        set((state) => {
          state.isLoading = true
          state.error = null
        })

        try {
          const originalTemplate = get().templates.find(t => t.id === id) ||
                                   get().myTemplates.find(t => t.id === id)

          if (!originalTemplate) {
            throw new Error('Template not found')
          }

          const supabase = createClient<Database>(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
          )

          const { data: { user } } = await supabase.auth.getUser()
          if (!user) {
            throw new Error('User not authenticated')
          }

          const { data, error } = await supabase
            .from('templates')
            .insert({
              name: name || `${originalTemplate.name} (Copy)`,
              description: originalTemplate.description,
              category: originalTemplate.category,
              canvas_data: originalTemplate.canvas_data,
              preview_url: originalTemplate.preview_url,
              is_featured: false,
              created_by: user.id
            })
            .select()
            .single()

          if (error) {
            throw error
          }

          const newTemplate = data as TemplateWithCanvas

          set((state) => {
            state.templates.unshift(newTemplate)
            state.myTemplates.unshift(newTemplate)
            state.isLoading = false
          })

          return { error: null, template: newTemplate }
        } catch (error: any) {
          set((state) => {
            state.error = error.message || 'Failed to duplicate template'
            state.isLoading = false
          })
          return { error }
        }
      },

      // Template operations
      useTemplate: (template) => {
        // This will be handled by the editor store
        get().recordTemplateUsage(template.id)
      },

      selectTemplate: (template) => set((state) => {
        state.selectedTemplate = template
      }),

      searchTemplates: (query) => set((state) => {
        state.filters.search = query
      }),

      // Filters
      setFilters: (filters) => set((state) => {
        state.filters = { ...state.filters, ...filters }
      }),

      resetFilters: () => set((state) => {
        state.filters = defaultFilters
      }),

      // Template usage
      recordTemplateUsage: async (templateId) => {
        try {
          set((state) => {
            const existingUsage = state.templateUsage.find(u => u.template_id === templateId)
            if (existingUsage) {
              existingUsage.usage_count += 1
              existingUsage.last_used = new Date().toISOString()
            } else {
              state.templateUsage.push({
                template_id: templateId,
                usage_count: 1,
                last_used: new Date().toISOString()
              })
            }
          })

          // Here you could also update the server-side usage tracking
          // const supabase = createClient<Database>(...)
          // await supabase.rpc('increment_template_usage', { template_id: templateId })
        } catch (error: any) {
          console.error('Failed to record template usage:', error)
        }
      },

      getTemplateUsage: (templateId) => {
        const state = get()
        return state.templateUsage.find(u => u.template_id === templateId) || null
      },

      // Utility actions
      clearError: () => set((state) => {
        state.error = null
      }),

      setError: (error) => set((state) => {
        state.error = error
      }),

      // Helper getters
      getTemplatesByCategory: (category) => {
        const state = get()
        return state.templates.filter(t => t.category === category)
      },

      getPopularTemplates: () => {
        const state = get()
        return state.templates
          .sort((a, b) => {
            const usageA = state.templateUsage.find(u => u.template_id === a.id)?.usage_count || 0
            const usageB = state.templateUsage.find(u => u.template_id === b.id)?.usage_count || 0
            return usageB - usageA
          })
          .slice(0, 12)
      },

      getRecommendedTemplates: () => {
        const state = get()
        // Simple recommendation based on recently used templates and featured templates
        const recentlyUsed = state.templateUsage
          .sort((a, b) => new Date(b.last_used).getTime() - new Date(a.last_used).getTime())
          .slice(0, 5)
          .map(u => state.templates.find(t => t.id === u.template_id))
          .filter(Boolean) as TemplateWithCanvas[]

        const featured = state.featuredTemplates.slice(0, 7)
        
        return [...recentlyUsed, ...featured].slice(0, 12)
      }
    })),
    {
      name: 'templates-store',
      partialize: (state) => ({
        filters: state.filters,
        templateUsage: state.templateUsage
      })
    }
  )
)