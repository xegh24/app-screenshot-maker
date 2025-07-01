import Konva from 'konva'
import type { AnyCanvasElement } from '../../store/editor'

export interface ExportOptions {
  format: 'png' | 'jpg' | 'webp' | 'svg'
  quality?: number // 0-1 for jpg/webp
  scale?: number // Multiplier for resolution
  background?: string // Background color
  padding?: number // Padding around content
  includeBackground?: boolean
  selectedOnly?: boolean
}

export interface ExportDimensions {
  width: number
  height: number
  scale: number
}

// Calculate optimal export dimensions
export function calculateExportDimensions(
  canvasWidth: number,
  canvasHeight: number,
  elements: AnyCanvasElement[],
  options: ExportOptions = {}
): ExportDimensions {
  const { scale = 1, padding = 0, selectedOnly = false } = options
  
  let width = canvasWidth
  let height = canvasHeight
  
  if (selectedOnly && elements.length > 0) {
    // Calculate bounds of selected elements
    const bounds = getElementsBounds(elements)
    width = bounds.width + (padding * 2)
    height = bounds.height + (padding * 2)
  }
  
  return {
    width: Math.ceil(width * scale),
    height: Math.ceil(height * scale),
    scale
  }
}

// Get bounding box of elements
function getElementsBounds(elements: AnyCanvasElement[]): {
  x: number
  y: number
  width: number
  height: number
} {
  if (elements.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 }
  }
  
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  
  elements.forEach(element => {
    const elementMinX = element.x
    const elementMinY = element.y
    const elementMaxX = element.x + (element.width * element.scaleX)
    const elementMaxY = element.y + (element.height * element.scaleY)
    
    minX = Math.min(minX, elementMinX)
    minY = Math.min(minY, elementMinY)
    maxX = Math.max(maxX, elementMaxX)
    maxY = Math.max(maxY, elementMaxY)
  })
  
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  }
}

// Export stage as image
export async function exportStageAsImage(
  stage: Konva.Stage,
  options: ExportOptions = {}
): Promise<Blob> {
  const {
    format = 'png',
    quality = 0.9,
    scale = 1,
    background,
    padding = 0
  } = options
  
  try {
    // Clone the stage to avoid modifying the original
    const stageClone = stage.clone()
    
    // Set background if specified
    if (background) {
      const backgroundRect = new Konva.Rect({
        x: 0,
        y: 0,
        width: stage.width(),
        height: stage.height(),
        fill: background
      })
      stageClone.getLayers()[0].add(backgroundRect)
      backgroundRect.moveToBottom()
    }
    
    // Calculate export dimensions
    const dimensions = calculateExportDimensions(
      stage.width(),
      stage.height(),
      [],
      options
    )
    
    // Set scale for high-resolution export
    stageClone.scale({ x: dimensions.scale, y: dimensions.scale })
    stageClone.size({
      width: dimensions.width / dimensions.scale,
      height: dimensions.height / dimensions.scale
    })
    
    // Export based on format
    let dataURL: string
    
    if (format === 'svg') {
      // For SVG export, we need to handle it differently
      dataURL = stageClone.toDataURL({
        mimeType: 'image/svg+xml'
      })
    } else {
      dataURL = stageClone.toDataURL({
        mimeType: `image/${format}`,
        quality: format === 'png' ? undefined : quality,
        pixelRatio: 1 // We handle scaling manually
      })
    }
    
    // Convert data URL to blob
    const response = await fetch(dataURL)
    const blob = await response.blob()
    
    // Cleanup
    stageClone.destroy()
    
    return blob
    
  } catch (error) {
    console.error('Export failed:', error)
    throw new Error('Failed to export canvas')
  }
}

// Export selected elements only
export async function exportSelectedElements(
  stage: Konva.Stage,
  selectedElementIds: string[],
  options: ExportOptions = {}
): Promise<Blob> {
  if (selectedElementIds.length === 0) {
    throw new Error('No elements selected for export')
  }
  
  try {
    // Create a temporary stage with only selected elements
    const tempStage = new Konva.Stage({
      container: document.createElement('div'),
      width: stage.width(),
      height: stage.height()
    })
    
    const tempLayer = new Konva.Layer()
    tempStage.add(tempLayer)
    
    // Find and clone selected elements
    const selectedNodes: Konva.Node[] = []
    selectedElementIds.forEach(id => {
      const node = stage.findOne(`#${id}`)
      if (node) {
        selectedNodes.push(node.clone())
      }
    })
    
    if (selectedNodes.length === 0) {
      tempStage.destroy()
      throw new Error('Selected elements not found on stage')
    }
    
    // Add cloned nodes to temp layer
    selectedNodes.forEach(node => {
      tempLayer.add(node)
    })
    
    // Calculate bounds of selected elements
    const bounds = getNodesBounds(selectedNodes)
    const padding = options.padding || 0
    
    // Adjust stage size and position to fit selected elements
    tempStage.size({
      width: bounds.width + (padding * 2),
      height: bounds.height + (padding * 2)
    })
    
    // Offset all nodes to account for new stage bounds
    selectedNodes.forEach(node => {
      node.position({
        x: node.x() - bounds.x + padding,
        y: node.y() - bounds.y + padding
      })
    })
    
    // Export the temporary stage
    const blob = await exportStageAsImage(tempStage, {
      ...options,
      selectedOnly: false // We've already handled selection
    })
    
    // Cleanup
    tempStage.destroy()
    
    return blob
    
  } catch (error) {
    console.error('Export selected elements failed:', error)
    throw new Error('Failed to export selected elements')
  }
}

