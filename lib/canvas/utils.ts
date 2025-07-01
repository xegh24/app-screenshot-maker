import Konva from 'konva'
import type { AnyCanvasElement } from '../../store/editor'

// Snap to grid utility
export function snapToGrid(value: number, gridSize: number, enabled: boolean = true): number {
  if (!enabled) return value
  return Math.round(value / gridSize) * gridSize
}

// Check if point is within bounds
export function isPointInBounds(x: number, y: number, bounds: { x: number; y: number; width: number; height: number }): boolean {
  return x >= bounds.x && x <= bounds.x + bounds.width && y >= bounds.y && y <= bounds.y + bounds.height
}

// Calculate distance between two points
export function distance(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
}

// Convert degrees to radians
export function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

// Convert radians to degrees
export function radiansToDegrees(radians: number): number {
  return radians * (180 / Math.PI)
}

// Calculate bounding box for rotated rectangle
export function getRotatedBounds(x: number, y: number, width: number, height: number, rotation: number): {
  x: number
  y: number
  width: number
  height: number
} {
  const rad = degreesToRadians(rotation)
  const cos = Math.abs(Math.cos(rad))
  const sin = Math.abs(Math.sin(rad))
  
  const newWidth = height * sin + width * cos
  const newHeight = height * cos + width * sin
  
  return {
    x: x - (newWidth - width) / 2,
    y: y - (newHeight - height) / 2,
    width: newWidth,
    height: newHeight
  }
}

// Generate unique layer name
export function generateLayerName(type: string, existingNames: string[]): string {
  let counter = 1
  let name = `${type} ${counter}`
  
  while (existingNames.includes(name)) {
    counter++
    name = `${type} ${counter}`
  }
  
  return name
}

// Clamp value between min and max
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

// Scale value maintaining aspect ratio
export function scaleProportionally(
  originalWidth: number,
  originalHeight: number,
  targetWidth?: number,
  targetHeight?: number
): { width: number; height: number } {
  if (!targetWidth && !targetHeight) {
    return { width: originalWidth, height: originalHeight }
  }
  
  const aspectRatio = originalWidth / originalHeight
  
  if (targetWidth && !targetHeight) {
    return {
      width: targetWidth,
      height: targetWidth / aspectRatio
    }
  }
  
  if (!targetWidth && targetHeight) {
    return {
      width: targetHeight * aspectRatio,
      height: targetHeight
    }
  }
  
  // Both dimensions provided, use the one that maintains aspect ratio
  const widthBasedHeight = targetWidth! / aspectRatio
  const heightBasedWidth = targetHeight! * aspectRatio
  
  if (widthBasedHeight <= targetHeight!) {
    return {
      width: targetWidth!,
      height: widthBasedHeight
    }
  } else {
    return {
      width: heightBasedWidth,
      height: targetHeight!
    }
  }
}

// Convert canvas coordinates to screen coordinates
export function canvasToScreen(
  canvasX: number,
  canvasY: number,
  zoom: number,
  offsetX: number,
  offsetY: number
): { x: number; y: number } {
  return {
    x: (canvasX + offsetX) * zoom,
    y: (canvasY + offsetY) * zoom
  }
}

// Convert screen coordinates to canvas coordinates
export function screenToCanvas(
  screenX: number,
  screenY: number,
  zoom: number,
  offsetX: number,
  offsetY: number
): { x: number; y: number } {
  return {
    x: screenX / zoom - offsetX,
    y: screenY / zoom - offsetY
  }
}

// Get element bounds considering transforms
export function getElementBounds(element: AnyCanvasElement): {
  x: number
  y: number
  width: number
  height: number
} {
  const actualWidth = element.width * element.scaleX
  const actualHeight = element.height * element.scaleY
  
  if (element.rotation === 0) {
    return {
      x: element.x,
      y: element.y,
      width: actualWidth,
      height: actualHeight
    }
  }
  
  return getRotatedBounds(element.x, element.y, actualWidth, actualHeight, element.rotation)
}

// Check if elements overlap
export function elementsOverlap(element1: AnyCanvasElement, element2: AnyCanvasElement): boolean {
  const bounds1 = getElementBounds(element1)
  const bounds2 = getElementBounds(element2)
  
  return !(
    bounds1.x + bounds1.width < bounds2.x ||
    bounds2.x + bounds2.width < bounds1.x ||
    bounds1.y + bounds1.height < bounds2.y ||
    bounds2.y + bounds2.height < bounds1.y
  )
}

// Get center point of element
export function getElementCenter(element: AnyCanvasElement): { x: number; y: number } {
  return {
    x: element.x + (element.width * element.scaleX) / 2,
    y: element.y + (element.height * element.scaleY) / 2
  }
}

