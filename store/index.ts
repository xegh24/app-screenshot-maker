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

// Export editor types
export type {
  CanvasElement,
  TextElement,
  ImageElement,
  ShapeElement,
  FrameElement,
  BackgroundElement,
  AnyCanvasElement,
  CanvasState,
  HistoryState,
  EditorState
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