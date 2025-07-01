'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Edit3,
  Copy,
  Trash2,
  Download,
  Eye,
  Calendar,
  Clock,
  MoreHorizontal,
  Loader2,
  AlertCircle,
  Smartphone,
  Tablet,
  Monitor,
  Globe
} from 'lucide-react'
import { Button } from '../ui/Button'
import { Modal, ModalContent, ModalFooter } from '../ui/Modal'
import { useAuthStore } from '../../store/auth'
import { useEditorStore } from '../../store/editor'
import { 
  getUserDesigns, 
  deleteDesign, 
  duplicateDesign,
  exportDesignData,
  type DesignQueryOptions 
} from '../../lib/storage/designs'
import type { Design } from '../../types/database'
import { cn } from '../../lib/utils/cn'

interface DesignGridProps {
  searchQuery?: string
  sortBy?: 'created_at' | 'updated_at' | 'title'
  sortOrder?: 'asc' | 'desc'
  viewMode?: 'grid' | 'list'
  isPublic?: boolean
  onDesignSelect?: (design: Design) => void
}

export function DesignGrid({
  searchQuery = '',
  sortBy = 'updated_at',
  sortOrder = 'desc',
  viewMode = 'grid',
  isPublic,
  onDesignSelect
}: DesignGridProps) {
  const [designs, setDesigns] = useState<Design[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDesign, setSelectedDesign] = useState<Design | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)

  const { isAuthenticated } = useAuthStore()
  const { loadDesign } = useEditorStore()

  // Fetch designs
  const fetchDesigns = async (reset = false) => {
    if (!isAuthenticated()) return

    try {
      const currentPage = reset ? 0 : page
      const options: DesignQueryOptions = {
        limit: 20,
        offset: currentPage * 20,
        sortBy,
        sortOrder,
        search: searchQuery || undefined,
        isPublic
      }

      const result = await getUserDesigns(options)
      
      if (result.error) {
        throw new Error(result.error)
      }

      if (reset) {
        setDesigns(result.designs)
        setPage(0)
      } else {
        setDesigns(prev => [...prev, ...result.designs])
      }

      setHasMore(result.designs.length === 20)
      setError(null)
    } catch (err: any) {
      console.error('Failed to fetch designs:', err)
      setError(err.message || 'Failed to load designs')
    } finally {
      setLoading(false)
    }
  }

  // Load more designs
  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1)
    }
  }

  // Handle design deletion
  const handleDelete = async () => {
    if (!selectedDesign) return

    setActionLoading('delete')
    try {
      const result = await deleteDesign(selectedDesign.id)
      
      if (result.error) {
        throw new Error(result.error)
      }

      // Remove from local state
      setDesigns(prev => prev.filter(d => d.id !== selectedDesign.id))
      setShowDeleteModal(false)
      setSelectedDesign(null)
    } catch (err: any) {
      console.error('Failed to delete design:', err)
      setError(err.message || 'Failed to delete design')
    } finally {
      setActionLoading(null)
    }
  }

  // Handle design duplication
  const handleDuplicate = async (design: Design) => {
    setActionLoading(`duplicate-${design.id}`)
    try {
      const result = await duplicateDesign(design.id)
      
      if (result.error) {
        throw new Error(result.error)
      }

      // Add to local state
      if (result.design) {
        setDesigns(prev => [result.design!, ...prev])
      }
    } catch (err: any) {
      console.error('Failed to duplicate design:', err)
      setError(err.message || 'Failed to duplicate design')
    } finally {
      setActionLoading(null)
    }
  }

  // Handle design export
  const handleExport = async (design: Design) => {
    try {
      const exportData = exportDesignData(design)
      const blob = new Blob([exportData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      
      const a = document.createElement('a')
      a.href = url
      a.download = `${design.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_design.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      
      URL.revokeObjectURL(url)
    } catch (err: any) {
      console.error('Failed to export design:', err)
      setError('Failed to export design')
    }
  }

  // Handle design loading in editor
  const handleEdit = async (design: Design) => {
    try {
      loadDesign(design)
      // Navigate to editor - this would typically be handled by the parent component
      if (onDesignSelect) {
        onDesignSelect(design)
      }
    } catch (err: any) {
      console.error('Failed to load design:', err)
      setError('Failed to load design')
    }
  }

  // Get device icon
  const getDeviceIcon = (canvasData: any) => {
    if (!canvasData?.canvas) return <Monitor className="h-4 w-4" />
    
    const { width, height } = canvasData.canvas
    const aspectRatio = width / height
    
    if (aspectRatio < 0.7) return <Smartphone className="h-4 w-4" />
    if (aspectRatio < 1.2) return <Tablet className="h-4 w-4" />
    return <Monitor className="h-4 w-4" />
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  // Effects
  useEffect(() => {
    fetchDesigns(true)
  }, [searchQuery, sortBy, sortOrder, isPublic])

  useEffect(() => {
    if (page > 0) {
      fetchDesigns()
    }
  }, [page])

  if (loading && designs.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error && designs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Failed to Load Designs</h3>
        <p className="text-muted-foreground mb-4 max-w-sm">{error}</p>
        <Button onClick={() => fetchDesigns(true)}>
          Try Again
        </Button>
      </div>
    )
  }

  if (designs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <Edit3 className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2">No designs found</h3>
        <p className="text-muted-foreground mb-4 max-w-sm">
          {searchQuery 
            ? `No designs match "${searchQuery}". Try a different search term.`
            : 'Start creating your first design to see it here.'
          }
        </p>
        <Button asChild>
          <Link href="/editor">
            <Edit3 className="h-4 w-4 mr-2" />
            Create Design
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className={cn(
        viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
          : 'space-y-4'
      )}>
        {designs.map((design) => (
          <DesignCard
            key={design.id}
            design={design}
            viewMode={viewMode}
            onEdit={() => handleEdit(design)}
            onDuplicate={() => handleDuplicate(design)}
            onDelete={() => {
              setSelectedDesign(design)
              setShowDeleteModal(true)
            }}
            onExport={() => handleExport(design)}
            getDeviceIcon={getDeviceIcon}
            formatDate={formatDate}
            isActionLoading={actionLoading === `duplicate-${design.id}`}
          />
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center mt-8">
          <Button
            onClick={loadMore}
            disabled={loading}
            variant="outline"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </Button>
        </div>
      )}

      {/* Error Message */}
      {error && designs.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
            <span className="text-sm text-red-700">{error}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setError(null)}
              className="ml-auto"
            >
              Dismiss
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Design"
        size="sm"
      >
        <ModalContent>
          <p className="text-muted-foreground">
            Are you sure you want to delete "{selectedDesign?.title}"? This action cannot be undone.
          </p>
        </ModalContent>
        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => setShowDeleteModal(false)}
            disabled={actionLoading === 'delete'}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={actionLoading === 'delete'}
          >
            {actionLoading === 'delete' ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  )
}

// Design Card Component
interface DesignCardProps {
  design: Design
  viewMode: 'grid' | 'list'
  onEdit: () => void
  onDuplicate: () => void
  onDelete: () => void
  onExport: () => void
  getDeviceIcon: (canvasData: any) => React.ReactNode
  formatDate: (dateString: string) => string
  isActionLoading: boolean
}

function DesignCard({ 
  design, 
  viewMode, 
  onEdit, 
  onDuplicate, 
  onDelete, 
  onExport,
  getDeviceIcon,
  formatDate,
  isActionLoading
}: DesignCardProps) {
  const [showMenu, setShowMenu] = useState(false)

  if (viewMode === 'list') {
    return (
      <div className="bg-background border rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-4">
          {/* Preview */}
          <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center overflow-hidden">
            {design.preview_url ? (
              <img
                src={design.preview_url}
                alt={design.title}
                className="w-full h-full object-cover"
              />
            ) : (
              getDeviceIcon(design.canvas_data)
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium truncate">{design.title}</h3>
              {design.is_public && (
                <Globe className="h-3 w-3 text-muted-foreground" />
              )}
            </div>
            <p className="text-sm text-muted-foreground truncate mb-2">
              {design.description || 'No description'}
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Updated {formatDate(design.updated_at)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>Created {formatDate(design.created_at)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onExport}>
              <Download className="h-4 w-4" />
            </Button>
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMenu(!showMenu)}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
              {showMenu && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-background border rounded-md shadow-lg z-10">
                  <button
                    className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                    onClick={() => {
                      onDuplicate()
                      setShowMenu(false)
                    }}
                    disabled={isActionLoading}
                  >
                    {isActionLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    Duplicate
                  </button>
                  <button
                    className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2 text-destructive"
                    onClick={() => {
                      onDelete()
                      setShowMenu(false)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-background border rounded-lg overflow-hidden hover:shadow-md transition-shadow group">
      {/* Preview */}
      <div className="aspect-[3/2] bg-muted flex items-center justify-center relative overflow-hidden">
        {design.preview_url ? (
          <img
            src={design.preview_url}
            alt={design.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center">
            {getDeviceIcon(design.canvas_data)}
          </div>
        )}
        
        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="sm" variant="secondary" onClick={onEdit}>
            <Edit3 className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button size="sm" variant="secondary" onClick={onExport}>
            <Eye className="h-4 w-4 mr-1" />
            Preview
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium truncate">{design.title}</h3>
              {design.is_public && (
                <Globe className="h-3 w-3 text-muted-foreground" />
              )}
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {design.description || 'No description'}
            </p>
          </div>
          
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setShowMenu(!showMenu)}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-background border rounded-md shadow-lg z-10">
                <button
                  className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                  onClick={() => {
                    onDuplicate()
                    setShowMenu(false)
                  }}
                  disabled={isActionLoading}
                >
                  {isActionLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  Duplicate
                </button>
                <button
                  className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                  onClick={() => {
                    onExport()
                    setShowMenu(false)
                  }}
                >
                  <Download className="h-4 w-4" />
                  Export
                </button>
                <hr className="my-1" />
                <button
                  className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2 text-destructive"
                  onClick={() => {
                    onDelete()
                    setShowMenu(false)
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>Updated {formatDate(design.updated_at)}</span>
        </div>
      </div>
    </div>
  )
}