import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { persist } from 'zustand/middleware'

// Modal types
export type ModalType = 
  | 'settings'
  | 'export'
  | 'import'
  | 'templates'
  | 'upload'
  | 'save'
  | 'confirm'
  | 'profile'
  | 'billing'
  | 'keyboard-shortcuts'
  | 'about'
  | null

// Sidebar panel types
export type SidebarPanel = 
  | 'layers'
  | 'properties'
  | 'assets'
  | 'templates'
  | 'history'
  | null

// Notification types
export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
  createdAt: number
}

// Confirm dialog configuration
export interface ConfirmDialog {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel?: () => void
  variant?: 'danger' | 'default'
}

// Context menu item
export interface ContextMenuItem {
  id: string
  label: string
  icon?: string
  shortcut?: string
  disabled?: boolean
  separator?: boolean
  onClick: () => void
}

// Context menu state
export interface ContextMenu {
  x: number
  y: number
  items: ContextMenuItem[]
}

// Toolbar configuration
export interface ToolbarConfig {
  showGrid: boolean
  showRulers: boolean
  showGuides: boolean
  snapToGrid: boolean
  snapToGuides: boolean
  snapToObjects: boolean
}

// UI preferences
export interface UIPreferences {
  theme: 'light' | 'dark' | 'system'
  sidebarWidth: number
  panelWidth: number
  showTooltips: boolean
  autoSave: boolean
  autoSaveInterval: number
  showWelcomeScreen: boolean
  compactMode: boolean
}

// UI state interface
export interface UIState {
  // Modal state
  activeModal: ModalType
  modalData: any
  
  // Sidebar state
  sidebarVisible: boolean
  sidebarPanel: SidebarPanel
  sidebarWidth: number
  
  // Panel state
  rightPanelVisible: boolean
  rightPanelWidth: number
  
  // Notifications
  notifications: Notification[]
  
  // Confirm dialog
  confirmDialog: ConfirmDialog | null
  
  // Context menu
  contextMenu: ContextMenu | null
  
  // Toolbar
  toolbarConfig: ToolbarConfig
  
  // Loading states
  isLoading: boolean
  loadingMessage: string
  
  // Preferences
  preferences: UIPreferences
  
  // Keyboard shortcuts
  keyboardShortcutsEnabled: boolean
  
  // Actions
  // Modal actions
  openModal: (modal: ModalType, data?: any) => void
  closeModal: () => void
  
  // Sidebar actions
  toggleSidebar: () => void
  setSidebarVisible: (visible: boolean) => void
  setSidebarPanel: (panel: SidebarPanel) => void
  setSidebarWidth: (width: number) => void
  
  // Panel actions
  toggleRightPanel: () => void
  setRightPanelVisible: (visible: boolean) => void
  setRightPanelWidth: (width: number) => void
  
  // Notification actions
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
  
  // Confirm dialog actions
  showConfirmDialog: (config: ConfirmDialog) => void
  hideConfirmDialog: () => void
  
  // Context menu actions
  showContextMenu: (x: number, y: number, items: ContextMenuItem[]) => void
  hideContextMenu: () => void
  
  // Toolbar actions
  updateToolbarConfig: (config: Partial<ToolbarConfig>) => void
  
  // Loading actions
  setLoading: (loading: boolean, message?: string) => void
  
  // Preferences actions
  updatePreferences: (preferences: Partial<UIPreferences>) => void
  
  // Keyboard shortcuts
  toggleKeyboardShortcuts: () => void
  
  // Utility actions
  resetUI: () => void
}

// Default preferences
const defaultPreferences: UIPreferences = {
  theme: 'system',
  sidebarWidth: 300,
  panelWidth: 300,
  showTooltips: true,
  autoSave: true,
  autoSaveInterval: 30000, // 30 seconds
  showWelcomeScreen: true,
  compactMode: false
}

// Default toolbar config
const defaultToolbarConfig: ToolbarConfig = {
  showGrid: false,
  showRulers: true,
  showGuides: true,
  snapToGrid: false,
  snapToGuides: true,
  snapToObjects: true
}

