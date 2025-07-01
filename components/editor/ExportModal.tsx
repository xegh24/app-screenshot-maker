'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Download, 
  Loader2, 
  Settings, 
  Image, 
  FileText, 
  Smartphone, 
  Monitor, 
  Printer,
  Package,
  CheckCircle,
  AlertCircle,
  X,
  Plus,
  Trash2
} from 'lucide-react'
import { Modal, ModalContent, ModalFooter, ModalHeader } from '../ui/Modal'
import { Button } from '../ui/Button'
import { useEditorStore } from '../../store/editor'
import { 
  exportStageEnhanced,
  batchExport,
  downloadBlob,
  downloadAsZip,
  generateFilename,
  validateExportOptions,
  estimateFileSize,
  formatFileSize,
  EXPORT_PRESETS,
  EXPORT_FORMATS,
  getOptimalExportSettings,
  type EnhancedExportOptions,
  type ExportSize
} from '../../lib/export'
import { ProgressBar, type ProgressItem } from '../ui/ProgressBar'

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
  stage?: any // Konva stage ref
}

interface ExportConfig extends EnhancedExportOptions {
  id: string
  enabled: boolean
  estimatedSize?: number
}

const PRESET_CATEGORIES = [
  { key: 'ios', label: 'iOS App Store', icon: Smartphone },
  { key: 'android', label: 'Google Play', icon: Smartphone },
  { key: 'web', label: 'Web & Social', icon: Monitor },
  { key: 'print', label: 'Print', icon: Printer }
] as const

