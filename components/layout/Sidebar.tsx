'use client'

import { useEffect, useRef, useState } from 'react'
import { 
  Layers3, 
  Settings2, 
  ImageIcon, 
  Sparkles, 
  History,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react'
import { useUIStore, SidebarPanel } from '@/store/ui'
import { Button } from '@/components/ui/Button'
import { TemplatePanel } from '@/components/editor/TemplatePanel'
import AssetPanel from '@/components/editor/AssetPanel'
import { cn } from '@/lib/utils/cn'

export interface SidebarProps {
  className?: string
}

interface PanelItem {
  id: SidebarPanel
  label: string
  icon: React.ComponentType<{ className?: string }>
  description: string
}

const panels: PanelItem[] = [
  {
    id: 'layers',
    label: 'Layers',
    icon: Layers3,
    description: 'Manage layers and elements'
  },
  {
    id: 'properties',
    label: 'Properties',
    icon: Settings2,
    description: 'Element properties and styles'
  },
  {
    id: 'assets',
    label: 'Assets',
    icon: ImageIcon,
    description: 'Images and media assets'
  },
  {
    id: 'templates',
    label: 'Templates',
    icon: Sparkles,
    description: 'Design templates and presets'
  },
  {
    id: 'history',
    label: 'History',
    icon: History,
    description: 'Undo/redo history'
  }
]

export function Sidebar({ className }: SidebarProps) {
  const {
    sidebarVisible,
    sidebarPanel,
    sidebarWidth,
    setSidebarVisible,
    setSidebarPanel,
    setSidebarWidth
  } = useUIStore()

  const sidebarRef = useRef<HTMLDivElement>(null)
  const resizeHandleRef = useRef<HTMLDivElement>(null)
  const isResizing = useRef(false)
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile screen size
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768) // md breakpoint
    }
    
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  // Close sidebar on mobile when clicking outside
  useEffect(() => {
    if (!isMobile || !sidebarVisible) return

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (sidebarRef.current && !sidebarRef.current.contains(target)) {
        setSidebarVisible(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    // Prevent body scroll on mobile when sidebar is open
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('click', handleClickOutside)
      document.body.style.overflow = 'unset'
    }
  }, [isMobile, sidebarVisible, setSidebarVisible])

  // Handle resize
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current || !sidebarRef.current) return
      
      const newWidth = e.clientX
      const minWidth = 250
      const maxWidth = 600
      
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setSidebarWidth(newWidth)
      }
    }

    const handleMouseUp = () => {
      isResizing.current = false
      document.body.style.cursor = 'default'
      document.body.style.userSelect = 'auto'
    }

    if (isResizing.current) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [setSidebarWidth])

  const handleResizeStart = () => {
    isResizing.current = true
    document.body.style.cursor = 'ew-resize'
    document.body.style.userSelect = 'none'
  }

  const handlePanelSelect = (panelId: SidebarPanel) => {
    if (sidebarPanel === panelId && sidebarVisible) {
      // If the same panel is clicked and sidebar is visible, close it
      setSidebarVisible(false)
    } else {
      // Open the panel
      setSidebarPanel(panelId)
      if (!sidebarVisible) {
        setSidebarVisible(true)
      }
    }
  }

  // On mobile, don't show collapsed sidebar
  if (!sidebarVisible) {
    if (isMobile) {
      return null
    }
    
    return (
      <div className={cn('flex flex-col border-r bg-background', className)}>
        {/* Collapsed Tab Bar */}
        <div className="flex flex-col">
          {panels.map((panel) => (
            <Button
              key={panel.id}
              variant="ghost"
              size="icon"
              className={cn(
                'h-12 w-12 rounded-none border-b touch-manipulation',
                sidebarPanel === panel.id && 'bg-accent text-accent-foreground'
              )}
              onClick={() => handlePanelSelect(panel.id)}
              title={panel.description}
            >
              <panel.icon className="h-5 w-5" />
            </Button>
          ))}
        </div>

        {/* Expand Button */}
        <div className="mt-auto p-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarVisible(true)}
            title="Expand sidebar"
            className="h-8 w-8 touch-manipulation"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  // Mobile sidebar as overlay
  if (isMobile) {
    return (
      <div className="md:hidden fixed inset-0 z-50">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => setSidebarVisible(false)}
        />
        
        {/* Sidebar Drawer */}
        <div 
          ref={sidebarRef}
          className={cn(
            'absolute left-0 top-0 h-full w-80 max-w-[85vw] bg-background border-r shadow-xl',
            'flex flex-col overflow-hidden',
            className
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-2">
              {sidebarPanel && (
                <>
                  {(() => {
                    const panel = panels.find(p => p.id === sidebarPanel)
                    if (!panel) return null
                    return (
                      <>
                        <panel.icon className="h-5 w-5" />
                        <h3 className="font-medium text-lg">{panel.label}</h3>
                      </>
                    )
                  })()}
                </>
              )}
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarVisible(false)}
              className="h-8 w-8 touch-manipulation"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Tab Bar - Horizontal on mobile */}
          <div className="flex border-b bg-muted/30 p-2 gap-1 overflow-x-auto">
            {panels.map((panel) => (
              <Button
                key={panel.id}
                variant="ghost"
                size="sm"
                className={cn(
                  'flex items-center space-x-2 whitespace-nowrap touch-manipulation min-h-[40px]',
                  sidebarPanel === panel.id && 'bg-background text-accent-foreground shadow-sm'
                )}
                onClick={() => handlePanelSelect(panel.id)}
              >
                <panel.icon className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm">{panel.label}</span>
              </Button>
            ))}
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-hidden">
            <SidebarContent panel={sidebarPanel} />
          </div>
        </div>
      </div>
    )
  }

  // Desktop sidebar
  return (
    <div 
      ref={sidebarRef}
      className={cn('flex border-r bg-background', className)}
      style={{ width: sidebarWidth }}
    >
      {/* Tab Bar */}
      <div className="flex flex-col w-12 border-r">
        {panels.map((panel) => (
          <Button
            key={panel.id}
            variant="ghost"
            size="icon"
            className={cn(
              'h-12 w-12 rounded-none border-b touch-manipulation',
              sidebarPanel === panel.id && 'bg-accent text-accent-foreground'
            )}
            onClick={() => handlePanelSelect(panel.id)}
            title={panel.description}
          >
            <panel.icon className="h-5 w-5" />
          </Button>
        ))}

        {/* Collapse Button */}
        <div className="mt-auto p-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarVisible(false)}
            title="Collapse sidebar"
            className="h-8 w-8 touch-manipulation"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Panel Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Panel Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            {sidebarPanel && (
              <>
                {(() => {
                  const panel = panels.find(p => p.id === sidebarPanel)
                  if (!panel) return null
                  return (
                    <>
                      <panel.icon className="h-4 w-4" />
                      <h3 className="font-medium">{panel.label}</h3>
                    </>
                  )
                })()}
              </>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarVisible(false)}
            className="h-6 w-6"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>

        {/* Panel Content Area */}
        <div className="flex-1 overflow-hidden">
          <SidebarContent panel={sidebarPanel} />
        </div>
      </div>

      {/* Resize Handle - Desktop only */}
      <div
        ref={resizeHandleRef}
        className="w-1 hover:w-2 bg-transparent hover:bg-primary/20 cursor-ew-resize transition-all"
        onMouseDown={handleResizeStart}
      />
    </div>
  )
}

// Sidebar Content Component
function SidebarContent({ panel }: { panel: SidebarPanel }) {
  const content = {
    layers: <LayersPanel />,
    properties: <PropertiesPanel />,
    assets: <AssetsPanel />,
    templates: <TemplatesPanel />,
    history: <HistoryPanel />
  }

  if (!panel) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>Select a panel</p>
      </div>
    )
  }

  return content[panel] || null
}

