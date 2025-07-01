'use client'

import React, { useState, useCallback } from 'react'
import { Upload, AlertCircle, CheckCircle, X, Image as ImageIcon } from 'lucide-react'
import { uploadAssets, UploadResult } from '../../lib/storage/assets'
import { optimizeImage, formatFileSize } from '../../lib/images/processing'
import FileDropZone from '../ui/FileDropZone'
import { cn } from '../../lib/utils/cn'

interface ImageUploaderProps {
  onUploadComplete?: (assets: UploadResult[]) => void
  onUploadProgress?: (progress: number) => void
  maxFiles?: number
  autoOptimize?: boolean
  optimizationOptions?: {
    maxWidth?: number
    maxHeight?: number
    quality?: number
  }
  className?: string
}

interface UploadState {
  isUploading: boolean
  progress: number
  results: UploadResult[]
  errors: string[]
}

export default function ImageUploader({
  onUploadComplete,
  onUploadProgress,
  maxFiles = 10,
  autoOptimize = true,
  optimizationOptions = {
    maxWidth: 2048,
    maxHeight: 2048,
    quality: 0.9
  },
  className
}: ImageUploaderProps) {
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    results: [],
    errors: []
  })

  const [showResults, setShowResults] = useState(false)

  // Handle file selection
  const handleFilesSelected = useCallback(async (files: File[]) => {
    if (files.length === 0) return

    setUploadState({
      isUploading: true,
      progress: 0,
      results: [],
      errors: []
    })

    try {
      let filesToUpload = files

      // Optimize images if enabled
      if (autoOptimize) {
        const optimizedFiles: File[] = []
        
        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          
          try {
            // Skip SVG files from optimization
            if (file.type === 'image/svg+xml') {
              optimizedFiles.push(file)
              continue
            }

            const { blob, dimensions } = await optimizeImage(file, optimizationOptions)
            
            // Create new file from optimized blob
            const optimizedFile = new File(
              [blob],
              file.name,
              { type: blob.type, lastModified: Date.now() }
            )
            
            optimizedFiles.push(optimizedFile)
          } catch (error) {
            console.warn(`Failed to optimize ${file.name}:`, error)
            // Use original file if optimization fails
            optimizedFiles.push(file)
          }
        }

        filesToUpload = optimizedFiles
      }

      // Upload files
      const results = await uploadAssets(filesToUpload, {
        uploadType: 'image',
        onProgress: (progress) => {
          setUploadState(prev => ({ ...prev, progress }))
          onUploadProgress?.(progress)
        }
      })

      // Separate successful and failed uploads
      const successfulResults = results.filter(r => r.success)
      const failedResults = results.filter(r => !r.success)
      const errors = failedResults.map(r => r.error || 'Unknown error')

      setUploadState({
        isUploading: false,
        progress: 100,
        results: successfulResults,
        errors
      })

      setShowResults(true)

      // Callback with results
      if (onUploadComplete) {
        onUploadComplete(results)
      }

    } catch (error) {
      console.error('Upload error:', error)
      setUploadState({
        isUploading: false,
        progress: 0,
        results: [],
        errors: [error instanceof Error ? error.message : 'Upload failed']
      })
      setShowResults(true)
    }
  }, [autoOptimize, optimizationOptions, onUploadComplete, onUploadProgress])

  // Handle rejected files
  const handleFilesRejected = useCallback((rejectedFiles: { file: File; error: string }[]) => {
    const errors = rejectedFiles.map(({ file, error }) => `${file.name}: ${error}`)
    setUploadState(prev => ({
      ...prev,
      errors: [...prev.errors, ...errors]
    }))
    setShowResults(true)
  }, [])

  // Close results
  const closeResults = useCallback(() => {
    setShowResults(false)
    setUploadState(prev => ({
      ...prev,
      results: [],
      errors: [],
      progress: 0
    }))
  }, [])

  return (
    <div className={cn('w-full', className)}>
      {/* File Drop Zone */}
      <FileDropZone
        onFilesSelected={handleFilesSelected}
        onFilesRejected={handleFilesRejected}
        maxFiles={maxFiles}
        multiple={true}
        disabled={uploadState.isUploading}
      >
        {uploadState.isUploading ? (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Uploading images...
            </p>
            <div className="w-full max-w-xs bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadState.progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {Math.round(uploadState.progress)}% complete
            </p>
          </div>
        ) : null}
      </FileDropZone>

      {/* Upload Results Modal */}
      {showResults && (uploadState.results.length > 0 || uploadState.errors.length > 0) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-600">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Upload Results
              </h2>
              <button
                onClick={closeResults}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {/* Successful Uploads */}
              {uploadState.results.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">
                      Successfully Uploaded ({uploadState.results.length})
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {uploadState.results.map((result, index) => (
                      result.asset && (
                        <div
                          key={index}
                          className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
                        >
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden">
                              <img
                                src={result.asset.url}
                                alt={result.asset.file_name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.style.display = 'none'
                                  const parent = target.parentElement
                                  if (parent) {
                                    const icon = document.createElement('div')
                                    icon.className = 'w-full h-full flex items-center justify-center'
                                    icon.innerHTML = '<svg class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>'
                                    parent.appendChild(icon)
                                  }
                                }}
                              />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                              {result.asset.file_name}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {formatFileSize(result.asset.file_size)}
                            </p>
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}

              {/* Errors */}
              {uploadState.errors.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">
                      Errors ({uploadState.errors.length})
                    </h3>
                  </div>
                  
                  <div className="space-y-3">
                    {uploadState.errors.map((error, index) => (
                      <div
                        key={index}
                        className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
                      >
                        <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-600">
              <button
                onClick={closeResults}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}