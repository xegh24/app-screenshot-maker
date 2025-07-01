import { createClient as createServerClient } from './server'
import { createClient } from './client'
import type { 
  Design, 
  DesignInsert, 
  DesignUpdate,
  Template,
  TemplateInsert,
  TemplateUpdate,
  UserUpload,
  UserUploadInsert,
  UploadType
} from '../../types/database'

// Design queries
export const getDesigns = async (userId?: string) => {
  const supabase = await createServerClient()
  let query = supabase
    .from('designs')
    .select(`
      *,
      templates (
        id,
        name,
        category
      )
    `)
    .order('updated_at', { ascending: false })

  if (userId) {
    query = query.eq('user_id', userId)
  } else {
    query = query.eq('is_public', true)
  }

  return await query
}

export const getDesign = async (id: string) => {
  const supabase = await createServerClient()
  return await supabase
    .from('designs')
    .select(`
      *,
      templates (
        id,
        name,
        category
      )
    `)
    .eq('id', id)
    .single()
}

export const createDesign = async (design: DesignInsert) => {
  const supabase = createClient()
  return await supabase
    .from('designs')
    .insert(design)
    .select()
    .single()
}

export const updateDesign = async (id: string, updates: DesignUpdate) => {
  const supabase = createClient()
  return await supabase
    .from('designs')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
}

export const deleteDesign = async (id: string) => {
  const supabase = createClient()
  return await supabase
    .from('designs')
    .delete()
    .eq('id', id)
}

// Template queries
export const getTemplates = async (category?: string) => {
  const supabase = await createServerClient()
  let query = supabase
    .from('templates')
    .select('*')
    .order('created_at', { ascending: false })

  if (category) {
    query = query.eq('category', category)
  }

  return await query
}

export const getFeaturedTemplates = async () => {
  const supabase = await createServerClient()
  return await supabase
    .from('templates')
    .select('*')
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
}

export const getTemplate = async (id: string) => {
  const supabase = await createServerClient()
  return await supabase
    .from('templates')
    .select('*')
    .eq('id', id)
    .single()
}

export const createTemplate = async (template: TemplateInsert) => {
  const supabase = createClient()
  return await supabase
    .from('templates')
    .insert(template)
    .select()
    .single()
}

export const updateTemplate = async (id: string, updates: TemplateUpdate) => {
  const supabase = createClient()
  return await supabase
    .from('templates')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
}

export const deleteTemplate = async (id: string) => {
  const supabase = createClient()
  return await supabase
    .from('templates')
    .delete()
    .eq('id', id)
}

// User uploads queries
export const getUserUploads = async (userId: string, uploadType?: UploadType) => {
  const supabase = await createServerClient()
  let query = supabase
    .from('user_uploads')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (uploadType) {
    query = query.eq('upload_type', uploadType)
  }

  return await query
}

export const createUserUpload = async (upload: UserUploadInsert) => {
  const supabase = createClient()
  return await supabase
    .from('user_uploads')
    .insert(upload)
    .select()
    .single()
}

export const deleteUserUpload = async (id: string) => {
  const supabase = createClient()
  return await supabase
    .from('user_uploads')
    .delete()
    .eq('id', id)
}

// Search and filter functions
export const searchDesigns = async (query: string, isPublic = true) => {
  const supabase = await createServerClient()
  return await supabase
    .from('designs')
    .select(`
      *,
      templates (
        id,
        name,
        category
      )
    `)
    .eq('is_public', isPublic)
    .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
    .order('updated_at', { ascending: false })
}

export const searchTemplates = async (query: string) => {
  const supabase = await createServerClient()
  return await supabase
    .from('templates')
    .select('*')
    .or(`name.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
    .order('created_at', { ascending: false })
}

// Analytics/Stats functions
export const getUserStats = async (userId: string) => {
  const supabase = await createServerClient()
  
  const [designsResult, uploadsResult] = await Promise.all([
    supabase
      .from('designs')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId),
    supabase
      .from('user_uploads')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
  ])

  return {
    designCount: designsResult.count || 0,
    uploadCount: uploadsResult.count || 0,
  }
}

export const getTemplateCategories = async () => {
  const supabase = await createServerClient()
  const { data } = await supabase
    .from('templates')
    .select('category')
    .order('category')

  // Get unique categories
  const categories = [...new Set(data?.map(item => item.category) || [])]
  return categories
}