// Align elements
export function alignElements(elements: AnyCanvasElement[], alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom'): AnyCanvasElement[] {
  if (elements.length < 2) return elements
  
  const bounds = elements.map(getElementBounds)
  
  switch (alignment) {
    case 'left': {
      const leftmost = Math.min(...bounds.map(b => b.x))
      return elements.map((element, index) => ({
        ...element,
        x: leftmost
      }))
    }
    case 'center': {
      const centers = bounds.map(b => b.x + b.width / 2)
      const averageCenter = centers.reduce((sum, c) => sum + c, 0) / centers.length
      return elements.map((element, index) => ({
        ...element,
        x: averageCenter - (element.width * element.scaleX) / 2
      }))
    }
    case 'right': {
      const rightmost = Math.max(...bounds.map(b => b.x + b.width))
      return elements.map((element, index) => ({
        ...element,
        x: rightmost - (element.width * element.scaleX)
      }))
    }
    case 'top': {
      const topmost = Math.min(...bounds.map(b => b.y))
      return elements.map((element, index) => ({
        ...element,
        y: topmost
      }))
    }
    case 'middle': {
      const middles = bounds.map(b => b.y + b.height / 2)
      const averageMiddle = middles.reduce((sum, m) => sum + m, 0) / middles.length
      return elements.map((element, index) => ({
        ...element,
        y: averageMiddle - (element.height * element.scaleY) / 2
      }))
    }
    case 'bottom': {
      const bottommost = Math.max(...bounds.map(b => b.y + b.height))
      return elements.map((element, index) => ({
        ...element,
        y: bottommost - (element.height * element.scaleY)
      }))
    }
    default:
      return elements
  }
}

// Distribute elements evenly
export function distributeElements(elements: AnyCanvasElement[], direction: 'horizontal' | 'vertical'): AnyCanvasElement[] {
  if (elements.length < 3) return elements
  
  const bounds = elements.map(getElementBounds)
  const sortedElements = [...elements].sort((a, b) => {
    const boundsA = getElementBounds(a)
    const boundsB = getElementBounds(b)
    return direction === 'horizontal' ? boundsA.x - boundsB.x : boundsA.y - boundsB.y
  })
  
  const sortedBounds = sortedElements.map(getElementBounds)
  
  if (direction === 'horizontal') {
    const leftmost = sortedBounds[0].x
    const rightmost = sortedBounds[sortedBounds.length - 1].x + sortedBounds[sortedBounds.length - 1].width
    const totalWidth = rightmost - leftmost
    const availableSpace = totalWidth - sortedBounds.reduce((sum, b) => sum + b.width, 0)
    const spacing = availableSpace / (sortedElements.length - 1)
    
    let currentX = leftmost
    return sortedElements.map((element, index) => {
      const newElement = { ...element, x: currentX }
      currentX += sortedBounds[index].width + spacing
      return newElement
    })
  } else {
    const topmost = sortedBounds[0].y
    const bottommost = sortedBounds[sortedBounds.length - 1].y + sortedBounds[sortedBounds.length - 1].height
    const totalHeight = bottommost - topmost
    const availableSpace = totalHeight - sortedBounds.reduce((sum, b) => sum + b.height, 0)
    const spacing = availableSpace / (sortedElements.length - 1)
    
    let currentY = topmost
    return sortedElements.map((element, index) => {
      const newElement = { ...element, y: currentY }
      currentY += sortedBounds[index].height + spacing
      return newElement
    })
  }
}

// Create selection bounds for multiple elements
export function getMultiSelectionBounds(elements: AnyCanvasElement[]): {
  x: number
  y: number
  width: number
  height: number
} {
  if (elements.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 }
  }
  
  const bounds = elements.map(getElementBounds)
  const minX = Math.min(...bounds.map(b => b.x))
  const minY = Math.min(...bounds.map(b => b.y))
  const maxX = Math.max(...bounds.map(b => b.x + b.width))
  const maxY = Math.max(...bounds.map(b => b.y + b.height))
  
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  }
}

// Generate CSS filters string from filter object
export function generateCSSFilters(filters: {
  brightness?: number
  contrast?: number
  saturation?: number
  blur?: number
  grayscale?: number
  sepia?: number
}): string {
  const filterParts: string[] = []
  
  if (filters.brightness !== undefined && filters.brightness !== 1) {
    filterParts.push(`brightness(${filters.brightness})`)
  }
  if (filters.contrast !== undefined && filters.contrast !== 1) {
    filterParts.push(`contrast(${filters.contrast})`)
  }
  if (filters.saturation !== undefined && filters.saturation !== 1) {
    filterParts.push(`saturate(${filters.saturation})`)
  }
  if (filters.blur !== undefined && filters.blur > 0) {
    filterParts.push(`blur(${filters.blur}px)`)
  }
  if (filters.grayscale !== undefined && filters.grayscale > 0) {
    filterParts.push(`grayscale(${filters.grayscale})`)
  }
  if (filters.sepia !== undefined && filters.sepia > 0) {
    filterParts.push(`sepia(${filters.sepia})`)
  }
  
  return filterParts.join(' ')
}

// Convert Konva filters to CSS filters
export function konvaFiltersToCSS(filters: Konva.Filter[]): string {
  // This is a simplified conversion - in a real implementation,
  // you'd need to map each Konva filter to its CSS equivalent
  return ''
}

// Load image and return dimensions
export function loadImage(src: string): Promise<{ image: HTMLImageElement; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      resolve({
        image: img,
        width: img.naturalWidth,
        height: img.naturalHeight
      })
    }
    img.onerror = reject
    img.src = src
  })
}

// Debounce function for performance optimization
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Throttle function for performance optimization
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}