// Create the UI store
export const useUIStore = create<UIState>()(
  persist(
    immer((set, get) => ({
      // Initial state
      activeModal: null,
      modalData: null,
      sidebarVisible: true,
      sidebarPanel: 'layers',
      sidebarWidth: 300,
      rightPanelVisible: true,
      rightPanelWidth: 300,
      notifications: [],
      confirmDialog: null,
      contextMenu: null,
      toolbarConfig: defaultToolbarConfig,
      isLoading: false,
      loadingMessage: '',
      preferences: defaultPreferences,
      keyboardShortcutsEnabled: true,

      // Modal actions
      openModal: (modal, data) => set((state) => {
        state.activeModal = modal
        state.modalData = data || null
      }),

      closeModal: () => set((state) => {
        state.activeModal = null
        state.modalData = null
      }),

      // Sidebar actions
      toggleSidebar: () => set((state) => {
        state.sidebarVisible = !state.sidebarVisible
      }),

      setSidebarVisible: (visible) => set((state) => {
        state.sidebarVisible = visible
      }),

      setSidebarPanel: (panel) => set((state) => {
        state.sidebarPanel = panel
        if (panel && !state.sidebarVisible) {
          state.sidebarVisible = true
        }
      }),

      setSidebarWidth: (width) => set((state) => {
        state.sidebarWidth = Math.max(200, Math.min(600, width))
        state.preferences.sidebarWidth = state.sidebarWidth
      }),

      // Panel actions
      toggleRightPanel: () => set((state) => {
        state.rightPanelVisible = !state.rightPanelVisible
      }),

      setRightPanelVisible: (visible) => set((state) => {
        state.rightPanelVisible = visible
      }),

      setRightPanelWidth: (width) => set((state) => {
        state.rightPanelWidth = Math.max(200, Math.min(600, width))
        state.preferences.panelWidth = state.rightPanelWidth
      }),

      // Notification actions
      addNotification: (notification) => set((state) => {
        const newNotification: Notification = {
          ...notification,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          createdAt: Date.now()
        }
        
        state.notifications.push(newNotification)

        // Auto-remove notification after duration
        if (notification.duration !== 0) {
          const duration = notification.duration || 5000
          setTimeout(() => {
            get().removeNotification(newNotification.id)
          }, duration)
        }
      }),

      removeNotification: (id) => set((state) => {
        state.notifications = state.notifications.filter(n => n.id !== id)
      }),

      clearNotifications: () => set((state) => {
        state.notifications = []
      }),

      // Confirm dialog actions
      showConfirmDialog: (config) => set((state) => {
        state.confirmDialog = config
      }),

      hideConfirmDialog: () => set((state) => {
        state.confirmDialog = null
      }),

      // Context menu actions
      showContextMenu: (x, y, items) => set((state) => {
        state.contextMenu = { x, y, items }
      }),

      hideContextMenu: () => set((state) => {
        state.contextMenu = null
      }),

      // Toolbar actions
      updateToolbarConfig: (config) => set((state) => {
        state.toolbarConfig = { ...state.toolbarConfig, ...config }
      }),

      // Loading actions
      setLoading: (loading, message = '') => set((state) => {
        state.isLoading = loading
        state.loadingMessage = message
      }),

      // Preferences actions
      updatePreferences: (preferences) => set((state) => {
        state.preferences = { ...state.preferences, ...preferences }
        
        // Update related state
        if (preferences.sidebarWidth) {
          state.sidebarWidth = preferences.sidebarWidth
        }
        if (preferences.panelWidth) {
          state.rightPanelWidth = preferences.panelWidth
        }
      }),

      // Keyboard shortcuts
      toggleKeyboardShortcuts: () => set((state) => {
        state.keyboardShortcutsEnabled = !state.keyboardShortcutsEnabled
      }),

      // Utility actions
      resetUI: () => set((state) => {
        state.activeModal = null
        state.modalData = null
        state.sidebarVisible = true
        state.sidebarPanel = 'layers'
        state.sidebarWidth = 300
        state.rightPanelVisible = true
        state.rightPanelWidth = 300
        state.notifications = []
        state.confirmDialog = null
        state.contextMenu = null
        state.toolbarConfig = defaultToolbarConfig
        state.isLoading = false
        state.loadingMessage = ''
        state.preferences = defaultPreferences
        state.keyboardShortcutsEnabled = true
      })
    })),
    {
      name: 'ui-store',
      partialize: (state) => ({
        sidebarVisible: state.sidebarVisible,
        sidebarPanel: state.sidebarPanel,
        sidebarWidth: state.sidebarWidth,
        rightPanelVisible: state.rightPanelVisible,
        rightPanelWidth: state.rightPanelWidth,
        toolbarConfig: state.toolbarConfig,
        preferences: state.preferences,
        keyboardShortcutsEnabled: state.keyboardShortcutsEnabled
      })
    }
  )
)

// Helper hooks for common UI operations
export const useNotifications = () => {
  const { notifications, addNotification, removeNotification, clearNotifications } = useUIStore()
  
  return {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    // Convenience methods
    showSuccess: (title: string, message: string) => 
      addNotification({ type: 'success', title, message }),
    showError: (title: string, message: string) => 
      addNotification({ type: 'error', title, message }),
    showWarning: (title: string, message: string) => 
      addNotification({ type: 'warning', title, message }),
    showInfo: (title: string, message: string) => 
      addNotification({ type: 'info', title, message })
  }
}

export const useConfirmDialog = () => {
  const { confirmDialog, showConfirmDialog, hideConfirmDialog } = useUIStore()
  
  return {
    confirmDialog,
    showConfirmDialog,
    hideConfirmDialog,
    // Convenience method
    confirm: (title: string, message: string, onConfirm: () => void) => 
      showConfirmDialog({ title, message, onConfirm })
  }
}

export const useContextMenu = () => {
  const { contextMenu, showContextMenu, hideContextMenu } = useUIStore()
  
  return {
    contextMenu,
    showContextMenu,
    hideContextMenu
  }
}