export function ExportModal({ isOpen, onClose, stage }: ExportModalProps) {
  const [activeTab, setActiveTab] = useState<'single' | 'batch' | 'presets'>('single')
  const [singleExport, setSingleExport] = useState<ExportConfig>({
    id: 'single',
    enabled: true,
    format: 'png',
    quality: 0.9,
    scale: 1,
    includeBackground: true,
    filename: 'design.png'
  })
  const [batchExports, setBatchExports] = useState<ExportConfig[]>([])
  const [selectedPresets, setSelectedPresets] = useState<string[]>([])
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [progressItems, setProgressItems] = useState<ProgressItem[]>([])
  const [exportResults, setExportResults] = useState<Array<{
    filename: string
    success: boolean
    error?: string
    size?: number
  }>>([])
  const [showResults, setShowResults] = useState(false)
  const [showProgress, setShowProgress] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { canvas, selectedElementIds } = useEditorStore()
  const stageRef = useRef<any>(stage)

  // Update stage ref when prop changes
  useEffect(() => {
    stageRef.current = stage
  }, [stage])

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setError(null)
      setShowResults(false)
      setShowProgress(false)
      setExportResults([])
      setProgressItems([])
      setExportProgress(0)
      
      // Update single export filename
      const filename = generateFilename('design', singleExport.format)
      setSingleExport(prev => ({ ...prev, filename }))
      
      // Update estimated size
      updateEstimatedSize()
    }
  }, [isOpen])

  // Update estimated size when export options change
  useEffect(() => {
    updateEstimatedSize()
  }, [singleExport, canvas])

  const updateEstimatedSize = () => {
    if (singleExport.width && singleExport.height) {
      const size = estimateFileSize(
        singleExport.width,
        singleExport.height,
        singleExport.format,
        singleExport.quality
      )
      setSingleExport(prev => ({ ...prev, estimatedSize: size }))
    } else {
      const size = estimateFileSize(
        canvas.width * (singleExport.scale || 1),
        canvas.height * (singleExport.scale || 1),
        singleExport.format,
        singleExport.quality
      )
      setSingleExport(prev => ({ ...prev, estimatedSize: size }))
    }
  }

  const handleSingleExport = async () => {
    if (!stageRef.current) {
      setError('Canvas not available for export')
      return
    }

    setIsExporting(true)
    setError(null)

    try {
      const validation = validateExportOptions(singleExport)
      if (!validation.valid) {
        throw new Error(validation.errors.join(', '))
      }

      const blob = await exportStageEnhanced(stageRef.current, {
        ...singleExport,
        selectedOnly: selectedElementIds.length > 0 && singleExport.selectedOnly
      })

      downloadBlob(blob, singleExport.filename || 'design.png')
      
      setExportResults([{
        filename: singleExport.filename || 'design.png',
        success: true,
        size: blob.size
      }])
      setShowResults(true)

    } catch (err: any) {
      console.error('Export failed:', err)
      setError(err.message || 'Export failed')
    } finally {
      setIsExporting(false)
    }
  }

  const handleBatchExport = async () => {
    if (!stageRef.current) {
      setError('Canvas not available for export')
      return
    }

    const enabledExports = batchExports.filter(exp => exp.enabled)
    if (enabledExports.length === 0) {
      setError('No exports selected')
      return
    }

    setIsExporting(true)
    setShowProgress(true)
    setError(null)
    setExportProgress(0)

    // Initialize progress items
    const initialProgressItems: ProgressItem[] = enabledExports.map(exp => ({
      id: exp.id,
      label: exp.filename || generateFilename('design', exp.format),
      status: 'pending'
    }))
    setProgressItems(initialProgressItems)

    try {
      const exportOptions = enabledExports.map(exp => ({
        ...exp,
        filename: exp.filename || generateFilename('design', exp.format)
      }))

      // Process exports one by one with progress updates
      const results: Array<{ filename: string; blob: Blob; success: boolean; error?: string }> = []
      
      for (let i = 0; i < exportOptions.length; i++) {
        const exp = exportOptions[i]
        
        // Update progress item to processing
        setProgressItems(prev => prev.map(item => 
          item.id === exp.id 
            ? { ...item, status: 'processing', progress: 0 }
            : item
        ))

        try {
          // Simulate progress for individual export
          for (let progress = 0; progress <= 100; progress += 25) {
            setProgressItems(prev => prev.map(item => 
              item.id === exp.id 
                ? { ...item, progress }
                : item
            ))
            await new Promise(resolve => setTimeout(resolve, 100))
          }

          const blob = await exportStageEnhanced(stageRef.current, exp)
          
          results.push({
            filename: exp.filename,
            blob,
            success: true
          })

          // Update progress item to completed
          setProgressItems(prev => prev.map(item => 
            item.id === exp.id 
              ? { ...item, status: 'completed', progress: 100, size: blob.size }
              : item
          ))

        } catch (error: any) {
          results.push({
            filename: exp.filename,
            blob: new Blob(),
            success: false,
            error: error.message
          })

          // Update progress item to error
          setProgressItems(prev => prev.map(item => 
            item.id === exp.id 
              ? { ...item, status: 'error', error: error.message }
              : item
          ))
        }

        // Update overall progress
        setExportProgress(((i + 1) / exportOptions.length) * 100)
      }
      
      setExportResults(results.map(result => ({
        filename: result.filename,
        success: result.success,
        error: result.error,
        size: result.success ? result.blob.size : undefined
      })))

      // Download as ZIP if multiple files
      if (results.length > 1) {
        await downloadAsZip(results, 'design_exports.zip')
      } else if (results.length === 1 && results[0].success) {
        downloadBlob(results[0].blob, results[0].filename)
      }

      setShowResults(true)

    } catch (err: any) {
      console.error('Batch export failed:', err)
      setError(err.message || 'Batch export failed')
    } finally {
      setIsExporting(false)
    }
  }

  const handlePresetExport = async () => {
    if (!stageRef.current || selectedPresets.length === 0) {
      setError('No presets selected')
      return
    }

    setIsExporting(true)
    setShowProgress(true)
    setError(null)

    try {
      const allExports: Array<EnhancedExportOptions & { filename: string; id: string }> = []
      
      selectedPresets.forEach((presetKey, index) => {
        const [category, size] = presetKey.split('/')
        const categoryPresets = EXPORT_PRESETS[category as keyof typeof EXPORT_PRESETS]
        const preset = categoryPresets[size as keyof typeof categoryPresets]
        
        if (preset) {
          allExports.push({
            id: `preset_${index}`,
            format: 'png',
            ...preset,
            filename: generateFilename(`${category}_${size.replace(/[^a-zA-Z0-9]/g, '_')}`, 'png'),
            quality: 0.9,
            includeBackground: true
          })
        }
      })

      // Initialize progress items
      const initialProgressItems: ProgressItem[] = allExports.map(exp => ({
        id: exp.id,
        label: exp.filename,
        status: 'pending'
      }))
      setProgressItems(initialProgressItems)

      // Process exports one by one with progress updates
      const results: Array<{ filename: string; blob: Blob; success: boolean; error?: string }> = []
      
      for (let i = 0; i < allExports.length; i++) {
        const exp = allExports[i]
        
        // Update progress item to processing
        setProgressItems(prev => prev.map(item => 
          item.id === exp.id 
            ? { ...item, status: 'processing', progress: 0 }
            : item
        ))

        try {
          // Simulate progress for individual export
          for (let progress = 0; progress <= 100; progress += 25) {
            setProgressItems(prev => prev.map(item => 
              item.id === exp.id 
                ? { ...item, progress }
                : item
            ))
            await new Promise(resolve => setTimeout(resolve, 100))
          }

          const blob = await exportStageEnhanced(stageRef.current, exp)
          
          results.push({
            filename: exp.filename,
            blob,
            success: true
          })

          // Update progress item to completed
          setProgressItems(prev => prev.map(item => 
            item.id === exp.id 
              ? { ...item, status: 'completed', progress: 100, size: blob.size }
              : item
          ))

        } catch (error: any) {
          results.push({
            filename: exp.filename,
            blob: new Blob(),
            success: false,
            error: error.message
          })

          // Update progress item to error
          setProgressItems(prev => prev.map(item => 
            item.id === exp.id 
              ? { ...item, status: 'error', error: error.message }
              : item
          ))
        }

        // Update overall progress
        setExportProgress(((i + 1) / allExports.length) * 100)
      }
      
      setExportResults(results.map(result => ({
        filename: result.filename,
        success: result.success,
        error: result.error,
        size: result.success ? result.blob.size : undefined
      })))

      // Download as ZIP
      await downloadAsZip(results, 'preset_exports.zip')
      setShowResults(true)

    } catch (err: any) {
      console.error('Preset export failed:', err)
      setError(err.message || 'Preset export failed')
    } finally {
      setIsExporting(false)
    }
  }

  const addBatchExport = () => {
    const newExport: ExportConfig = {
      id: `batch_${Date.now()}`,
      enabled: true,
      format: 'png',
      quality: 0.9,
      scale: 1,
      includeBackground: true,
      filename: generateFilename(`design_${batchExports.length + 1}`, 'png')
    }
    setBatchExports(prev => [...prev, newExport])
  }

  const removeBatchExport = (id: string) => {
    setBatchExports(prev => prev.filter(exp => exp.id !== id))
  }

  const updateBatchExport = (id: string, updates: Partial<ExportConfig>) => {
    setBatchExports(prev => prev.map(exp => 
      exp.id === id ? { ...exp, ...updates } : exp
    ))
  }

  const togglePreset = (presetKey: string) => {
    setSelectedPresets(prev => 
      prev.includes(presetKey)
        ? prev.filter(key => key !== presetKey)
        : [...prev, presetKey]
    )
  }

  const handleClose = () => {
    if (!isExporting) {
      onClose()
    }
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title="Export Design" 
      size="xl"
      className="max-w-4xl"
    >
      <ModalContent>
        {showResults ? (
          <ExportResults 
            results={exportResults}
            onClose={() => setShowResults(false)}
          />
        ) : showProgress ? (
          <div className="space-y-6">
            <ProgressBar 
              items={progressItems}
              title="Export Progress"
              showDetails={true}
            />
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => {
                  setShowProgress(false)
                  setIsExporting(false)
                }}
                disabled={isExporting}
              >
                Hide Progress
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Tabs */}
            <div className="flex space-x-1 bg-muted p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('single')}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'single'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Image className="h-4 w-4 mr-2 inline" />
                Single Export
              </button>
              <button
                onClick={() => setActiveTab('batch')}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'batch'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Package className="h-4 w-4 mr-2 inline" />
                Batch Export
              </button>
              <button
                onClick={() => setActiveTab('presets')}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'presets'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Settings className="h-4 w-4 mr-2 inline" />
                Platform Presets
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'single' && (
              <SingleExportTab
                config={singleExport}
                onChange={setSingleExport}
                hasSelection={selectedElementIds.length > 0}
              />
            )}

            {activeTab === 'batch' && (
              <BatchExportTab
                exports={batchExports}
                onAdd={addBatchExport}
                onRemove={removeBatchExport}
                onUpdate={updateBatchExport}
              />
            )}

            {activeTab === 'presets' && (
              <PresetsTab
                selectedPresets={selectedPresets}
                onTogglePreset={togglePreset}
              />
            )}

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              </div>
            )}

            {/* Export Progress */}
            {isExporting && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 text-blue-500 mr-2 animate-spin" />
                  <span className="text-sm text-blue-700">Exporting...</span>
                </div>
                {exportProgress > 0 && (
                  <div className="mt-2 bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${exportProgress}%` }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </ModalContent>

      {!showResults && (
        <ModalFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isExporting}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (activeTab === 'single') handleSingleExport()
              else if (activeTab === 'batch') handleBatchExport()
              else if (activeTab === 'presets') handlePresetExport()
            }}
            disabled={isExporting || !stageRef.current}
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export
              </>
            )}
          </Button>
        </ModalFooter>
      )}
    </Modal>
  )
}