// Panel Components (placeholders for now)
function LayersPanel() {
  return (
    <div className="p-4">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Layers panel content</p>
        <div className="space-y-1">
          <div className="p-2 text-sm border rounded">Background</div>
          <div className="p-2 text-sm border rounded">Device Frame</div>
          <div className="p-2 text-sm border rounded">Screenshot</div>
          <div className="p-2 text-sm border rounded">Text Layer</div>
        </div>
      </div>
    </div>
  )
}

function PropertiesPanel() {
  return (
    <div className="p-4">
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">Properties panel content</p>
        <div className="space-y-2">
          <label className="text-sm font-medium">Position</label>
          <div className="grid grid-cols-2 gap-2">
            <input 
              type="number" 
              placeholder="X" 
              className="px-2 py-1 text-sm border rounded"
            />
            <input 
              type="number" 
              placeholder="Y" 
              className="px-2 py-1 text-sm border rounded"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Size</label>
          <div className="grid grid-cols-2 gap-2">
            <input 
              type="number" 
              placeholder="Width" 
              className="px-2 py-1 text-sm border rounded"
            />
            <input 
              type="number" 
              placeholder="Height" 
              className="px-2 py-1 text-sm border rounded"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function AssetsPanel() {
  return (
    <AssetPanel className="h-full" />
  )
}

function TemplatesPanel() {
  const { setSidebarVisible } = useUIStore()
  
  return (
    <TemplatePanel 
      className="h-full"
      onClose={() => setSidebarVisible(false)}
    />
  )
}

function HistoryPanel() {
  return (
    <div className="p-4">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">History panel content</p>
        <div className="space-y-1">
          <div className="p-2 text-sm border rounded">Added text layer</div>
          <div className="p-2 text-sm border rounded">Changed background</div>
          <div className="p-2 text-sm border rounded">Moved element</div>
          <div className="p-2 text-sm border rounded">Initial state</div>
        </div>
      </div>
    </div>
  )
}