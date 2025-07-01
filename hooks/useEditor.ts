import { useCallback, useEffect, useRef } from 'react'
import { useEditorStore } from '../store/editor'
import { useUIStore } from '../store/ui'
import { useTemplatesStore } from '../store/templates'
import { useAuthStore } from '../store/auth'
import { createClient } from '@supabase/supabase-js'
import type { Database, Design } from '../types/database'
import type { AnyCanvasElement, TextElement, ImageElement, ShapeElement } from '../store/editor'

// Keyboard shortcuts mapping
const KEYBOARD_SHORTCUTS = {
  // General
  'ctrl+z': 'undo',
  'ctrl+shift+z': 'redo',
  'ctrl+y': 'redo',
  'ctrl+s': 'save',
  'ctrl+o': 'open',
  'ctrl+n': 'new',
  
  // Selection
  'ctrl+a': 'selectAll',
  'escape': 'clearSelection',
  
  // Clipboard
  'ctrl+c': 'copy',
  'ctrl+x': 'cut',
  'ctrl+v': 'paste',
  'ctrl+d': 'duplicate',
  
  // Tools
  't': 'textTool',
  'i': 'imageTool',
  's': 'shapeTool',
  'f': 'frameTool',
  'v': 'selectTool',
  
  // Element operations
  'delete': 'deleteSelected',
  'backspace': 'deleteSelected',
  
  // View
  'ctrl+0': 'fitToScreen',
  'ctrl+1': 'zoomToActual',
  'ctrl+=': 'zoomIn',
  'ctrl+-': 'zoomOut',
  
  // Layers
  'ctrl+]': 'bringForward',
  'ctrl+[': 'sendBackward',
  'ctrl+shift+]': 'bringToFront',
  'ctrl+shift+[': 'sendToBack'
} as const

type ShortcutAction = typeof KEYBOARD_SHORTCUTS[keyof typeof KEYBOARD_SHORTCUTS]

