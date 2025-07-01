import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import type { Design } from '../types/database'

// Canvas element types
export interface CanvasElement {
  id: string
  type: 'text' | 'image' | 'shape' | 'frame' | 'background'
  x: number
  y: number
  width: number
  height: number
  rotation: number
  scaleX: number
  scaleY: number
  opacity: number
  visible: boolean
  locked: boolean
  zIndex: number
  style: Record<string, any>
  data: Record<string, any>
}

// Text element specific properties
export interface TextElement extends CanvasElement {
  type: 'text'
  data: {
    text: string
    fontSize: number
    fontFamily: string
    fontWeight: string
    fontStyle: string
    textAlign: string
    textDecoration: string
    color: string
    lineHeight: number
    letterSpacing: number
  }
}

// Image element specific properties
export interface ImageElement extends CanvasElement {
  type: 'image'
  data: {
    src: string
    originalWidth: number
    originalHeight: number
    fit: 'cover' | 'contain' | 'fill' | 'stretch'
    filters: {
      brightness: number
      contrast: number
      saturation: number
      blur: number
      grayscale: number
      sepia: number
    }
  }
}

// Shape element specific properties
export interface ShapeElement extends CanvasElement {
  type: 'shape'
  data: {
    shape: 'rectangle' | 'circle' | 'triangle' | 'polygon'
    fill: string
    stroke: string
    strokeWidth: number
    cornerRadius?: number
    sides?: number
  }
}

// Frame element specific properties
export interface FrameElement extends CanvasElement {
  type: 'frame'
  data: {
    src: string
    frameType: 'browser' | 'mobile' | 'desktop' | 'tablet'
    contentId?: string
  }
}

// Background element specific properties
export interface BackgroundElement extends CanvasElement {
  type: 'background'
  data: {
    backgroundType: 'color' | 'gradient' | 'image'
    color?: string
    gradient?: {
      type: 'linear' | 'radial'
      colors: Array<{ color: string; stop: number }>
      angle?: number
    }
    image?: {
      src: string
      fit: 'cover' | 'contain' | 'repeat' | 'stretch'
      opacity: number
    }
  }
}

export type AnyCanvasElement = TextElement | ImageElement | ShapeElement | FrameElement | BackgroundElement

// Canvas state
export interface CanvasState {
  width: number
  height: number
  zoom: number
  offsetX: number
  offsetY: number
  gridEnabled: boolean
  snapToGrid: boolean
  gridSize: number
  backgroundColor: string
}

// History state for undo/redo
export interface HistoryState {
  elements: AnyCanvasElement[]
  timestamp: number
}

// Editor store interface
export interface EditorState {
  // Canvas state
  canvas: CanvasState
  elements: AnyCanvasElement[]
  selectedElementIds: string[]
  
  // Current design
  currentDesign: any | null
  isDesignSaved: boolean
  lastSavedAt: number | null
  autoSaveEnabled: boolean
  autoSaveInterval: number
  lastAutoSave: number | null
  
  // History for undo/redo
  history: HistoryState[]
  historyIndex: number
  maxHistorySize: number
  
  // Tool state
  activeTool: 'select' | 'text' | 'image' | 'shape' | 'frame' | 'background' | 'crop'
  isDrawing: boolean
  
  // Clipboard
  clipboard: AnyCanvasElement[]
  
  // Actions
  // Canvas actions
  setCanvasSize: (width: number, height: number) => void
  setZoom: (zoom: number) => void
  setOffset: (offsetX: number, offsetY: number) => void
  toggleGrid: () => void
  toggleSnapToGrid: () => void
  setGridSize: (size: number) => void
  setBackgroundColor: (color: string) => void
  resetCanvas: () => void
  
  // Element actions
  addElement: (element: Omit<AnyCanvasElement, 'id' | 'zIndex'>) => void
  updateElement: (id: string, updates: Partial<AnyCanvasElement>) => void
  deleteElement: (id: string) => void
  deleteElements: (ids: string[]) => void
  duplicateElement: (id: string) => void
  duplicateElements: (ids: string[]) => void
  
  // Element ordering
  bringToFront: (id: string) => void
  sendToBack: (id: string) => void
  bringForward: (id: string) => void
  sendBackward: (id: string) => void
  
  // Selection actions
  selectElement: (id: string) => void
  selectElements: (ids: string[]) => void
  toggleElementSelection: (id: string) => void
  clearSelection: () => void
  selectAll: () => void
  
