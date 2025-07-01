'use client'

import React, { useCallback, useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon, File } from 'lucide-react'
import { cn } from '../../lib/utils/cn'
import { validateImageFile, formatFileSize, getImageDimensions } from '../../lib/images/processing'

interface FileDropZoneProps {
  onFilesSelected: (files: File[]) => void
  onFilesRejected?: (rejectedFiles: { file: File; error: string }[]) => void
  accept?: string
  maxFiles?: number
  maxSize?: number
  multiple?: boolean
  disabled?: boolean
  className?: string
  children?: React.ReactNode
}

interface FilePreview {
  file: File
  preview: string
  dimensions?: { width: number; height: number }
  error?: string
}

export default function FileDropZone({
  onFilesSelected,
  onFilesRejected,
  accept = 'image/*',
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB
  multiple = true,
  disabled = false,
  className,
  children
}: FileDropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [previews, setPreviews] = useState<FilePreview[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dragCounterRef = useRef(0)

  // Handle drag events
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    dragCounterRef.current++
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragOver(true)
    }
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    dragCounterRef.current--
    if (dragCounterRef.current === 0) {
      setIsDragOver(false)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  // Process files and create previews
  const processFiles = useCallback(async (files: File[]) => {
    const validFiles: File[] = []
    const rejectedFiles: { file: File; error: string }[] = []
    const newPreviews: FilePreview[] = []

    for (const file of files) {
      // Validate file
      const validation = validateImageFile(file)
      
      if (!validation.isValid) {
        rejectedFiles.push({ file, error: validation.error || 'Invalid file' })
        continue
      }

      // Check file count limit
      if (validFiles.length >= maxFiles) {
        rejectedFiles.push({ file, error: `Maximum ${maxFiles} files allowed` })
        continue
      }

      validFiles.push(file)

      // Create preview
      const preview = URL.createObjectURL(file)
      const filePreview: FilePreview = { file, preview }

      try {
        // Get image dimensions for image files
        if (file.type.startsWith('image/') && file.type !== 'image/svg+xml') {
          const dimensions = await getImageDimensions(file)
          filePreview.dimensions = dimensions
        }
      } catch (error) {
        filePreview.error = 'Could not load image'
      }

      newPreviews.push(filePreview)
    }

    setPreviews(prev => [...prev, ...newPreviews])

    if (validFiles.length > 0) {
      onFilesSelected(validFiles)
    }

    if (rejectedFiles.length > 0 && onFilesRejected) {
      onFilesRejected(rejectedFiles)
    }
  }, [maxFiles, onFilesSelected, onFilesRejected])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    setIsDragOver(false)
    dragCounterRef.current = 0

    if (disabled) return

    const droppedFiles = Array.from(e.dataTransfer.files)
    await processFiles(droppedFiles)
  }, [disabled, processFiles])

  // Handle file input change
  const handleFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    await processFiles(selectedFiles)
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [processFiles])

  // Remove preview
  const removePreview = useCallback((index: number) => {
    setPreviews(prev => {
      const newPreviews = [...prev]
      const removed = newPreviews.splice(index, 1)[0]
      URL.revokeObjectURL(removed.preview)
      return newPreviews
    })
  }, [])

  // Clear all previews
  const clearPreviews = useCallback(() => {
    previews.forEach(preview => URL.revokeObjectURL(preview.preview))
    setPreviews([])
  }, [previews])

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      previews.forEach(preview => URL.revokeObjectURL(preview.preview))
    }
  }, [])

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div className="w-full">
      {/* Drop Zone */}
      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg transition-colors cursor-pointer',
          isDragOver
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInput}
          disabled={disabled}
          className="hidden"
        />

        {children || (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <Upload className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {isDragOver ? 'Drop files here' : 'Drop files or click to upload'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Supports images up to {formatFileSize(maxSize)}
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <ImageIcon className="h-4 w-4" />
              <span>JPEG, PNG, GIF, WebP, SVG</span>
            </div>
          </div>
        )}

        {isDragOver && (
          <div className="absolute inset-0 bg-blue-500/10 rounded-lg flex items-center justify-center">
            <div className="text-blue-600 dark:text-blue-400 font-medium">
              Drop files to upload
            </div>
          </div>
        )}
      </div>

      {/* File Previews */}
      {previews.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Selected Files ({previews.length})
            </h3>
            <button
              onClick={clearPreviews}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Clear all
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {previews.map((preview, index) => (
              <div
                key={index}
                className="relative group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3"
              >
                {/* Remove button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    removePreview(index)
                  }}
                  className="absolute -top-2 -right-2 z-10 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>

                {/* Preview */}
                <div className="aspect-square mb-2 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden">
                  {preview.file.type.startsWith('image/') ? (
                    <img
                      src={preview.preview}
                      alt={preview.file.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <File className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* File info */}
                <div className="space-y-1 text-xs">
                  <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                    {preview.file.name}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400">
                    {formatFileSize(preview.file.size)}
                  </p>
                  {preview.dimensions && (
                    <p className="text-gray-500 dark:text-gray-400">
                      {preview.dimensions.width} × {preview.dimensions.height}
                    </p>
                  )}
                  {preview.error && (
                    <p className="text-red-500 text-xs">{preview.error}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}