// Hook for editor operations
export const useEditor = () => {
  const editorStore = useEditorStore()
  const { addNotification } = useUIStore()
  const { user } = useAuthStore()
  
  // Create text element
  const createTextElement = useCallback((x: number = 100, y: number = 100, text: string = 'New Text') => {
    const textElement: Omit<TextElement, 'id' | 'zIndex'> = {
      type: 'text',
      x,
      y,
      width: 200,
      height: 50,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
      visible: true,
      locked: false,
      style: {},
      data: {
        text,
        fontSize: 16,
        fontFamily: 'Arial',
        fontWeight: 'normal',
        fontStyle: 'normal',
        textAlign: 'left',
        textDecoration: 'none',
        color: '#000000',
        lineHeight: 1.2,
        letterSpacing: 0
      }
    }
    
    editorStore.addElement(textElement)
  }, [editorStore])

  // Create image element
  const createImageElement = useCallback((src: string, x: number = 100, y: number = 100) => {
    const img = new window.Image()
    img.onload = () => {
      const imageElement: Omit<ImageElement, 'id' | 'zIndex'> = {
        type: 'image',
        x,
        y,
        width: Math.min(img.width, 300),
        height: Math.min(img.height, 300),
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        opacity: 1,
        visible: true,
        locked: false,
        style: {},
        data: {
          src,
          originalWidth: img.width,
          originalHeight: img.height,
          fit: 'cover',
          filters: {
            brightness: 100,
            contrast: 100,
            saturation: 100,
            blur: 0,
            grayscale: 0,
            sepia: 0
          }
        }
      }
      
      editorStore.addElement(imageElement)
    }
    img.src = src
  }, [editorStore])

  // Create shape element
  const createShapeElement = useCallback((shape: 'rectangle' | 'circle' | 'triangle' = 'rectangle', x: number = 100, y: number = 100) => {
    const shapeElement: Omit<ShapeElement, 'id' | 'zIndex'> = {
      type: 'shape',
      x,
      y,
      width: 100,
      height: 100,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
      visible: true,
      locked: false,
      style: {},
      data: {
        shape,
        fill: '#3b82f6',
        stroke: '#1e40af',
        strokeWidth: 2,
        cornerRadius: shape === 'rectangle' ? 8 : undefined
      }
    }
    
    editorStore.addElement(shapeElement)
  }, [editorStore])

  // Save design
  const saveDesign = useCallback(async (title?: string, description?: string) => {
    if (!user) {
      addNotification({
        type: 'error',
        title: 'Authentication Required',
        message: 'Please sign in to save your design'
      })
      return { error: 'Not authenticated' }
    }

    try {
      const supabase = createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const canvasData = {
        elements: editorStore.exportCanvas(),
        canvas: editorStore.canvas
      }

      const designData = {
        user_id: user.id,
        title: title || editorStore.currentDesign?.title || 'Untitled Design',
        description: description || editorStore.currentDesign?.description || null,
        canvas_data: canvasData,
        is_public: false
      }

      let result
      if (editorStore.currentDesign) {
        // Update existing design
        result = await supabase
          .from('designs')
          .update(designData)
          .eq('id', editorStore.currentDesign.id)
          .select()
          .single()
      } else {
        // Create new design
        result = await supabase
          .from('designs')
          .insert(designData)
          .select()
          .single()
      }

      if (result.error) {
        throw result.error
      }

      editorStore.setCurrentDesign(result.data as Design)
      editorStore.markAsSaved()

      addNotification({
        type: 'success',
        title: 'Design Saved',
        message: 'Your design has been saved successfully'
      })

      return { error: null }
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Save Failed',
        message: error.message || 'Failed to save design'
      })
      return { error }
    }
  }, [user, editorStore, addNotification])

  // Load design
  const loadDesign = useCallback(async (designId: string) => {
    try {
      const supabase = createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const { data, error } = await supabase
        .from('designs')
        .select('*')
        .eq('id', designId)
        .single()

      if (error) {
        throw error
      }

      editorStore.loadDesign(data as Design)

      addNotification({
        type: 'success',
        title: 'Design Loaded',
        message: 'Design loaded successfully'
      })

      return { error: null }
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Load Failed',
        message: error.message || 'Failed to load design'
      })
      return { error }
    }
  }, [editorStore, addNotification])

  // Export design as image
  const exportAsImage = useCallback(async (format: 'png' | 'jpg' | 'svg' = 'png', quality: number = 1) => {
    try {
      // This would integrate with Konva's export functionality
      const dataURL = 'data:image/png;base64,...' // Placeholder
      
      // Create download link
      const link = document.createElement('a')
      link.download = `design.${format}`
      link.href = dataURL
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      addNotification({
        type: 'success',
        title: 'Export Complete',
        message: `Design exported as ${format.toUpperCase()}`
      })

      return { error: null }
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Export Failed',
        message: error.message || 'Failed to export design'
      })
      return { error }
    }
  }, [addNotification])

  // Apply template
  const applyTemplate = useCallback((templateId: string) => {
    const template = useTemplatesStore.getState().templates.find(t => t.id === templateId)
    if (template) {
      editorStore.importCanvas(template.canvas_data.elements)
      editorStore.setCanvasSize(
        template.canvas_data.canvas.width,
        template.canvas_data.canvas.height
      )
      editorStore.setBackgroundColor(template.canvas_data.canvas.backgroundColor)
      
      useTemplatesStore.getState().recordTemplateUsage(templateId)
      
      addNotification({
        type: 'success',
        title: 'Template Applied',
        message: `Template "${template.name}" applied successfully`
      })
    }
  }, [editorStore, addNotification])

  // Zoom operations
  const fitToScreen = useCallback(() => {
    // Calculate zoom to fit canvas in viewport
    const canvas = editorStore.canvas
    const viewport = { width: window.innerWidth - 600, height: window.innerHeight - 200 } // Account for UI
    
    const scaleX = viewport.width / canvas.width
    const scaleY = viewport.height / canvas.height
    const scale = Math.min(scaleX, scaleY, 1) // Don't zoom in beyond 100%
    
    editorStore.setZoom(scale)
    editorStore.setOffset(0, 0)
  }, [editorStore])

  const zoomToActual = useCallback(() => {
    editorStore.setZoom(1)
    editorStore.setOffset(0, 0)
  }, [editorStore])

  const zoomIn = useCallback(() => {
    editorStore.setZoom(editorStore.canvas.zoom * 1.2)
  }, [editorStore])

  const zoomOut = useCallback(() => {
    editorStore.setZoom(editorStore.canvas.zoom / 1.2)
  }, [editorStore])

  return {
    // Element creation
    createTextElement,
    createImageElement,
    createShapeElement,
    
    // Design operations
    saveDesign,
    loadDesign,
    exportAsImage,
    applyTemplate,
    
    // Zoom operations
    fitToScreen,
    zoomToActual,
    zoomIn,
    zoomOut,
    
    // State getters
    selectedElements: editorStore.elements.filter(el => 
      editorStore.selectedElementIds.includes(el.id)
    ),
    hasSelection: editorStore.selectedElementIds.length > 0,
    canUndo: editorStore.canUndo(),
    canRedo: editorStore.canRedo(),
    isUnsaved: !editorStore.isDesignSaved
  }
}