  // Clipboard actions
  copyElements: (ids?: string[]) => void
  cutElements: (ids?: string[]) => void
  pasteElements: () => void
  
  // Tool actions
  setActiveTool: (tool: EditorState['activeTool']) => void
  setIsDrawing: (isDrawing: boolean) => void
  
  // History actions
  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean
  saveToHistory: () => void
  clearHistory: () => void
  
  // Design actions
  setCurrentDesign: (design: any | null) => void
  markAsUnsaved: () => void
  markAsSaved: () => void
  loadDesign: (design: any) => void
  exportCanvas: () => AnyCanvasElement[]
  importCanvas: (elements: AnyCanvasElement[]) => void
  
  // Auto-save actions
  setAutoSaveEnabled: (enabled: boolean) => void
  setAutoSaveInterval: (interval: number) => void
  triggerAutoSave: () => Promise<void>
  getAutoSaveData: () => { canvasData: any; hasChanges: boolean }
}

// Default canvas state
const defaultCanvasState: CanvasState = {
  width: 1200,
  height: 800,
  zoom: 1,
  offsetX: 0,
  offsetY: 0,
  gridEnabled: false,
  snapToGrid: false,
  gridSize: 20,
  backgroundColor: '#ffffff'
}

// Create the editor store
export const useEditorStore = create<EditorState>()(
  persist(
    immer((set, get) => ({
      // Initial state
      canvas: defaultCanvasState,
      elements: [],
      selectedElementIds: [],
      currentDesign: null,
      isDesignSaved: true,
      lastSavedAt: null,
      autoSaveEnabled: true,
      autoSaveInterval: 30000, // 30 seconds
      lastAutoSave: null,
      history: [],
      historyIndex: -1,
      maxHistorySize: 50,
      activeTool: 'select',
      isDrawing: false,
      clipboard: [],

      // Canvas actions
      setCanvasSize: (width, height) => set((state) => {
        state.canvas.width = width
        state.canvas.height = height
        state.isDesignSaved = false
      }),

      setZoom: (zoom) => set((state) => {
        state.canvas.zoom = Math.max(0.1, Math.min(5, zoom))
      }),

      setOffset: (offsetX, offsetY) => set((state) => {
        state.canvas.offsetX = offsetX
        state.canvas.offsetY = offsetY
      }),

      toggleGrid: () => set((state) => {
        state.canvas.gridEnabled = !state.canvas.gridEnabled
      }),

      toggleSnapToGrid: () => set((state) => {
        state.canvas.snapToGrid = !state.canvas.snapToGrid
      }),

      setGridSize: (size) => set((state) => {
        state.canvas.gridSize = size
      }),

      setBackgroundColor: (color) => set((state) => {
        state.canvas.backgroundColor = color
        state.isDesignSaved = false
      }),

      resetCanvas: () => set((state) => {
        state.canvas = defaultCanvasState
        state.elements = []
        state.selectedElementIds = []
        state.history = []
        state.historyIndex = -1
        state.activeTool = 'select'
        state.isDrawing = false
        state.clipboard = []
      }),

      // Element actions
      addElement: (element) => set((state) => {
        const newElement: AnyCanvasElement = {
          ...element,
          id: nanoid(),
          zIndex: state.elements.length
        } as AnyCanvasElement

        state.elements.push(newElement)
        state.selectedElementIds = [newElement.id]
        state.isDesignSaved = false
        get().saveToHistory()
      }),

      updateElement: (id, updates) => set((state) => {
        const elementIndex = state.elements.findIndex(el => el.id === id)
        if (elementIndex !== -1) {
          state.elements[elementIndex] = { ...state.elements[elementIndex], ...updates } as any
          state.isDesignSaved = false
        }
      }),

      deleteElement: (id) => set((state) => {
        state.elements = state.elements.filter(el => el.id !== id)
        state.selectedElementIds = state.selectedElementIds.filter(selId => selId !== id)
        state.isDesignSaved = false
        get().saveToHistory()
      }),

      deleteElements: (ids) => set((state) => {
        state.elements = state.elements.filter(el => !ids.includes(el.id))
        state.selectedElementIds = state.selectedElementIds.filter(selId => !ids.includes(selId))
        state.isDesignSaved = false
        get().saveToHistory()
      }),

      duplicateElement: (id) => set((state) => {
        const element = state.elements.find(el => el.id === id)
        if (element) {
          const newElement: AnyCanvasElement = {
            ...element,
            id: nanoid(),
            x: element.x + 20,
            y: element.y + 20,
            zIndex: state.elements.length
          }
          state.elements.push(newElement)
          state.selectedElementIds = [newElement.id]
          state.isDesignSaved = false
          get().saveToHistory()
        }
      }),

      duplicateElements: (ids) => set((state) => {
        const elementsToDuplicate = state.elements.filter(el => ids.includes(el.id))
        const newElements: AnyCanvasElement[] = elementsToDuplicate.map(element => ({
          ...element,
          id: nanoid(),
          x: element.x + 20,
          y: element.y + 20,
          zIndex: state.elements.length + elementsToDuplicate.indexOf(element)
        }))
        
        state.elements.push(...newElements)
        state.selectedElementIds = newElements.map(el => el.id)
        state.isDesignSaved = false
        get().saveToHistory()
      }),

      // Element ordering
      bringToFront: (id) => set((state) => {
        const element = state.elements.find(el => el.id === id)
        if (element) {
          const maxZIndex = Math.max(...state.elements.map(el => el.zIndex))
          element.zIndex = maxZIndex + 1
          state.isDesignSaved = false
        }
      }),

      sendToBack: (id) => set((state) => {
        const element = state.elements.find(el => el.id === id)
        if (element) {
          const minZIndex = Math.min(...state.elements.map(el => el.zIndex))
          element.zIndex = minZIndex - 1
          state.isDesignSaved = false
        }
      }),

      bringForward: (id) => set((state) => {
        const element = state.elements.find(el => el.id === id)
        if (element) {
          element.zIndex += 1
          state.isDesignSaved = false
        }
      }),

      sendBackward: (id) => set((state) => {
        const element = state.elements.find(el => el.id === id)
        if (element) {
          element.zIndex = Math.max(0, element.zIndex - 1)
          state.isDesignSaved = false
        }
      }),

      // Selection actions
      selectElement: (id) => set((state) => {
        state.selectedElementIds = [id]
      }),

      selectElements: (ids) => set((state) => {
        state.selectedElementIds = ids
      }),

      toggleElementSelection: (id) => set((state) => {
        if (state.selectedElementIds.includes(id)) {
          state.selectedElementIds = state.selectedElementIds.filter(selId => selId !== id)
        } else {
          state.selectedElementIds.push(id)
        }
      }),

      clearSelection: () => set((state) => {
        state.selectedElementIds = []
      }),

      selectAll: () => set((state) => {
        state.selectedElementIds = state.elements.map(el => el.id)
      }),

      // Clipboard actions
      copyElements: (ids) => set((state) => {
        const elementIds = ids || state.selectedElementIds
        state.clipboard = state.elements.filter(el => elementIds.includes(el.id))
      }),

      cutElements: (ids) => set((state) => {
        const elementIds = ids || state.selectedElementIds
        state.clipboard = state.elements.filter(el => elementIds.includes(el.id))
        state.elements = state.elements.filter(el => !elementIds.includes(el.id))
        state.selectedElementIds = []
        state.isDesignSaved = false
        get().saveToHistory()
      }),

      pasteElements: () => set((state) => {
        if (state.clipboard.length > 0) {
          const newElements: AnyCanvasElement[] = state.clipboard.map(element => ({
            ...element,
            id: nanoid(),
            x: element.x + 20,
            y: element.y + 20,
            zIndex: state.elements.length + state.clipboard.indexOf(element)
          }))
          
          state.elements.push(...newElements)
          state.selectedElementIds = newElements.map(el => el.id)
          state.isDesignSaved = false
          get().saveToHistory()
        }
      }),

      // Tool actions
      setActiveTool: (tool) => set((state) => {
        state.activeTool = tool
        if (tool !== 'select') {
          state.selectedElementIds = []
        }
      }),

      setIsDrawing: (isDrawing) => set((state) => {
        state.isDrawing = isDrawing
      }),

      // History actions
      saveToHistory: () => set((state) => {
        const newHistoryState: HistoryState = {
          elements: JSON.parse(JSON.stringify(state.elements)),
          timestamp: Date.now()
        }

        // Remove any history after current index
        state.history = state.history.slice(0, state.historyIndex + 1)
        
        // Add new state
        state.history.push(newHistoryState)
        state.historyIndex = state.history.length - 1

        // Limit history size
        if (state.history.length > state.maxHistorySize) {
          state.history = state.history.slice(-state.maxHistorySize)
          state.historyIndex = state.history.length - 1
        }
      }),

      undo: () => set((state) => {
        if (state.historyIndex > 0) {
          state.historyIndex -= 1
          const historyState = state.history[state.historyIndex]
          state.elements = JSON.parse(JSON.stringify(historyState.elements))
          state.selectedElementIds = []
          state.isDesignSaved = false
        }
      }),

      redo: () => set((state) => {
        if (state.historyIndex < state.history.length - 1) {
          state.historyIndex += 1
          const historyState = state.history[state.historyIndex]
          state.elements = JSON.parse(JSON.stringify(historyState.elements))
          state.selectedElementIds = []
          state.isDesignSaved = false
        }
      }),

      canUndo: () => {
        const state = get()
        return state.historyIndex > 0
      },

      canRedo: () => {
        const state = get()
        return state.historyIndex < state.history.length - 1
      },

      clearHistory: () => set((state) => {
        state.history = []
        state.historyIndex = -1
      }),

      // Design actions
      setCurrentDesign: (design) => set((state) => {
        state.currentDesign = design as any
        state.isDesignSaved = true
        state.lastSavedAt = Date.now()
      }),

      markAsUnsaved: () => set((state) => {
        state.isDesignSaved = false
      }),

      markAsSaved: () => set((state) => {
        state.isDesignSaved = true
        state.lastSavedAt = Date.now()
      }),

      loadDesign: (design) => set((state) => {
        try {
          const canvasData = (design as any).canvas_data
          state.currentDesign = design as any
          state.elements = canvasData.elements || []
          state.canvas = { ...defaultCanvasState, ...(canvasData.canvas || {}) }
          state.selectedElementIds = []
          state.history = []
          state.historyIndex = -1
          state.isDesignSaved = true
          state.lastSavedAt = Date.now()
          get().saveToHistory()
        } catch (error) {
          console.error('Failed to load design:', error)
        }
      }),

      exportCanvas: () => {
        const state = get()
        return JSON.parse(JSON.stringify(state.elements))
      },

      importCanvas: (elements) => set((state) => {
        state.elements = JSON.parse(JSON.stringify(elements))
        state.selectedElementIds = []
        state.isDesignSaved = false
        get().saveToHistory()
      }),

      // Auto-save actions
      setAutoSaveEnabled: (enabled) => set((state) => {
        state.autoSaveEnabled = enabled
      }),

      setAutoSaveInterval: (interval) => set((state) => {
        state.autoSaveInterval = Math.max(10000, interval) // Minimum 10 seconds
      }),

      getAutoSaveData: () => {
        const state = get()
        const canvasData = {
          canvas: state.canvas,
          elements: state.exportCanvas(),
          version: '1.0',
          timestamp: Date.now()
        }
        
        const hasChanges = Boolean(!state.isDesignSaved || 
          (state.lastAutoSave && Date.now() - state.lastAutoSave > state.autoSaveInterval))
        
        return { canvasData, hasChanges }
      },

      triggerAutoSave: async () => {
        const state = get()
        
        if (!state.autoSaveEnabled || state.isDesignSaved) {
          return
        }

        try {
          // Import the auto-save function dynamically to avoid circular dependencies
          const { autoSaveDesign } = await import('../lib/storage/designs')
          
          const { canvasData } = state.getAutoSaveData()
          const title = state.currentDesign?.title || 'Untitled Design'
          
          const result = await autoSaveDesign(
            state.currentDesign?.id || null,
            canvasData,
            title
          )
          
          if (result.design) {
            // Update current design if it was a new save
            if (!state.currentDesign) {
              set((state) => {
                state.currentDesign = result.design
              })
            }
            
            set((state) => {
              state.lastAutoSave = Date.now()
              // Don't mark as fully saved for auto-saves to distinguish from manual saves
            })
          }
        } catch (error) {
          console.error('Auto-save failed:', error)
          // Don't throw error to avoid disrupting user workflow
        }
      }
    })),
    {
      name: 'editor-store',
      partialize: (state) => ({
        canvas: state.canvas,
        activeTool: state.activeTool
      })
    }
  )
)