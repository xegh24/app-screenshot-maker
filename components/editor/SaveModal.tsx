'use client'

import { useState, useEffect } from 'react'
import { Save, Loader2, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { Modal, ModalContent, ModalFooter, ModalHeader } from '../ui/Modal'
import { Button } from '../ui/Button'
import { useEditorStore } from '../../store/editor'
import { useAuthStore } from '../../store/auth'
import { saveDesign, updateDesign } from '../../lib/storage/designs'
import type { SaveDesignOptions } from '../../lib/storage/designs'

interface SaveModalProps {
  isOpen: boolean
  onClose: () => void
  onSaved?: (designId: string) => void
}

export function SaveModal({ isOpen, onClose, onSaved }: SaveModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [generatePreview, setGeneratePreview] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const { 
    currentDesign, 
    elements, 
    canvas, 
    exportCanvas,
    setCurrentDesign,
    markAsSaved
  } = useEditorStore()
  
  const { isAuthenticated, canCreateDesign, getRemainingDesigns } = useAuthStore()

  // Initialize form with current design data
  useEffect(() => {
    if (isOpen) {
      if (currentDesign) {
        setTitle(currentDesign.title)
        setDescription(currentDesign.description || '')
        setIsPublic(currentDesign.is_public)
      } else {
        setTitle('Untitled Design')
        setDescription('')
        setIsPublic(false)
      }
      setError(null)
      setSuccess(false)
    }
  }, [isOpen, currentDesign])

  // Check if user can save
  const canSave = isAuthenticated() && (currentDesign || canCreateDesign())
  const remainingDesigns = getRemainingDesigns()

  const handleSave = async () => {
    if (!canSave) return

    setIsSaving(true)
    setError(null)

    try {
      // Prepare canvas data
      const canvasData = {
        canvas,
        elements: exportCanvas(),
        version: '1.0',
        timestamp: Date.now()
      }

      const saveOptions: SaveDesignOptions = {
        title: title.trim() || 'Untitled Design',
        description: description.trim() || undefined,
        isPublic,
        generatePreview,
        canvasData
      }

      let result
      if (currentDesign) {
        // Update existing design
        result = await updateDesign(currentDesign.id, saveOptions)
      } else {
        // Save new design
        result = await saveDesign(saveOptions)
      }

      if (result.error || !result.design) {
        throw new Error(result.error || 'Failed to save design')
      }

      // Update editor state
      setCurrentDesign(result.design)
      markAsSaved()

      setSuccess(true)
      
      // Call onSaved callback
      onSaved?.(result.design.id)

      // Close modal after a brief success message
      setTimeout(() => {
        onClose()
      }, 1500)

    } catch (err: any) {
      console.error('Save failed:', err)
      setError(err.message || 'Failed to save design')
    } finally {
      setIsSaving(false)
    }
  }

  const handleClose = () => {
    if (!isSaving) {
      onClose()
    }
  }

  if (!isAuthenticated()) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="Save Design" size="md">
        <ModalContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Sign In Required</h3>
            <p className="text-muted-foreground mb-4">
              You need to sign in to save your designs.
            </p>
            <Button onClick={handleClose}>
              Sign In
            </Button>
          </div>
        </ModalContent>
      </Modal>
    )
  }

  if (!currentDesign && !canCreateDesign()) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="Save Design" size="md">
        <ModalContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Design Limit Reached</h3>
            <p className="text-muted-foreground mb-4">
              You've reached your design limit. Upgrade to Pro to save more designs.
            </p>
            <Button onClick={handleClose}>
              Upgrade to Pro
            </Button>
          </div>
        </ModalContent>
      </Modal>
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Save Design" size="lg">
      <ModalContent>
        {success ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Design Saved!</h3>
            <p className="text-muted-foreground">
              Your design has been saved successfully.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-2">
                Design Title *
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter design title"
                className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                disabled={isSaving}
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-2">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description for your design (optional)"
                rows={3}
                className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
                disabled={isSaving}
              />
            </div>

            {/* Options */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Options</h4>
              
              {/* Public/Private */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {isPublic ? (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  )}
                  <div>
                    <div className="text-sm font-medium">
                      {isPublic ? 'Public Design' : 'Private Design'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {isPublic 
                        ? 'Anyone can view and use this design'
                        : 'Only you can access this design'
                      }
                    </div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="sr-only peer"
                    disabled={isSaving}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Generate Preview */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Generate Preview</div>
                  <div className="text-xs text-muted-foreground">
                    Create a thumbnail image for this design
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={generatePreview}
                    onChange={(e) => setGeneratePreview(e.target.checked)}
                    className="sr-only peer"
                    disabled={isSaving}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            {/* Info */}
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {currentDesign ? 'Updating existing design' : 'Creating new design'}
                </span>
                {!currentDesign && (
                  <span className="text-muted-foreground">
                    {remainingDesigns} designs remaining
                  </span>
                )}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </ModalContent>

      {!success && (
        <ModalFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !title.trim()}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {currentDesign ? 'Update Design' : 'Save Design'}
              </>
            )}
          </Button>
        </ModalFooter>
      )}
    </Modal>
  )
}