// Hook for keyboard shortcuts
export const useKeyboardShortcuts = () => {
  const editor = useEditor()
  const editorStore = useEditorStore()
  const { keyboardShortcutsEnabled } = useUIStore()
  
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!keyboardShortcutsEnabled) return
    
    // Don't handle shortcuts when typing in inputs
    if (event.target instanceof HTMLInputElement || 
        event.target instanceof HTMLTextAreaElement ||
        (event.target as HTMLElement).contentEditable === 'true') {
      return
    }

    const key = [
      event.ctrlKey ? 'ctrl' : '',
      event.shiftKey ? 'shift' : '',
      event.altKey ? 'alt' : '',
      event.key.toLowerCase()
    ].filter(Boolean).join('+')

    const action = KEYBOARD_SHORTCUTS[key as keyof typeof KEYBOARD_SHORTCUTS]
    
    if (!action) return

    event.preventDefault()

    switch (action) {
      case 'undo':
        editorStore.undo()
        break
      case 'redo':
        editorStore.redo()
        break
      case 'save':
        editor.saveDesign()
        break
      case 'selectAll':
        editorStore.selectAll()
        break
      case 'clearSelection':
        editorStore.clearSelection()
        break
      case 'copy':
        editorStore.copyElements()
        break
      case 'cut':
        editorStore.cutElements()
        break
      case 'paste':
        editorStore.pasteElements()
        break
      case 'duplicate':
        if (editorStore.selectedElementIds.length > 0) {
          editorStore.duplicateElements(editorStore.selectedElementIds)
        }
        break
      case 'deleteSelected':
        if (editorStore.selectedElementIds.length > 0) {
          editorStore.deleteElements(editorStore.selectedElementIds)
        }
        break
      case 'textTool':
        editorStore.setActiveTool('text')
        break
      case 'imageTool':
        editorStore.setActiveTool('image')
        break
      case 'shapeTool':
        editorStore.setActiveTool('shape')
        break
      case 'frameTool':
        editorStore.setActiveTool('frame')
        break
      case 'selectTool':
        editorStore.setActiveTool('select')
        break
      case 'fitToScreen':
        editor.fitToScreen()
        break
      case 'zoomToActual':
        editor.zoomToActual()
        break
      case 'zoomIn':
        editor.zoomIn()
        break
      case 'zoomOut':
        editor.zoomOut()
        break
      case 'bringForward':
        editorStore.selectedElementIds.forEach(id => editorStore.bringForward(id))
        break
      case 'sendBackward':
        editorStore.selectedElementIds.forEach(id => editorStore.sendBackward(id))
        break
      case 'bringToFront':
        editorStore.selectedElementIds.forEach(id => editorStore.bringToFront(id))
        break
      case 'sendToBack':
        editorStore.selectedElementIds.forEach(id => editorStore.sendToBack(id))
        break
    }
  }, [keyboardShortcutsEnabled, editor, editorStore])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}

