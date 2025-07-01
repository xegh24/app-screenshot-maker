'use client'

import React, { useState } from 'react'
import { TemplateWithCanvas, useTemplatesStore } from '../../store/templates'
import { useEditorStore } from '../../store/editor'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { 
  X, 
  Star, 
  Download, 
  Eye, 
  Clock, 
  Tag, 
  User, 
  Copy, 
  Trash2,
  Edit,
  ExternalLink,
  Play
} from 'lucide-react'

interface TemplateModalProps {
  template: TemplateWithCanvas
  onClose: () => void
  onApply: (templateId: string) => void
  showActions?: boolean
}

export const TemplateModal: React.FC<TemplateModalProps> = ({
  template,
  onClose,
  onApply,
  showActions = true
}) => {
  const [isApplying, setIsApplying] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  const { 
    deleteTemplate, 
    duplicateTemplate, 
    recordTemplateUsage,
    isLoading 
  } = useTemplatesStore()
  
  const { importCanvas, setCanvasSize, setBackgroundColor } = useEditorStore()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getCategoryIcon = (category: string) => {
    const icons = {
      'education': '🎓',
      'food': '🍕',
      'e-commerce': '🛒',
      'mobile-app': '📱',
      'web-app': '💻',
      'social-media': '📱',
      'presentation': '📊',
      'marketing': '📢',
      'portfolio': '👤',
      'blog': '📝',
      'dashboard': '📈',
      'landing-page': '🌐',
      'other': '📄'
    }
    return icons[category as keyof typeof icons] || '📄'
  }

  const getCategoryName = (category: string) => {
    const names = {
      'education': 'Education',
      'food': 'Food & Dining',
      'e-commerce': 'E-commerce',
      'mobile-app': 'Mobile App',
      'web-app': 'Web App',
      'social-media': 'Social Media',
      'presentation': 'Presentation',
      'marketing': 'Marketing',
      'portfolio': 'Portfolio',
      'blog': 'Blog',
      'dashboard': 'Dashboard',
      'landing-page': 'Landing Page',
      'other': 'Other'
    }
    return names[category as keyof typeof names] || 'Other'
  }

  const handleApplyTemplate = async () => {
    setIsApplying(true)
    try {
      // Apply template to canvas
      if (template.canvas_data) {
        const { elements, canvas } = template.canvas_data
        
        // Import elements
        if (elements && Array.isArray(elements)) {
          importCanvas(elements)
        }
        
        // Apply canvas settings
        if (canvas) {
          if (canvas.width && canvas.height) {
            setCanvasSize(canvas.width, canvas.height)
          }
          if (canvas.backgroundColor) {
            setBackgroundColor(canvas.backgroundColor)
          }
        }
      }
      
      // Record usage
      await recordTemplateUsage(template.id)
      
      // Notify parent
      onApply(template.id)
    } catch (error) {
      console.error('Failed to apply template:', error)
    } finally {
      setIsApplying(false)
    }
  }

  const handleDuplicate = async () => {
    try {
      const result = await duplicateTemplate(template.id)
      if (result.error) {
        console.error('Failed to duplicate template:', result.error)
      } else {
        console.log('Template duplicated successfully')
        onClose()
      }
    } catch (error) {
      console.error('Failed to duplicate template:', error)
    }
  }

  const handleDelete = async () => {
    try {
      const result = await deleteTemplate(template.id)
      if (result.error) {
        console.error('Failed to delete template:', result.error)
      } else {
        console.log('Template deleted successfully')
        onClose()
      }
    } catch (error) {
      console.error('Failed to delete template:', error)
    }
  }

  const handleOpenInNewTab = () => {
    // This would open the template in a new editor tab
    // For now, we'll just log it
    console.log('Opening template in new tab:', template.id)
  }

  return (
    <Modal isOpen onClose={onClose} className="max-w-4xl">
      <div className="flex flex-col h-full max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{getCategoryIcon(template.category)}</span>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{template.name}</h2>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Tag className="w-4 h-4" />
                  <span>{getCategoryName(template.category)}</span>
                  {template.is_featured && (
                    <>
                      <span>•</span>
                      <div className="flex items-center gap-1 text-yellow-600">
                        <Star className="w-4 h-4 fill-current" />
                        <span>Featured</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
            {/* Template Preview */}
            <div className="space-y-4">
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                {template.preview_url ? (
                  <img
                    src={template.preview_url}
                    alt={template.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                    <span className="text-6xl">{getCategoryIcon(template.category)}</span>
                  </div>
                )}
              </div>

              {/* Canvas Info */}
              {template.canvas_data?.canvas && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Canvas Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Dimensions:</span>
                      <span className="ml-2 font-medium">
                        {template.canvas_data.canvas.width} × {template.canvas_data.canvas.height}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Elements:</span>
                      <span className="ml-2 font-medium">
                        {template.canvas_data.elements?.length || 0}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Template Details */}
            <div className="space-y-6">
              {/* Description */}
              {template.description && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-600 leading-relaxed">{template.description}</p>
                </div>
              )}

              {/* Metadata */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Template Info</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Created:</span>
                    <span className="font-medium">{formatDate(template.created_at)}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Updated:</span>
                    <span className="font-medium">{formatDate(template.updated_at)}</span>
                  </div>

                  {template.created_by && (
                    <div className="flex items-center gap-3 text-sm">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Author:</span>
                      <span className="font-medium">User</span>
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-sm">
                    <Eye className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Usage:</span>
                    <span className="font-medium">0 times</span>
                  </div>
                </div>
              </div>

              {/* Elements Preview */}
              {template.canvas_data?.elements && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Elements ({template.canvas_data.elements.length})</h4>
                  <div className="space-y-2 max-h-32 overflow-auto">
                    {template.canvas_data.elements.map((element: any, index: number) => (
                      <div key={element.id || index} className="flex items-center gap-2 text-sm bg-gray-50 rounded px-3 py-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span className="font-medium capitalize">{element.type}</span>
                        {element.type === 'text' && element.data?.text && (
                          <span className="text-gray-600 truncate">- {element.data.text}</span>
                        )}
                        {element.type === 'image' && element.data?.src && (
                          <span className="text-gray-600 truncate">- Image</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        {showActions && (
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleOpenInNewTab}
                className="flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Preview
              </Button>
              
              <Button
                variant="secondary"
                size="sm"
                onClick={handleDuplicate}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Duplicate
              </Button>

              {/* Show delete only for user's own templates */}
              {template.created_by && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isLoading}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                onClick={onClose}
              >
                Cancel
              </Button>
              
              <Button
                variant="default"
                onClick={handleApplyTemplate}
                disabled={isApplying}
                className="flex items-center gap-2"
              >
                {isApplying ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Applying...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Use This Template
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Template</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete "{template.name}"? This action cannot be undone.
            </p>
            <div className="flex items-center gap-3 justify-end">
              <Button
                variant="secondary"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={handleDelete}
                disabled={isLoading}
                className="bg-red-600 hover:bg-red-700"
              >
                {isLoading ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  )
}