// Get bounds of Konva nodes
function getNodesBounds(nodes: Konva.Node[]): {
  x: number
  y: number
  width: number
  height: number
} {
  if (nodes.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 }
  }
  
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  
  nodes.forEach(node => {
    const rect = node.getClientRect()
    minX = Math.min(minX, rect.x)
    minY = Math.min(minY, rect.y)
    maxX = Math.max(maxX, rect.x + rect.width)
    maxY = Math.max(maxY, rect.y + rect.height)
  })
  
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  }
}

// Generate filename for export
export function generateExportFilename(
  prefix: string = 'canvas-export',
  format: string = 'png'
): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
  return `${prefix}-${timestamp}.${format}`
}

// Download blob as file
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

// Copy canvas to clipboard (browser support varies)
export async function copyCanvasToClipboard(stage: Konva.Stage): Promise<void> {
  if (!navigator.clipboard || !window.ClipboardItem) {
    throw new Error('Clipboard API not supported')
  }
  
  try {
    const blob = await exportStageAsImage(stage, { format: 'png' })
    const clipboardItem = new ClipboardItem({ 'image/png': blob })
    await navigator.clipboard.write([clipboardItem])
  } catch (error) {
    console.error('Copy to clipboard failed:', error)
    throw new Error('Failed to copy to clipboard')
  }
}

// Export canvas data as JSON
export function exportCanvasData(
  elements: AnyCanvasElement[],
  canvasState: {
    width: number
    height: number
    backgroundColor: string
  }
): string {
  const exportData = {
    version: '1.0',
    timestamp: Date.now(),
    canvas: canvasState,
    elements: elements.map(element => ({
      ...element,
      // Remove any non-serializable properties
      id: element.id,
      type: element.type,
      x: element.x,
      y: element.y,
      width: element.width,
      height: element.height,
      rotation: element.rotation,
      scaleX: element.scaleX,
      scaleY: element.scaleY,
      opacity: element.opacity,
      visible: element.visible,
      locked: element.locked,
      zIndex: element.zIndex,
      style: element.style,
      data: element.data
    }))
  }
  
  return JSON.stringify(exportData, null, 2)
}

// Import canvas data from JSON
export function importCanvasData(jsonData: string): {
  elements: AnyCanvasElement[]
  canvasState: {
    width: number
    height: number
    backgroundColor: string
  }
} {
  try {
    const data = JSON.parse(jsonData)
    
    if (!data.version || !data.elements || !data.canvas) {
      throw new Error('Invalid canvas data format')
    }
    
    return {
      elements: data.elements,
      canvasState: data.canvas
    }
  } catch (error) {
    console.error('Import canvas data failed:', error)
    throw new Error('Failed to import canvas data')
  }
}

// Export stage as SVG (more complex implementation would be needed for full SVG support)
export async function exportStageAsSVG(
  stage: Konva.Stage,
  options: ExportOptions = {}
): Promise<string> {
  // This is a simplified SVG export
  // For full SVG support, you'd need to traverse the stage and convert each node to SVG elements
  
  const { width, height } = stage.size()
  const { background = 'transparent' } = options
  
  let svgContent = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`
  
  if (background !== 'transparent') {
    svgContent += `<rect width="100%" height="100%" fill="${background}"/>`
  }
  
  // Add a comment indicating this is a simplified export
  svgContent += '<!-- Simplified SVG export - full implementation would convert all Konva nodes to SVG -->'
  
  svgContent += '</svg>'
  
  return svgContent
}

// Print canvas
export async function printCanvas(stage: Konva.Stage): Promise<void> {
  try {
    const blob = await exportStageAsImage(stage, {
      format: 'png',
      scale: 2 // Higher resolution for printing
    })
    
    const url = URL.createObjectURL(blob)
    const img = new window.Image()
    
    return new Promise((resolve, reject) => {
      img.onload = () => {
        const printWindow = window.open('', '_blank')
        if (!printWindow) {
          reject(new Error('Failed to open print window'))
          return
        }
        
        printWindow.document.write(`
          <html>
            <head>
              <title>Canvas Print</title>
              <style>
                body { margin: 0; text-align: center; }
                img { max-width: 100%; height: auto; }
              </style>
            </head>
            <body>
              <img src="${url}" alt="Canvas Export" />
            </body>
          </html>
        `)
        
        printWindow.document.close()
        printWindow.focus()
        printWindow.print()
        
        // Cleanup after a delay
        setTimeout(() => {
          printWindow.close()
          URL.revokeObjectURL(url)
          resolve()
        }, 1000)
      }
      
      img.onerror = () => {
        reject(new Error('Failed to load image for printing'))
      }
      
      img.src = url
    })
  } catch (error) {
    console.error('Print failed:', error)
    throw new Error('Failed to print canvas')
  }
}