// Hook for auto-save functionality
export const useAutoSave = () => {
  const { preferences } = useUIStore()
  const { saveDesign } = useEditor()
  const { isDesignSaved, currentDesign } = useEditorStore()
  const intervalRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (!preferences.autoSave) return

    intervalRef.current = setInterval(() => {
      if (!isDesignSaved && currentDesign) {
        saveDesign()
      }
    }, preferences.autoSaveInterval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [preferences.autoSave, preferences.autoSaveInterval, isDesignSaved, currentDesign, saveDesign])
}

// Hook for element manipulation
export const useElementManipulation = () => {
  const editorStore = useEditorStore()

  const transformElement = useCallback((id: string, transform: {
    x?: number
    y?: number
    width?: number
    height?: number
    rotation?: number
    scaleX?: number
    scaleY?: number
  }) => {
    editorStore.updateElement(id, transform)
  }, [editorStore])

  const setElementStyle = useCallback((id: string, style: Record<string, any>) => {
    editorStore.updateElement(id, { style })
  }, [editorStore])

  const setElementData = useCallback((id: string, data: Record<string, any>) => {
    editorStore.updateElement(id, { data })
  }, [editorStore])

  const alignElements = useCallback((alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    const selectedElements = editorStore.elements.filter(el => 
      editorStore.selectedElementIds.includes(el.id)
    )

    if (selectedElements.length < 2) return

    const bounds = selectedElements.reduce((acc, el) => ({
      left: Math.min(acc.left, el.x),
      right: Math.max(acc.right, el.x + el.width),
      top: Math.min(acc.top, el.y),
      bottom: Math.max(acc.bottom, el.y + el.height)
    }), {
      left: Infinity,
      right: -Infinity,
      top: Infinity,
      bottom: -Infinity
    })

    selectedElements.forEach(el => {
      let updates: Partial<AnyCanvasElement> = {}

      switch (alignment) {
        case 'left':
          updates.x = bounds.left
          break
        case 'center':
          updates.x = bounds.left + (bounds.right - bounds.left) / 2 - el.width / 2
          break
        case 'right':
          updates.x = bounds.right - el.width
          break
        case 'top':
          updates.y = bounds.top
          break
        case 'middle':
          updates.y = bounds.top + (bounds.bottom - bounds.top) / 2 - el.height / 2
          break
        case 'bottom':
          updates.y = bounds.bottom - el.height
          break
      }

      editorStore.updateElement(el.id, updates)
    })
  }, [editorStore])

  const distributeElements = useCallback((direction: 'horizontal' | 'vertical') => {
    const selectedElements = editorStore.elements.filter(el => 
      editorStore.selectedElementIds.includes(el.id)
    )

    if (selectedElements.length < 3) return

    selectedElements.sort((a, b) => direction === 'horizontal' ? a.x - b.x : a.y - b.y)

    const first = selectedElements[0]
    const last = selectedElements[selectedElements.length - 1]
    const totalSpace = direction === 'horizontal' 
      ? last.x - (first.x + first.width)
      : last.y - (first.y + first.height)
    
    const spacing = totalSpace / (selectedElements.length - 1)

    for (let i = 1; i < selectedElements.length - 1; i++) {
      const el = selectedElements[i]
      const updates: Partial<AnyCanvasElement> = {}
      
      if (direction === 'horizontal') {
        updates.x = first.x + first.width + spacing * i
      } else {
        updates.y = first.y + first.height + spacing * i
      }
      
      editorStore.updateElement(el.id, updates)
    }
  }, [editorStore])

  return {
    transformElement,
    setElementStyle,
    setElementData,
    alignElements,
    distributeElements
  }
}