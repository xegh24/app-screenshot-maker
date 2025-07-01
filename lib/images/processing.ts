// Image processing utilities for optimization and effects

export interface ImageFilters {
  brightness: number
  contrast: number
  saturation: number
  blur: number
  grayscale: number
  sepia: number
  hue: number
  invert: number
}

export interface ImageDimensions {
  width: number
  height: number
}

export interface OptimizationOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  format?: 'jpeg' | 'png' | 'webp'
  maintainAspectRatio?: boolean
}

// Default filter values
export const DEFAULT_FILTERS: ImageFilters = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  blur: 0,
  grayscale: 0,
  sepia: 0,
  hue: 0,
  invert: 0
}

// Convert filters to CSS filter string
export function filtersToCSS(filters: Partial<ImageFilters>): string {
  const filterArray: string[] = []
  
  if (filters.brightness !== undefined && filters.brightness !== 100) {
    filterArray.push(`brightness(${filters.brightness}%)`)
  }
  
  if (filters.contrast !== undefined && filters.contrast !== 100) {
    filterArray.push(`contrast(${filters.contrast}%)`)
  }
  
  if (filters.saturation !== undefined && filters.saturation !== 100) {
    filterArray.push(`saturate(${filters.saturation}%)`)
  }
  
  if (filters.blur !== undefined && filters.blur > 0) {
    filterArray.push(`blur(${filters.blur}px)`)
  }
  
  if (filters.grayscale !== undefined && filters.grayscale > 0) {
    filterArray.push(`grayscale(${filters.grayscale}%)`)
  }
  
  if (filters.sepia !== undefined && filters.sepia > 0) {
    filterArray.push(`sepia(${filters.sepia}%)`)
  }
  
  if (filters.hue !== undefined && filters.hue !== 0) {
    filterArray.push(`hue-rotate(${filters.hue}deg)`)
  }
  
  if (filters.invert !== undefined && filters.invert > 0) {
    filterArray.push(`invert(${filters.invert}%)`)
  }
  
  return filterArray.join(' ')
}

// Get image dimensions from file
export function getImageDimensions(file: File): Promise<ImageDimensions> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)
    
    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      })
    }
    
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Failed to load image'))
    }
    
    img.src = objectUrl
  })
}

// Get image dimensions from URL
export function getImageDimensionsFromUrl(url: string): Promise<ImageDimensions> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      })
    }
    
    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }
    
    // Handle CORS for external images
    img.crossOrigin = 'anonymous'
    img.src = url
  })
}

// Calculate optimal dimensions maintaining aspect ratio
export function calculateOptimalDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth?: number,
  maxHeight?: number
): ImageDimensions {
  let newWidth = originalWidth
  let newHeight = originalHeight
  
  // Calculate aspect ratio
  const aspectRatio = originalWidth / originalHeight
  
  // Apply width constraint
  if (maxWidth && newWidth > maxWidth) {
    newWidth = maxWidth
    newHeight = maxWidth / aspectRatio
  }
  
  // Apply height constraint
  if (maxHeight && newHeight > maxHeight) {
    newHeight = maxHeight
    newWidth = maxHeight * aspectRatio
  }
  
  return {
    width: Math.round(newWidth),
    height: Math.round(newHeight)
  }
}

// Optimize image using canvas
export function optimizeImage(
  file: File,
  options: OptimizationOptions = {}
): Promise<{ blob: Blob; dimensions: ImageDimensions }> {
  return new Promise((resolve, reject) => {
    const {
      maxWidth = 2048,
      maxHeight = 2048,
      quality = 0.9,
      format = 'jpeg',
      maintainAspectRatio = true
    } = options
    
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      reject(new Error('Could not get canvas context'))
      return
    }
    
    img.onload = () => {
      try {
        const originalDimensions = {
          width: img.naturalWidth,
          height: img.naturalHeight
        }
        
        // Calculate new dimensions
        const newDimensions = maintainAspectRatio
          ? calculateOptimalDimensions(
              originalDimensions.width,
              originalDimensions.height,
              maxWidth,
              maxHeight
            )
          : { width: maxWidth, height: maxHeight }
        
        // Set canvas size
        canvas.width = newDimensions.width
        canvas.height = newDimensions.height
        
        // Configure context for better quality
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        
        // Draw image
        ctx.drawImage(
          img,
          0,
          0,
          originalDimensions.width,
          originalDimensions.height,
          0,
          0,
          newDimensions.width,
          newDimensions.height
        )
        
        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve({ blob, dimensions: newDimensions })
            } else {
              reject(new Error('Failed to create blob'))
            }
          },
          `image/${format}`,
          quality
        )
      } catch (error) {
        reject(error)
      }
    }
    
    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }
    
    img.src = URL.createObjectURL(file)
  })
}