// Single Export Tab Component
function SingleExportTab({ 
  config, 
  onChange, 
  hasSelection 
}: { 
  config: ExportConfig
  onChange: (config: ExportConfig) => void
  hasSelection: boolean
}) {
  const formatInfo = EXPORT_FORMATS[config.format]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Format */}
        <div>
          <label className="block text-sm font-medium mb-2">Format</label>
          <select
            value={config.format}
            onChange={(e) => onChange({ 
              ...config, 
              format: e.target.value as any,
              filename: generateFilename('design', e.target.value)
            })}
            className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {Object.entries(EXPORT_FORMATS).map(([key, format]) => (
              <option key={key} value={key}>
                {format.name} - {format.description}
              </option>
            ))}
          </select>
        </div>

        {/* Quality */}
        {formatInfo.supportsQuality && (
          <div>
            <label className="block text-sm font-medium mb-2">
              Quality ({Math.round(config.quality! * 100)}%)
            </label>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={config.quality}
              onChange={(e) => onChange({ ...config, quality: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>
        )}

        {/* Scale */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Scale ({config.scale}x)
          </label>
          <input
            type="range"
            min="0.5"
            max="4"
            step="0.5"
            value={config.scale}
            onChange={(e) => onChange({ ...config, scale: parseFloat(e.target.value) })}
            className="w-full"
          />
        </div>

        {/* Filename */}
        <div>
          <label className="block text-sm font-medium mb-2">Filename</label>
          <input
            type="text"
            value={config.filename}
            onChange={(e) => onChange({ ...config, filename: e.target.value })}
            className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Advanced Options */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Advanced Options</h4>
        
        {/* Dimensions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Custom Width (px)</label>
            <input
              type="number"
              value={config.width || ''}
              onChange={(e) => onChange({ 
                ...config, 
                width: e.target.value ? parseInt(e.target.value) : undefined 
              })}
              placeholder="Auto"
              className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Custom Height (px)</label>
            <input
              type="number"
              value={config.height || ''}
              onChange={(e) => onChange({ 
                ...config, 
                height: e.target.value ? parseInt(e.target.value) : undefined 
              })}
              placeholder="Auto"
              className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* Background */}
        <div>
          <label className="block text-sm font-medium mb-2">Background Color</label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={config.background || '#ffffff'}
              onChange={(e) => onChange({ ...config, background: e.target.value })}
              className="w-12 h-8 border rounded cursor-pointer"
            />
            <input
              type="text"
              value={config.background || ''}
              onChange={(e) => onChange({ ...config, background: e.target.value })}
              placeholder="Transparent"
              className="flex-1 px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              onClick={() => onChange({ ...config, background: undefined })}
              className="px-3 py-2 text-sm border rounded-md hover:bg-gray-50"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Padding */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Padding ({config.padding || 0}px)
          </label>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={config.padding || 0}
            onChange={(e) => onChange({ ...config, padding: parseInt(e.target.value) })}
            className="w-full"
          />
        </div>

        {/* Export Options */}
        <div className="space-y-3">
          <h5 className="text-sm font-medium">Export Settings</h5>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="includeBackground"
                checked={config.includeBackground}
                onChange={(e) => onChange({ ...config, includeBackground: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="includeBackground" className="text-sm">
                Include canvas background
              </label>
            </div>

            {formatInfo.supportsTransparency && (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="removeBackground"
                  checked={!config.includeBackground}
                  onChange={(e) => onChange({ ...config, includeBackground: !e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="removeBackground" className="text-sm">
                  Remove background (transparent)
                </label>
              </div>
            )}

            {hasSelection && (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="selectedOnly"
                  checked={config.selectedOnly}
                  onChange={(e) => onChange({ ...config, selectedOnly: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="selectedOnly" className="text-sm">
                  Export selected elements only
                </label>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="highRes"
                checked={config.scale && config.scale >= 2}
                onChange={(e) => onChange({ 
                  ...config, 
                  scale: e.target.checked ? 2 : 1 
                })}
                className="rounded"
              />
              <label htmlFor="highRes" className="text-sm">
                High resolution (2x)
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Estimated Size */}
      {config.estimatedSize && (
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="text-sm text-muted-foreground">
            Estimated file size: <span className="font-medium">{formatFileSize(config.estimatedSize)}</span>
          </div>
        </div>
      )}
    </div>
  )
}

// Batch Export Tab Component
function BatchExportTab({ 
  exports, 
  onAdd, 
  onRemove, 
  onUpdate 
}: { 
  exports: ExportConfig[]
  onAdd: () => void
  onRemove: (id: string) => void
  onUpdate: (id: string, updates: Partial<ExportConfig>) => void
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Batch Exports</h3>
        <Button onClick={onAdd} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Export
        </Button>
      </div>

      {exports.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No exports configured. Click "Add Export" to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {exports.map((exp) => (
            <div key={exp.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={exp.enabled}
                    onChange={(e) => onUpdate(exp.id, { enabled: e.target.checked })}
                    className="rounded"
                  />
                  <span className="font-medium">{exp.filename}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove(exp.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <select
                  value={exp.format}
                  onChange={(e) => onUpdate(exp.id, { format: e.target.value as any })}
                  className="px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {Object.entries(EXPORT_FORMATS).map(([key, format]) => (
                    <option key={key} value={key}>{format.name}</option>
                  ))}
                </select>

                <input
                  type="range"
                  min="0.5"
                  max="4"
                  step="0.5"
                  value={exp.scale}
                  onChange={(e) => onUpdate(exp.id, { scale: parseFloat(e.target.value) })}
                  className="self-center"
                  title={`Scale: ${exp.scale}x`}
                />

                <input
                  type="text"
                  value={exp.filename}
                  onChange={(e) => onUpdate(exp.id, { filename: e.target.value })}
                  className="px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Presets Tab Component
function PresetsTab({ 
  selectedPresets, 
  onTogglePreset 
}: { 
  selectedPresets: string[]
  onTogglePreset: (presetKey: string) => void
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Platform Presets</h3>
        <p className="text-sm text-muted-foreground">
          Select platform-specific sizes to export your design for different app stores and devices.
        </p>
      </div>

      {PRESET_CATEGORIES.map(({ key, label, icon: Icon }) => (
        <div key={key} className="space-y-3">
          <div className="flex items-center space-x-2">
            <Icon className="h-5 w-5 text-muted-foreground" />
            <h4 className="font-medium">{label}</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {Object.entries(EXPORT_PRESETS[key]).map(([size, dimensions]) => {
              const presetKey = `${key}/${size}`
              const isSelected = selectedPresets.includes(presetKey)

              return (
                <div
                  key={presetKey}
                  onClick={() => onTogglePreset(presetKey)}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">{size}</div>
                      <div className="text-xs text-muted-foreground">
                        {dimensions.width} × {dimensions.height}
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle className="h-4 w-4 text-blue-500" />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {selectedPresets.length > 0 && (
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="text-sm text-muted-foreground">
            Selected: <span className="font-medium">{selectedPresets.length} presets</span>
          </div>
        </div>
      )}
    </div>
  )
}

// Export Results Component
function ExportResults({ 
  results, 
  onClose 
}: { 
  results: Array<{ filename: string; success: boolean; error?: string; size?: number }>
  onClose: () => void
}) {
  const successful = results.filter(r => r.success).length
  const failed = results.filter(r => !r.success).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Export Results</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <span className="font-medium">Successful: {successful}</span>
          </div>
        </div>
        {failed > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="font-medium">Failed: {failed}</span>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {results.map((result, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg border ${
              result.success
                ? 'border-green-200 bg-green-50'
                : 'border-red-200 bg-red-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {result.success ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
                <span className="font-medium text-sm">{result.filename}</span>
              </div>
              {result.success && result.size && (
                <span className="text-xs text-muted-foreground">
                  {formatFileSize(result.size)}
                </span>
              )}
            </div>
            {result.error && (
              <div className="text-xs text-red-600 mt-1">{result.error}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}