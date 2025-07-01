import { createClient } from '@supabase/supabase-js'
import type { Database, Design, DesignInsert, DesignUpdate } from '../../types/database'
import type { AnyCanvasElement, CanvasState } from '../../store/editor'

// Get Supabase client
function getSupabaseClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Canvas data structure for saving
export interface CanvasData {
  canvas: CanvasState
  elements: AnyCanvasElement[]
  version: string
  timestamp: number
}

// Design save options
export interface SaveDesignOptions {
  title: string
  description?: string
  templateId?: string
  isPublic?: boolean
  generatePreview?: boolean
  canvasData: CanvasData
}

// Design query options
export interface DesignQueryOptions {
  limit?: number
  offset?: number
  sortBy?: 'created_at' | 'updated_at' | 'title'
  sortOrder?: 'asc' | 'desc'
  isPublic?: boolean
  templateId?: string
  search?: string
}

// Save a new design
export async function saveDesign(options: SaveDesignOptions): Promise<{ design: Design | null; error: string | null }> {
  try {
    const supabase = getSupabaseClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { design: null, error: 'User not authenticated' }
    }

    // Generate preview URL if requested
    let previewUrl: string | null = null
    if (options.generatePreview) {
      // This will be implemented when we create the preview generation
      previewUrl = await generateDesignPreview(options.canvasData)
    }

    const designData: DesignInsert = {
      user_id: user.id,
      title: options.title,
      description: options.description || null,
      canvas_data: options.canvasData as any,
      preview_url: previewUrl,
      template_id: options.templateId || null,
      is_public: options.isPublic || false
    }

    const { data, error } = await supabase
      .from('designs')
      .insert(designData)
      .select()
      .single()

    if (error) {
      console.error('Error saving design:', error)
      return { design: null, error: error.message }
    }

    return { design: data, error: null }
  } catch (err: any) {
    console.error('Error saving design:', err)
    return { design: null, error: err.message || 'Failed to save design' }
  }
}

// Update an existing design
export async function updateDesign(
  designId: string, 
  updates: Partial<SaveDesignOptions>
): Promise<{ design: Design | null; error: string | null }> {
  try {
    const supabase = getSupabaseClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { design: null, error: 'User not authenticated' }
    }

    // Generate new preview if canvas data updated
    let previewUrl: string | undefined
    if (updates.canvasData && updates.generatePreview) {
      const newPreviewUrl = await generateDesignPreview(updates.canvasData)
      previewUrl = newPreviewUrl || undefined
    }

    const updateData: DesignUpdate = {
      ...(updates.title && { title: updates.title }),
      ...(updates.description !== undefined && { description: updates.description }),
      ...(updates.canvasData && { canvas_data: updates.canvasData as any }),
      ...(previewUrl && { preview_url: previewUrl }),
      ...(updates.templateId !== undefined && { template_id: updates.templateId }),
      ...(updates.isPublic !== undefined && { is_public: updates.isPublic })
    }

    const { data, error } = await supabase
      .from('designs')
      .update(updateData)
      .eq('id', designId)
      .eq('user_id', user.id) // Ensure user owns the design
      .select()
      .single()

    if (error) {
      console.error('Error updating design:', error)
      return { design: null, error: error.message }
    }

    return { design: data, error: null }
  } catch (err: any) {
    console.error('Error updating design:', err)
    return { design: null, error: err.message || 'Failed to update design' }
  }
}

// Load a specific design
export async function loadDesign(designId: string): Promise<{ design: Design | null; error: string | null }> {
  try {
    const supabase = getSupabaseClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { design: null, error: 'User not authenticated' }
    }

    const { data, error } = await supabase
      .from('designs')
      .select('*')
      .eq('id', designId)
      .or(`user_id.eq.${user.id},is_public.eq.true`) // User's own designs or public designs
      .single()

    if (error) {
      console.error('Error loading design:', error)
      return { design: null, error: error.message }
    }

    return { design: data, error: null }
  } catch (err: any) {
    console.error('Error loading design:', err)
    return { design: null, error: err.message || 'Failed to load design' }
  }
}

