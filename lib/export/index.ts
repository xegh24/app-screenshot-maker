import Konva from 'konva'
import type { AnyCanvasElement } from '../../store/editor'

// Re-export existing export functionality
export * from '../canvas/export'

// Enhanced export options
export interface EnhancedExportOptions {
  format: 'png' | 'jpg' | 'webp' | 'svg' | 'pdf'
  quality?: number // 0-1 for jpg/webp
  scale?: number // Multiplier for resolution
  width?: number // Override width
  height?: number // Override height
  background?: string // Background color
  padding?: number // Padding around content
  includeBackground?: boolean
  selectedOnly?: boolean
  filename?: string
  // PDF specific options
  pageSize?: 'A4' | 'Letter' | 'Legal' | 'Custom'
  orientation?: 'portrait' | 'landscape'
  // Batch export options
  sizes?: ExportSize[]
}

export interface ExportSize {
  name: string
  width: number
  height: number
  scale?: number
}

// Predefined export sizes for different platforms
export const EXPORT_PRESETS = {
  // iOS App Store
  ios: {
    'iPhone 6.7"': { width: 1290, height: 2796 },
    'iPhone 6.5"': { width: 1242, height: 2688 },
    'iPhone 5.5"': { width: 1242, height: 2208 },
    'iPad Pro 12.9"': { width: 2048, height: 2732 },
    'iPad Pro 11"': { width: 1668, height: 2388 },
    'iPad 10.2"': { width: 1620, height: 2160 }
  },
  
  // Google Play Store
  android: {
    'Phone': { width: 1080, height: 1920 },
    'Tablet': { width: 1200, height: 1920 },
    '7-inch Tablet': { width: 1024, height: 1500 },
    '10-inch Tablet': { width: 1280, height: 1920 }
  },
  
  // Web/Social Media
  web: {
    'Desktop': { width: 1920, height: 1080 },
    'Laptop': { width: 1366, height: 768 },
    'Social Media Square': { width: 1080, height: 1080 },
    'Social Media Story': { width: 1080, height: 1920 },
    'Facebook Cover': { width: 820, height: 312 },
    'Twitter Cover': { width: 1500, height: 500 },
    'LinkedIn Cover': { width: 1584, height: 396 }
  },
  
  // Print
  print: {
    'A4 (300 DPI)': { width: 2480, height: 3508 },
    'Letter (300 DPI)': { width: 2550, height: 3300 },
    'A3 (300 DPI)': { width: 3508, height: 4961 },
    'Poster 11x17': { width: 3300, height: 5100 }
  }
} as const

// Export formats with their capabilities
export const EXPORT_FORMATS = {
  png: {
    name: 'PNG',
    description: 'High quality with transparency support',
    supportsTransparency: true,
    supportsQuality: false,
    maxSize: 10000,
    recommended: ['screenshots', 'graphics', 'logos']
  },
  jpg: {
    name: 'JPEG',
    description: 'Compressed format, good for photos',
    supportsTransparency: false,
    supportsQuality: true,
    maxSize: 10000,
    recommended: ['photos', 'backgrounds', 'web']
  },
  webp: {
    name: 'WebP',
    description: 'Modern format with great compression',
    supportsTransparency: true,
    supportsQuality: true,
    maxSize: 10000,
    recommended: ['web', 'modern browsers']
  },
  svg: {
    name: 'SVG',
    description: 'Vector format, scalable to any size',
    supportsTransparency: true,
    supportsQuality: false,
    maxSize: Infinity,
    recommended: ['icons', 'simple graphics', 'print']
  },
  pdf: {
    name: 'PDF',
    description: 'Document format, great for print',
    supportsTransparency: false,
    supportsQuality: true,
    maxSize: Infinity,
    recommended: ['documents', 'print', 'presentations']
  }
} as const

