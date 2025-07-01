import { supabase } from '../supabase/client'
import { v4 as uuidv4 } from 'uuid'

export interface Asset {
  id: string
  user_id: string
  file_name: string
  file_path: string
  file_size: number
  file_type: string
  upload_type: 'image' | 'background' | 'asset'
  created_at: string
  url?: string
}

export interface UploadOptions {
  onProgress?: (progress: number) => void
  folder?: string
  uploadType?: 'image' | 'background' | 'asset'
}

export interface UploadResult {
  success: boolean
  asset?: Asset
  error?: string
}

// Helper to get file extension
const getFileExtension = (filename: string): string => {
  const parts = filename.split('.')
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ''
}

// Helper to validate file type
const isValidImageType = (file: File): boolean => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
  return validTypes.includes(file.type)
}

// Helper to generate unique file name
const generateUniqueFileName = (originalName: string, userId: string): string => {
  const timestamp = Date.now()
  const uuid = uuidv4().slice(0, 8)
  const extension = getFileExtension(originalName)
  const safeName = originalName.replace(/[^a-zA-Z0-9]/g, '-').slice(0, 50)
  return `${userId}/${timestamp}-${uuid}-${safeName}.${extension}`
}

// Upload a single file
export async function uploadAsset(
  file: File,
  options: UploadOptions = {}
): Promise<UploadResult> {
  try {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'User not authenticated' }
    }

    // Validate file type
    if (!isValidImageType(file)) {
      return { success: false, error: 'Invalid file type. Only images are allowed.' }
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return { success: false, error: 'File size exceeds 10MB limit.' }
    }

    // Generate unique file path
    const folder = options.folder || 'images'
    const fileName = generateUniqueFileName(file.name, user.id)
    const filePath = `${folder}/${fileName}`

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return { success: false, error: uploadError.message }
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('uploads')
      .getPublicUrl(filePath)

    // Save file metadata to database
    const { data: assetData, error: dbError } = await supabase
      .from('user_uploads')
      .insert({
        user_id: user.id,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        file_type: file.type,
        upload_type: options.uploadType || 'image'
      })
      .select()
      .single()

    if (dbError) {
      // Try to delete the uploaded file if database insert fails
      await supabase.storage.from('uploads').remove([filePath])
      console.error('Database error:', dbError)
      return { success: false, error: 'Failed to save file metadata' }
    }

    return {
      success: true,
      asset: {
        ...assetData,
        url: publicUrl
      }
    }
  } catch (error) {
    console.error('Upload error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// Upload multiple files
export async function uploadAssets(
  files: File[],
  options: UploadOptions = {}
): Promise<UploadResult[]> {
  const results: UploadResult[] = []
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    
    // Calculate progress for individual file
    if (options.onProgress) {
      const overallProgress = ((i / files.length) * 100)
      options.onProgress(overallProgress)
    }
    
    const result = await uploadAsset(file, options)
    results.push(result)
  }
  
  if (options.onProgress) {
    options.onProgress(100)
  }
  
  return results
}

// Get user's assets
export async function getUserAssets(
  uploadType?: 'image' | 'background' | 'asset',
  limit: number = 50,
  offset: number = 0
): Promise<{ assets: Asset[], count: number, error?: string }> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { assets: [], count: 0, error: 'User not authenticated' }
    }

    let query = supabase
      .from('user_uploads')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (uploadType) {
      query = query.eq('upload_type', uploadType)
    }

    const { data, count, error } = await query

    if (error) {
      console.error('Fetch error:', error)
      return { assets: [], count: 0, error: error.message }
    }

    // Add public URLs to assets
    const assetsWithUrls = (data || []).map(asset => {
      const { data: { publicUrl } } = supabase.storage
        .from('uploads')
        .getPublicUrl(asset.file_path)
      
      return {
        ...asset,
        url: publicUrl
      }
    })

    return { assets: assetsWithUrls, count: count || 0 }
  } catch (error) {
    console.error('Fetch error:', error)
    return { assets: [], count: 0, error: 'An unexpected error occurred' }
  }
}

// Delete an asset
export async function deleteAsset(assetId: string): Promise<{ success: boolean, error?: string }> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'User not authenticated' }
    }

    // Get asset details first
    const { data: asset, error: fetchError } = await supabase
      .from('user_uploads')
      .select('*')
      .eq('id', assetId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !asset) {
      return { success: false, error: 'Asset not found' }
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('uploads')
      .remove([asset.file_path])

    if (storageError) {
      console.error('Storage delete error:', storageError)
      // Continue with database deletion even if storage deletion fails
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('user_uploads')
      .delete()
      .eq('id', assetId)
      .eq('user_id', user.id)

    if (dbError) {
      console.error('Database delete error:', dbError)
      return { success: false, error: 'Failed to delete asset metadata' }
    }

    return { success: true }
  } catch (error) {
    console.error('Delete error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// Delete multiple assets
export async function deleteAssets(assetIds: string[]): Promise<{ success: boolean, error?: string }> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'User not authenticated' }
    }

    // Get assets details
    const { data: assets, error: fetchError } = await supabase
      .from('user_uploads')
      .select('*')
      .in('id', assetIds)
      .eq('user_id', user.id)

    if (fetchError || !assets || assets.length === 0) {
      return { success: false, error: 'Assets not found' }
    }

    // Delete from storage
    const filePaths = assets.map(asset => asset.file_path)
    const { error: storageError } = await supabase.storage
      .from('uploads')
      .remove(filePaths)

    if (storageError) {
      console.error('Storage delete error:', storageError)
      // Continue with database deletion even if storage deletion fails
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('user_uploads')
      .delete()
      .in('id', assetIds)
      .eq('user_id', user.id)

    if (dbError) {
      console.error('Database delete error:', dbError)
      return { success: false, error: 'Failed to delete asset metadata' }
    }

    return { success: true }
  } catch (error) {
    console.error('Delete error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// Get storage usage for user
export async function getStorageUsage(): Promise<{ used: number, limit: number, percentage: number }> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { used: 0, limit: 0, percentage: 0 }
    }

    const { data, error } = await supabase
      .from('user_uploads')
      .select('file_size')
      .eq('user_id', user.id)

    if (error) {
      console.error('Usage fetch error:', error)
      return { used: 0, limit: 0, percentage: 0 }
    }

    const used = data?.reduce((total, item) => total + (item.file_size || 0), 0) || 0
    const limit = 500 * 1024 * 1024 // 500MB limit per user
    const percentage = Math.min((used / limit) * 100, 100)

    return { used, limit, percentage }
  } catch (error) {
    console.error('Usage calculation error:', error)
    return { used: 0, limit: 0, percentage: 0 }
  }
}