// Apply filters to image using canvas
export function applyFiltersToImage(
  imageUrl: string,
  filters: Partial<ImageFilters>,
  dimensions?: ImageDimensions
): Promise<{ blob: Blob; canvas: HTMLCanvasElement }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      reject(new Error('Could not get canvas context'))
      return
    }
    
    img.onload = () => {
      try {
        // Set canvas size
        canvas.width = dimensions?.width || img.naturalWidth
        canvas.height = dimensions?.height || img.naturalHeight
        
        // Apply filters
        ctx.filter = filtersToCSS(filters)
        
        // Draw image with filters
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        
        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve({ blob, canvas })
            } else {
              reject(new Error('Failed to create blob'))
            }
          },
          'image/png'
        )
      } catch (error) {
        reject(error)
      }
    }
    
    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }
    
    img.crossOrigin = 'anonymous'
    img.src = imageUrl
  })
}

// Generate thumbnail
export function generateThumbnail(
  file: File,
  size: number = 200,
  quality: number = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      reject(new Error('Could not get canvas context'))
      return
    }
    
    img.onload = () => {
      try {
        // Calculate thumbnail dimensions (square crop from center)
        const { width, height } = img
        const minDimension = Math.min(width, height)
        const cropX = (width - minDimension) / 2
        const cropY = (height - minDimension) / 2
        
        // Set canvas size
        canvas.width = size
        canvas.height = size
        
        // Configure context
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        
        // Draw cropped and resized image
        ctx.drawImage(
          img,
          cropX,
          cropY,
          minDimension,
          minDimension,
          0,
          0,
          size,
          size
        )
        
        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Failed to create thumbnail'))
            }
          },
          'image/jpeg',
          quality
        )
      } catch (error) {
        reject(error)
      }
    }
    
    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }
    
    img.src = URL.createObjectURL(file)
  })
}

// Validate image file
export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  const validTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml'
  ]
  
  // Check file type
  if (!validTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Invalid file type. Please upload a valid image file (JPEG, PNG, GIF, WebP, or SVG).'
    }
  }
  
  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'File size exceeds 10MB limit.'
    }
  }
  
  // Check minimum dimensions for non-SVG files
  if (file.type !== 'image/svg+xml') {
    // This would require loading the image, so we'll do basic validation here
    // and handle dimension validation in the upload process
  }
  
  return { isValid: true }
}

// Get file size in human readable format
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

// Create a preview URL for a file
export function createPreviewUrl(file: File): string {
  return URL.createObjectURL(file)
}

// Cleanup preview URL
export function revokePreviewUrl(url: string): void {
  URL.revokeObjectURL(url)
}

// Color analysis utilities
export function analyzeImageColors(
  imageUrl: string,
  sampleSize: number = 10
): Promise<{ dominantColors: string[]; averageColor: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      reject(new Error('Could not get canvas context'))
      return
    }
    
    img.onload = () => {
      try {
        canvas.width = img.width
        canvas.height = img.height
        
        ctx.drawImage(img, 0, 0)
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data
        
        // Sample colors from the image
        const colors: { [color: string]: number } = {}
        let totalR = 0, totalG = 0, totalB = 0
        let pixelCount = 0
        
        // Sample every nth pixel to avoid processing every pixel
        const step = Math.max(1, Math.floor(data.length / (sampleSize * sampleSize * 4)))
        
        for (let i = 0; i < data.length; i += step * 4) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]
          const a = data[i + 3]
          
          // Skip transparent pixels
          if (a < 128) continue
          
          // Convert to hex color
          const color = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
          colors[color] = (colors[color] || 0) + 1
          
          totalR += r
          totalG += g
          totalB += b
          pixelCount++
        }
        
        // Get dominant colors
        const sortedColors = Object.entries(colors)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([color]) => color)
        
        // Calculate average color
        const avgR = Math.round(totalR / pixelCount)
        const avgG = Math.round(totalG / pixelCount)
        const avgB = Math.round(totalB / pixelCount)
        const averageColor = `#${((1 << 24) + (avgR << 16) + (avgG << 8) + avgB).toString(16).slice(1)}`
        
        resolve({
          dominantColors: sortedColors,
          averageColor
        })
      } catch (error) {
        reject(error)
      }
    }
    
    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }
    
    img.crossOrigin = 'anonymous'
    img.src = imageUrl
  })
}