// Get user's designs
export async function getUserDesigns(options: DesignQueryOptions = {}): Promise<{ designs: Design[]; error: string | null; count?: number }> {
  try {
    const supabase = getSupabaseClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { designs: [], error: 'User not authenticated' }
    }

    const {
      limit = 20,
      offset = 0,
      sortBy = 'updated_at',
      sortOrder = 'desc',
      isPublic,
      templateId,
      search
    } = options

    let query = supabase
      .from('designs')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)

    // Apply filters
    if (isPublic !== undefined) {
      query = query.eq('is_public', isPublic)
    }

    if (templateId) {
      query = query.eq('template_id', templateId)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Apply sorting and pagination
    query = query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching designs:', error)
      return { designs: [], error: error.message }
    }

    return { designs: data || [], error: null, count: count || 0 }
  } catch (err: any) {
    console.error('Error fetching designs:', err)
    return { designs: [], error: err.message || 'Failed to fetch designs' }
  }
}

// Get public designs
export async function getPublicDesigns(options: DesignQueryOptions = {}): Promise<{ designs: Design[]; error: string | null; count?: number }> {
  try {
    const supabase = getSupabaseClient()

    const {
      limit = 20,
      offset = 0,
      sortBy = 'updated_at',
      sortOrder = 'desc',
      templateId,
      search
    } = options

    let query = supabase
      .from('designs')
      .select('*', { count: 'exact' })
      .eq('is_public', true)

    // Apply filters
    if (templateId) {
      query = query.eq('template_id', templateId)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Apply sorting and pagination
    query = query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching public designs:', error)
      return { designs: [], error: error.message }
    }

    return { designs: data || [], error: null, count: count || 0 }
  } catch (err: any) {
    console.error('Error fetching public designs:', err)
    return { designs: [], error: err.message || 'Failed to fetch public designs' }
  }
}

// Delete a design
export async function deleteDesign(designId: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = getSupabaseClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { success: false, error: 'User not authenticated' }
    }

    // First, get the design to check if user owns it and to get preview URL for cleanup
    const { data: design, error: fetchError } = await supabase
      .from('designs')
      .select('preview_url')
      .eq('id', designId)
      .eq('user_id', user.id)
      .single()

    if (fetchError) {
      return { success: false, error: fetchError.message }
    }

    // Delete the design
    const { error: deleteError } = await supabase
      .from('designs')
      .delete()
      .eq('id', designId)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Error deleting design:', deleteError)
      return { success: false, error: deleteError.message }
    }

    // Clean up preview image if it exists
    if (design.preview_url) {
      await deleteDesignPreview(design.preview_url)
    }

    return { success: true, error: null }
  } catch (err: any) {
    console.error('Error deleting design:', err)
    return { success: false, error: err.message || 'Failed to delete design' }
  }
}

// Duplicate a design
export async function duplicateDesign(designId: string, newTitle?: string): Promise<{ design: Design | null; error: string | null }> {
  try {
    // First load the original design
    const { design: originalDesign, error: loadError } = await loadDesign(designId)
    if (loadError || !originalDesign) {
      return { design: null, error: loadError || 'Original design not found' }
    }

    // Create the duplicate
    const title = newTitle || `${originalDesign.title} (Copy)`
    const canvasData = (typeof originalDesign.canvas_data === 'string' 
      ? JSON.parse(originalDesign.canvas_data) 
      : originalDesign.canvas_data) as CanvasData

    const saveOptions: SaveDesignOptions = {
      title,
      description: originalDesign.description || undefined,
      templateId: originalDesign.template_id || undefined,
      isPublic: false, // Always private for duplicates
      generatePreview: true,
      canvasData
    }

    return await saveDesign(saveOptions)
  } catch (err: any) {
    console.error('Error duplicating design:', err)
    return { design: null, error: err.message || 'Failed to duplicate design' }
  }
}