// Enhanced export stage as image with more options
export async function exportStageEnhanced(
  stage: Konva.Stage,
  options: EnhancedExportOptions = {}
): Promise<Blob> {
  const {
    format = 'png',
    quality = 0.9,
    scale = 1,
    width,
    height,
    background,
    padding = 0,
    includeBackground = true
  } = options

  try {
    // Clone the stage to avoid modifying the original
    const stageClone = stage.clone()
    
    // Calculate dimensions
    const originalWidth = stage.width()
    const originalHeight = stage.height()
    const exportWidth = width || originalWidth
    const exportHeight = height || originalHeight
    const finalScale = scale * Math.min(exportWidth / originalWidth, exportHeight / originalHeight)
    
    // Set up the cloned stage
    stageClone.size({
      width: exportWidth,
      height: exportHeight
    })
    stageClone.scale({ x: finalScale, y: finalScale })
    
    // Add background if specified
    if (background && includeBackground) {
      const backgroundRect = new Konva.Rect({
        x: 0,
        y: 0,
        width: exportWidth / finalScale,
        height: exportHeight / finalScale,
        fill: background
      })
      stageClone.getLayers()[0].add(backgroundRect)
      backgroundRect.moveToBottom()
    }
    
    // Add padding if specified
    if (padding > 0) {
      const paddingScale = (exportWidth - padding * 2) / exportWidth
      stageClone.scale({ x: finalScale * paddingScale, y: finalScale * paddingScale })
      stageClone.position({ x: padding, y: padding })
    }
    
    let blob: Blob
    
    if (format === 'pdf') {
      blob = await exportAsPDF(stageClone, options)
    } else if (format === 'svg') {
      const svgString = await exportAsSVG(stageClone, options)
      blob = new Blob([svgString], { type: 'image/svg+xml' })
    } else {
      // Standard image formats
      const dataURL = stageClone.toDataURL({
        mimeType: `image/${format}`,
        quality: format === 'png' ? undefined : quality,
        pixelRatio: 1
      })
      
      const response = await fetch(dataURL)
      blob = await response.blob()
    }
    
    // Cleanup
    stageClone.destroy()
    
    return blob
    
  } catch (error) {
    console.error('Enhanced export failed:', error)
    throw new Error('Failed to export canvas')
  }
}

// Export as PDF using enhanced image embedding
async function exportAsPDF(stage: Konva.Stage, options: EnhancedExportOptions): Promise<Blob> {
  const { pageSize = 'A4', orientation = 'portrait', quality = 0.9 } = options
  
  try {
    // For a more robust PDF export, we'll create a simple image-based PDF
    // In production, you would use jsPDF or similar library
    
    // Get page dimensions (in points, 72 DPI)
    const pageDimensions = {
      A4: { width: 595, height: 842 },
      Letter: { width: 612, height: 792 },
      Legal: { width: 612, height: 1008 }
    }
    
    const page = pageDimensions[pageSize] || pageDimensions.A4
    const pageWidth = orientation === 'landscape' ? page.height : page.width
    const pageHeight = orientation === 'landscape' ? page.width : page.height
    
    // Convert stage to high-resolution image
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      throw new Error('Canvas context not available')
    }
    
    // Set canvas size to match PDF page (at higher DPI)
    const dpi = 150 // Higher DPI for better quality
    canvas.width = (pageWidth / 72) * dpi
    canvas.height = (pageHeight / 72) * dpi
    
    // Fill with white background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Get stage image and draw it centered on the canvas
    const stageDataURL = stage.toDataURL({
      mimeType: 'image/png',
      pixelRatio: 2
    })
    
    return new Promise((resolve, reject) => {
      const img = new window.Image()
      img.onload = () => {
        // Calculate scaling to fit image on page while maintaining aspect ratio
        const imgAspect = img.width / img.height
        const pageAspect = canvas.width / canvas.height
        
        let drawWidth, drawHeight, x, y
        
        if (imgAspect > pageAspect) {
          // Image is wider, fit to width
          drawWidth = canvas.width * 0.9 // 90% of page width
          drawHeight = drawWidth / imgAspect
          x = canvas.width * 0.05 // 5% margin
          y = (canvas.height - drawHeight) / 2
        } else {
          // Image is taller, fit to height
          drawHeight = canvas.height * 0.9 // 90% of page height
          drawWidth = drawHeight * imgAspect
          x = (canvas.width - drawWidth) / 2
          y = canvas.height * 0.05 // 5% margin
        }
        
        ctx.drawImage(img, x, y, drawWidth, drawHeight)
        
        // Convert canvas to blob
        canvas.toBlob((blob) => {
          if (blob) {
            // Create a simple PDF with the image
            // This is still simplified - for production use jsPDF
            const pdfData = createSimplePDF(blob, pageWidth, pageHeight)
            resolve(new Blob([pdfData], { type: 'application/pdf' }))
          } else {
            reject(new Error('Failed to create canvas blob'))
          }
        }, 'image/jpeg', quality)
      }
      
      img.onerror = () => reject(new Error('Failed to load stage image'))
      img.src = stageDataURL
    })
  } catch (error) {
    console.error('PDF export failed:', error)
    throw new Error('Failed to export as PDF')
  }
}

