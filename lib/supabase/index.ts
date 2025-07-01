// Client exports
export { createClient as createClientClient, supabase } from './client'

// Server exports  
export { createClient as createServerClient, getUser, getSession } from './server'

// Auth helpers
export {
  signUp,
  signIn,
  signInWithProvider,
  signOut,
  resetPassword,
  updatePassword,
  getServerUser,
  getServerSession,
  isAuthenticated,
  requireAuth,
} from './auth-helpers'

// Database queries
export {
  // Design queries
  getDesigns,
  getDesign,
  createDesign,
  updateDesign,
  deleteDesign,
  
  // Template queries
  getTemplates,
  getFeaturedTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  
  // Upload queries
  getUserUploads,
  createUserUpload,
  deleteUserUpload,
  
  // Search functions
  searchDesigns,
  searchTemplates,
  
  // Stats functions
  getUserStats,
  getTemplateCategories,
} from './queries'

// Middleware
export { updateSession } from './middleware'

// Types
export type {
  Database,
  Design,
  DesignInsert,
  DesignUpdate,
  Template,
  TemplateInsert,
  TemplateUpdate,
  UserUpload,
  UserUploadInsert,
  UserUploadUpdate,
  UploadType,
} from '../../types/database'