// Auto-save a design (used for periodic saves)
export async function autoSaveDesign(
  designId: string | null,
  canvasData: CanvasData,
  title: string = 'Untitled Design'
): Promise<{ design: Design | null; error: string | null }> {
  try {
    if (designId) {
      // Update existing design
      return await updateDesign(designId, {
        canvasData,
        generatePreview: false // Skip preview generation for auto-saves
      })
    } else {
      // Create new design
      return await saveDesign({
        title: `${title} (Auto-saved)`,
        canvasData,
        generatePreview: false
      })
    }
  } catch (err: any) {
    console.error('Error auto-saving design:', err)
    return { design: null, error: err.message || 'Failed to auto-save design' }
  }
}

// Generate design preview (placeholder implementation)
async function generateDesignPreview(canvasData: CanvasData): Promise<string | null> {
  try {
    // TODO: Implement actual preview generation
    // This would typically involve:
    // 1. Creating a canvas with the design elements
    // 2. Rendering it to an image
    // 3. Uploading to Supabase storage
    // 4. Returning the public URL
    
    // For now, return null to indicate no preview
    return null
  } catch (err) {
    console.error('Error generating design preview:', err)
    return null
  }
}

// Delete design preview from storage
async function deleteDesignPreview(previewUrl: string): Promise<void> {
  try {
    const supabase = getSupabaseClient()
    
    // Extract file path from URL
    const url = new URL(previewUrl)
    const pathParts = url.pathname.split('/')
    const fileName = pathParts[pathParts.length - 1]
    
    // Delete from storage
    const { error } = await supabase.storage
      .from('designs')
      .remove([fileName])
    
    if (error) {
      console.error('Error deleting preview:', error)
    }
  } catch (err) {
    console.error('Error deleting preview:', err)
  }
}

// Get design statistics for user
export async function getDesignStats(): Promise<{
  stats: {
    totalDesigns: number
    publicDesigns: number
    privateDesigns: number
    recentDesigns: Design[]
  } | null
  error: string | null
}> {
  try {
    const supabase = getSupabaseClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { stats: null, error: 'User not authenticated' }
    }

    // Get total count
    const { count: totalCount, error: totalError } = await supabase
      .from('designs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if (totalError) {
      return { stats: null, error: totalError.message }
    }

    // Get public count
    const { count: publicCount, error: publicError } = await supabase
      .from('designs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_public', true)

    if (publicError) {
      return { stats: null, error: publicError.message }
    }

    // Get recent designs
    const { data: recentDesigns, error: recentError } = await supabase
      .from('designs')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(5)

    if (recentError) {
      return { stats: null, error: recentError.message }
    }

    const stats = {
      totalDesigns: totalCount || 0,
      publicDesigns: publicCount || 0,
      privateDesigns: (totalCount || 0) - (publicCount || 0),
      recentDesigns: recentDesigns || []
    }

    return { stats, error: null }
  } catch (err: any) {
    console.error('Error fetching design stats:', err)
    return { stats: null, error: err.message || 'Failed to fetch design statistics' }
  }
}

// Search designs across user's collection
export async function searchDesigns(query: string, options: DesignQueryOptions = {}): Promise<{ designs: Design[]; error: string | null }> {
  return await getUserDesigns({
    ...options,
    search: query
  })
}

// Export design data as JSON
export function exportDesignData(design: Design): string {
  const exportData = {
    id: design.id,
    title: design.title,
    description: design.description,
    canvas_data: design.canvas_data,
    created_at: design.created_at,
    updated_at: design.updated_at,
    exported_at: new Date().toISOString(),
    version: '1.0'
  }
  
  return JSON.stringify(exportData, null, 2)
}

// Import design data from JSON
export function importDesignData(jsonData: string): { canvasData: CanvasData | null; title: string; description?: string; error: string | null } {
  try {
    const data = JSON.parse(jsonData)
    
    if (!data.canvas_data) {
      return { canvasData: null, title: 'Untitled', error: 'Invalid design data: missing canvas_data' }
    }
    
    return {
      canvasData: data.canvas_data,
      title: data.title || 'Imported Design',
      description: data.description,
      error: null
    }
  } catch (err: any) {
    return { canvasData: null, title: 'Untitled', error: 'Invalid JSON data' }
  }
}