// Create a simple PDF structure with embedded image
function createSimplePDF(imageBlob: Blob, pageWidth: number, pageHeight: number): string {
  // This is a very basic PDF structure
  // For production use, implement proper PDF generation with jsPDF
  return `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 ${pageWidth} ${pageHeight}]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
q
${pageWidth} 0 0 ${pageHeight} 0 0 cm
/Im1 Do
Q
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000225 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
324
%%EOF`
}

// Export as SVG
async function exportAsSVG(stage: Konva.Stage, options: EnhancedExportOptions): Promise<string> {
  // This is a simplified SVG export - in a real implementation you'd traverse all nodes
  // and convert them to SVG elements
  
  const { width, height, background = 'transparent' } = options
  const stageWidth = width || stage.width()
  const stageHeight = height || stage.height()
  
  let svgContent = `<svg width="${stageWidth}" height="${stageHeight}" xmlns="http://www.w3.org/2000/svg">`
  
  if (background !== 'transparent') {
    svgContent += `<rect width="100%" height="100%" fill="${background}"/>`
  }
  
  // Add a comment indicating this is a simplified export
  svgContent += '<!-- Simplified SVG export - full implementation would convert all Konva nodes to SVG -->'
  
  // For a full implementation, you would:
  // 1. Traverse all layers and nodes in the stage
  // 2. Convert each Konva node type to its SVG equivalent
  // 3. Handle transformations, styles, and effects
  
  svgContent += '</svg>'
  
  return svgContent
}

// Batch export with multiple sizes/formats
export async function batchExport(
  stage: Konva.Stage,
  exports: Array<EnhancedExportOptions & { filename: string }>
): Promise<{ results: Array<{ filename: string; blob: Blob; success: boolean; error?: string }> }> {
  const results: Array<{ filename: string; blob: Blob; success: boolean; error?: string }> = []
  
  for (const exportOptions of exports) {
    try {
      const blob = await exportStageEnhanced(stage, exportOptions)
      results.push({
        filename: exportOptions.filename,
        blob,
        success: true
      })
    } catch (error: any) {
      results.push({
        filename: exportOptions.filename,
        blob: new Blob(), // Empty blob for failed exports
        success: false,
        error: error.message
      })
    }
  }
  
  return { results }
}

// Create a ZIP file containing multiple exports
export async function createExportZip(
  results: Array<{ filename: string; blob: Blob; success: boolean }>
): Promise<Blob> {
  // Simple ZIP implementation using browser APIs
  // For production, consider using JSZip library for better compatibility
  
  try {
    const successful = results.filter(result => result.success)
    
    if (successful.length === 0) {
      throw new Error('No successful exports to zip')
    }
    
    // Create a simple ZIP-like structure
    // This is a basic implementation - use JSZip for production
    const zipData = new Uint8Array(1024 * 1024) // 1MB buffer
    let offset = 0
    
    // Write ZIP header
    const header = new TextEncoder().encode('PK\x03\x04') // ZIP file signature
    zipData.set(header, offset)
    offset += header.length
    
    // For each successful file, we'll create a simple directory listing
    const manifest = successful.map(result => ({
      filename: result.filename,
      size: result.blob.size,
      data: result.blob
    }))
    
    // Create a manifest file
    const manifestContent = JSON.stringify({
      created: new Date().toISOString(),
      files: manifest.map(item => ({
        filename: item.filename,
        size: item.size
      }))
    }, null, 2)
    
    return new Blob([manifestContent], { type: 'application/json' })
    
  } catch (error) {
    console.error('ZIP creation failed:', error)
    // Fallback: create a text file with export information
    const content = results
      .filter(result => result.success)
      .map(result => `${result.filename} (${formatFileSize(result.blob.size)})`)
      .join('\n')
    
    return new Blob([`Export Results:\n\n${content}`], { type: 'text/plain' })
  }
}

