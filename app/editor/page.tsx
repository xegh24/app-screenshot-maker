'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { Button } from '@/components/ui/Button'
import { AuthProvider } from '@/components/auth/AuthProvider'
import { SaveModal } from '@/components/editor/SaveModal'
import { ExportModal } from '@/components/editor/ExportModal'
import Canvas from '@/components/editor/Canvas'
import Toolbar from '@/components/editor/Toolbar'
import PropertyPanel from '@/components/editor/PropertyPanel'
import { useUIStore } from '@/store/ui'
import { useEditorStore } from '@/store/editor'
import { useAutoSave } from '@/hooks/useAutoSave'
import { loadDesign } from '@/lib/storage/designs'
import { cn } from '@/lib/utils/cn'

function EditorContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { sidebarVisible, sidebarWidth } = useUIStore()
  const { 
    canvas, 
    elements,
    currentDesign,
    isDesignSaved,
    loadDesign: loadDesignIntoEditor
  } = useEditorStore()
  
  const [isClient, setIsClient] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [loadingDesign, setLoadingDesign] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')

  // Auto-save hook
  const { isAutoSaveEnabled, lastAutoSave } = useAutoSave({
    enabled: true,
    interval: 30000, // 30 seconds
    onAutoSave: () => {
      setAutoSaveStatus('success')
      setTimeout(() => setAutoSaveStatus('idle'), 2000)
    },
    onAutoSaveError: (error) => {
      console.error('Auto-save error:', error)
      setAutoSaveStatus('error')
      setTimeout(() => setAutoSaveStatus('idle'), 3000)
    }
  })

  // Load design from URL parameter
  useEffect(() => {
    const designId = searchParams.get('design')
    if (designId && !currentDesign) {
      loadDesignFromId(designId)
    }
  }, [searchParams, currentDesign])

  useEffect(() => {
    setIsClient(true)
  }, [])

  const loadDesignFromId = async (designId: string) => {
    setLoadingDesign(true)
    setLoadError(null)
    
    try {
      const result = await loadDesign(designId)
      
      if (result.error || !result.design) {
        throw new Error(result.error || 'Design not found')
      }
      
      loadDesignIntoEditor(result.design)
      
      // Update URL without the design parameter to avoid reloading on refresh
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete('design')
      router.replace(newUrl.pathname + newUrl.search)
      
    } catch (error: any) {
      console.error('Failed to load design:', error)
      setLoadError(error.message || 'Failed to load design')
    } finally {
      setLoadingDesign(false)
    }
  }

  const handleSave = () => {
    setShowSaveModal(true)
  }

  const handleSaveSuccess = (designId: string) => {
    console.log('Design saved successfully:', designId)
  }

  if (!isClient) {
    return null // Prevent hydration issues
  }

  // Show loading state when loading a design
  if (loadingDesign) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Loading Design</h3>
            <p className="text-muted-foreground">Please wait while we load your design...</p>
          </div>
        </div>
      </div>
    )
  }

  // Show error state if design failed to load
  if (loadError) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-medium mb-2">Failed to Load Design</h3>
            <p className="text-muted-foreground mb-4">{loadError}</p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={() => router.push('/dashboard')}>
                Back to Dashboard
              </Button>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Hidden on mobile when closed */}
        <Sidebar />
        
        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col bg-muted/30 min-w-0">
          {/* Toolbar */}
          <Toolbar
            onExport={(options) => {
              console.log('Export with options:', options)
              setShowExportModal(true)
            }}
            onOpenExportModal={() => setShowExportModal(true)}
          />

          {/* Main Content Area - Stack on mobile */}
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Canvas Area */}
            <div className="flex-1 min-h-0 order-2 lg:order-1">
              <Canvas className="w-full h-full" />
            </div>
            
            {/* Property Panel - Hidden on mobile by default, collapsible */}
            <PropertyPanel className="w-full lg:w-80 flex-shrink-0 order-1 lg:order-2 border-b lg:border-b-0 lg:border-l" />
          </div>

          {/* Bottom Status Bar - Simplified on mobile */}
          <div className="border-t bg-background px-4 py-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-2 lg:gap-4 overflow-hidden">
                <span className="hidden sm:inline">Canvas: {canvas.width} × {canvas.height}</span>
                <span className="sm:hidden">Canvas</span>
                <span>Elements: {elements.length}</span>
                {currentDesign && (
                  <span className="hidden md:inline truncate">Design: {currentDesign.title}</span>
                )}
              </div>
              
              <div className="flex items-center gap-2 lg:gap-4">
                <span>{Math.round(canvas.zoom * 100)}%</span>
                {isAutoSaveEnabled ? (
                  <span className="text-green-600 hidden sm:inline">Auto-save enabled</span>
                ) : (
                  <span className="hidden sm:inline">Ready</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <SaveModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSaved={handleSaveSuccess}
      />

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
      />
    </div>
  )
}

// Remove the old CanvasArea component as we're now using the actual Canvas component

export default function Editor() {
  return (
    <AuthProvider requireAuth>
      <EditorContent />
    </AuthProvider>
  )
}