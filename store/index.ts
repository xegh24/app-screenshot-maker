// Export all stores
export * from './editor'
export * from './auth'
export * from './ui'
export * from './templates'

// Export store hooks for convenience
export { useEditorStore } from './editor'
export { useAuthStore } from './auth'
export { useUIStore, useNotifications, useConfirmDialog, useContextMenu } from './ui'
export { useTemplatesStore } from './templates'

// Export types
export type {
  // Editor types
  CanvasElement,
  TextElement,
  ImageElement,
  ShapeElement,
  FrameElement,
  BackgroundElement,
  AnyCanvasElement,
  CanvasState,
  HistoryState,
  EditorState,
  
  // Auth types
  UserProfile,
  AuthState,
  
  // UI types
  ModalType,
  SidebarPanel,
  Notification,
  ConfirmDialog,
  ContextMenuItem,
  ContextMenu,
  ToolbarConfig,
  UIPreferences,
  UIState,
  
  // Template types
  TemplateCategory,
  TemplateFilters,
  TemplateWithCanvas,
  TemplateUsage,
  TemplatesState
} from './editor'

export type { UserProfile, AuthState } from './auth'
export type { 
  ModalType, 
  SidebarPanel, 
  Notification, 
  ConfirmDialog, 
  ContextMenuItem, 
  ContextMenu, 
  ToolbarConfig, 
  UIPreferences, 
  UIState 
} from './ui'
export type { 
  TemplateCategory, 
  TemplateFilters, 
  TemplateWithCanvas, 
  TemplateUsage, 
  TemplatesState 
} from './templates'