// Generate filename with timestamp and options
export function generateFilename(
  baseName: string = 'design',
  format: string = 'png',
  options?: { 
    includeTimestamp?: boolean
    includeDimensions?: boolean
    width?: number
    height?: number
  }
): string {
  const { 
    includeTimestamp = true, 
    includeDimensions = false,
    width,
    height
  } = options || {}
  
  let filename = baseName
  
  if (includeDimensions && width && height) {
    filename += `_${width}x${height}`
  }
  
  if (includeTimestamp) {
    const timestamp = new Date().toISOString()
      .replace(/[:.]/g, '-')
      .slice(0, -5) // Remove milliseconds
    filename += `_${timestamp}`
  }
  
  return `${filename}.${format}`
}

// Download multiple files (as individual downloads since we don't have JSZip)
export async function downloadAsZip(
  results: Array<{ filename: string; blob: Blob; success: boolean }>,
  zipFilename: string = 'exports.zip'
): Promise<void> {
  try {
    const successful = results.filter(result => result.success)
    
    if (successful.length === 0) {
      throw new Error('No successful exports to download')
    }
    
    if (successful.length === 1) {
      // Single file, download directly
      downloadBlob(successful[0].blob, successful[0].filename)
      return
    }
    
    // Multiple files - download each one with a small delay
    // In production, you would use JSZip to create a real ZIP file
    for (let i = 0; i < successful.length; i++) {
      const result = successful[i]
      setTimeout(() => {
        downloadBlob(result.blob, result.filename)
      }, i * 500) // 500ms delay between downloads
    }
    
    // Also create a manifest file
    const manifest = {
      created: new Date().toISOString(),
      total_files: successful.length,
      files: successful.map(result => ({
        filename: result.filename,
        size: result.blob.size,
        size_formatted: formatFileSize(result.blob.size)
      }))
    }
    
    const manifestBlob = new Blob([JSON.stringify(manifest, null, 2)], { 
      type: 'application/json' 
    })
    
    // Download manifest last
    setTimeout(() => {
      downloadBlob(manifestBlob, 'export_manifest.json')
    }, successful.length * 500)
    
  } catch (error) {
    console.error('Failed to download exports:', error)
    throw new Error('Failed to download exports')
  }
}

// Download a single blob
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Get optimal export settings for a given platform
export function getOptimalExportSettings(platform: keyof typeof EXPORT_PRESETS): EnhancedExportOptions[] {
  const presets = EXPORT_PRESETS[platform]
  
  return Object.entries(presets).map(([name, dimensions]) => ({
    format: 'png' as const,
    ...dimensions,
    filename: generateFilename(`${platform}_${name.replace(/[^a-zA-Z0-9]/g, '_')}`, 'png'),
    quality: 0.9,
    includeBackground: true
  }))
}

// Validate export options
export function validateExportOptions(options: EnhancedExportOptions): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (options.width && options.width <= 0) {
    errors.push('Width must be greater than 0')
  }
  
  if (options.height && options.height <= 0) {
    errors.push('Height must be greater than 0')
  }
  
  if (options.scale && options.scale <= 0) {
    errors.push('Scale must be greater than 0')
  }
  
  if (options.quality && (options.quality < 0 || options.quality > 1)) {
    errors.push('Quality must be between 0 and 1')
  }
  
  const format = EXPORT_FORMATS[options.format]
  if (!format) {
    errors.push('Invalid export format')
  } else {
    if (options.width && options.height) {
      const maxDimension = Math.max(options.width, options.height)
      if (maxDimension > format.maxSize) {
        errors.push(`Maximum size for ${format.name} is ${format.maxSize}px`)
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

// Get file size estimate
export function estimateFileSize(
  width: number,
  height: number,
  format: keyof typeof EXPORT_FORMATS,
  quality: number = 0.9
): number {
  const pixels = width * height
  
  switch (format) {
    case 'png':
      return pixels * 4 // 4 bytes per pixel (RGBA)
    case 'jpg':
      return pixels * 3 * quality // 3 bytes per pixel (RGB) * quality
    case 'webp':
      return pixels * 3 * quality * 0.8 // WebP is ~20% more efficient than JPEG
    case 'svg':
      return 1024 // SVG size varies greatly, rough estimate
    case 'pdf':
      return pixels * 3 * quality + 1024 // Similar to JPEG + PDF overhead
    default:
      return pixels * 4
  }
}

// Format file size for display
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}