'use client'

import React, { useState } from 'react'
import { 
  MousePointer, 
  Type, 
  Image, 
  Square, 
  Circle, 
  Triangle, 
  Smartphone, 
  Palette, 
  Download, 
  Upload, 
  Copy, 
  Scissors, 
  Clipboard,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Grid3X3,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Trash2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  MoreHorizontal
} from 'lucide-react'
import { useEditorStore } from '../../store/editor'
import { exportStageAsImage, downloadBlob, generateExportFilename } from '../../lib/canvas/export'
import type { ExportOptions } from '../../lib/canvas/export'
import { ExportModal } from './ExportModal'

interface ToolbarProps {
  onExport?: (options: ExportOptions) => void
  onOpenExportModal?: () => void
  stage?: any
  className?: string
}

export default function Toolbar({ onExport, onOpenExportModal, stage, className = '' }: ToolbarProps) {
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [showAlignMenu, setShowAlignMenu] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile screen size
  React.useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768) // md breakpoint
    }
    
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])
  
  const {
    canvas,
    elements,
    selectedElementIds,
    activeTool,
    canUndo,
    canRedo,
    setActiveTool,
    setZoom,
    setOffset,
    toggleGrid,
    toggleSnapToGrid,
    undo,
    redo,
    deleteElements,
    copyElements,
    cutElements,
    pasteElements,
    bringToFront,
    sendToBack,
    updateElement
  } = useEditorStore()

  const selectedElements = elements.filter(el => selectedElementIds.includes(el.id))
  const hasSelection = selectedElements.length > 0
  const singleSelection = selectedElements.length === 1

  // Tool groups
  const selectionTools = [
    { id: 'select', icon: MousePointer, label: 'Select', shortcut: 'V' }
  ]

  const drawingTools = [
    { id: 'text', icon: Type, label: 'Text', shortcut: 'T' },
    { id: 'image', icon: Image, label: 'Image', shortcut: 'I' },
    { id: 'shape', icon: Square, label: 'Shape', shortcut: 'R' },
    { id: 'frame', icon: Smartphone, label: 'Device Frame', shortcut: 'F' },
    { id: 'background', icon: Palette, label: 'Background', shortcut: 'B' }
  ]

  const viewTools = [
    { action: 'zoom-in', icon: ZoomIn, label: 'Zoom In', shortcut: 'Ctrl+=' },
    { action: 'zoom-out', icon: ZoomOut, label: 'Zoom Out', shortcut: 'Ctrl+-' },
    { action: 'zoom-fit', icon: RotateCcw, label: 'Fit to Screen', shortcut: 'Ctrl+0' },
    { action: 'grid', icon: Grid3X3, label: 'Toggle Grid', shortcut: 'G', active: canvas.gridEnabled }
  ]

  const editTools = [
    { action: 'undo', icon: Undo, label: 'Undo', shortcut: 'Ctrl+Z', disabled: !canUndo() },
    { action: 'redo', icon: Redo, label: 'Redo', shortcut: 'Ctrl+Y', disabled: !canRedo() },
    { action: 'copy', icon: Copy, label: 'Copy', shortcut: 'Ctrl+C', disabled: !hasSelection },
    { action: 'cut', icon: Scissors, label: 'Cut', shortcut: 'Ctrl+X', disabled: !hasSelection },
    { action: 'paste', icon: Clipboard, label: 'Paste', shortcut: 'Ctrl+V' },
    { action: 'delete', icon: Trash2, label: 'Delete', shortcut: 'Del', disabled: !hasSelection }
  ]

  const handleToolClick = (toolId: string) => {
    if (toolId === activeTool) {
      setActiveTool('select')
    } else {
      setActiveTool(toolId as any)
    }
  }

  const handleActionClick = (action: string) => {
    switch (action) {
      case 'undo':
        undo()
        break
      case 'redo':
        redo()
        break
      case 'copy':
        copyElements()
        break
      case 'cut':
        cutElements()
        break
      case 'paste':
        pasteElements()
        break
      case 'delete':
        deleteElements(selectedElementIds)
        break
      case 'zoom-in':
        setZoom(Math.min(5, canvas.zoom * 1.2))
        break
      case 'zoom-out':
        setZoom(Math.max(0.1, canvas.zoom / 1.2))
        break
      case 'zoom-fit':
        setZoom(1)
        setOffset(0, 0)
        break
      case 'grid':
        toggleGrid()
        break
      case 'bring-front':
        if (singleSelection) {
          bringToFront(selectedElementIds[0])
        }
        break
      case 'send-back':
        if (singleSelection) {
          sendToBack(selectedElementIds[0])
        }
        break
      case 'lock':
        selectedElements.forEach(el => {
          updateElement(el.id, { locked: !el.locked })
        })
        break
      case 'visibility':
        selectedElements.forEach(el => {
          updateElement(el.id, { visible: !el.visible })
        })
        break
    }
  }

  const handleExport = async (format: 'png' | 'jpg' | 'svg' = 'png') => {
    if (onExport) {
      onExport({ format })
    }
    setShowExportMenu(false)
  }

  const handleOpenExportModal = () => {
    setShowExportModal(true)
    setShowExportMenu(false)
    if (onOpenExportModal) {
      onOpenExportModal()
    }
  }

  const handleAlign = (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    // This would need to be implemented in the store
    console.log('Align:', alignment, selectedElements)
    setShowAlignMenu(false)
  }

  const ToolButton = ({ 
    tool, 
    onClick, 
    isActive = false, 
    disabled = false,
    showLabel = false
  }: { 
    tool: any; 
    onClick: () => void; 
    isActive?: boolean; 
    disabled?: boolean;
    showLabel?: boolean;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative ${isMobile ? 'p-3 min-h-[48px]' : 'p-2'} rounded-lg transition-all duration-200 group touch-manipulation
        ${showLabel ? 'flex items-center space-x-2 px-3' : ''}
        ${isActive 
          ? 'bg-blue-500 text-white shadow-md' 
          : disabled
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }
        ${tool.active ? 'bg-blue-100 text-blue-600' : ''}
      `}
      title={`${tool.label} (${tool.shortcut || ''})`}
    >
      <tool.icon size={isMobile ? 20 : 18} />
      {showLabel && <span className="text-sm font-medium">{tool.label}</span>}
      
      {/* Tooltip - Hidden on mobile */}
      {!isMobile && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-50">
          {tool.label}
          {tool.shortcut && (
            <span className="ml-2 text-gray-300">({tool.shortcut})</span>
          )}
        </div>
      )}
    </button>
  )

  // Mobile Toolbar
  if (isMobile) {
    return (
      <div className={`bg-white border-b border-gray-200 ${className}`}>
        {/* Main toolbar row */}
        <div className="flex items-center justify-between px-2 py-1">
          {/* Essential tools */}
          <div className="flex items-center gap-1">
            {/* Active tool */}
            <ToolButton
              tool={[...selectionTools, ...drawingTools].find(t => t.id === activeTool) || selectionTools[0]}
              onClick={() => {}}
              isActive={true}
            />
            
            {/* Most used tools */}
            <ToolButton
              tool={drawingTools[0]} // Text
              onClick={() => handleToolClick('text')}
              isActive={activeTool === 'text'}
            />
            <ToolButton
              tool={drawingTools[2]} // Shape
              onClick={() => handleToolClick('shape')}
              isActive={activeTool === 'shape'}
            />
          </div>

          {/* Undo/Redo */}
          <div className="flex items-center gap-1">
            <ToolButton
              tool={editTools[0]} // Undo
              onClick={() => handleActionClick('undo')}
              disabled={editTools[0].disabled}
            />
            <ToolButton
              tool={editTools[1]} // Redo
              onClick={() => handleActionClick('redo')}
              disabled={editTools[1].disabled}
            />
          </div>

          {/* More tools menu */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-3 rounded-lg text-gray-600 hover:bg-gray-100 touch-manipulation min-h-[48px]"
            >
              <MoreHorizontal size={20} />
            </button>
          </div>
        </div>

        {/* Mobile menu overlay */}
        {showMobileMenu && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50">
            <div className="p-4">
              {/* All Tools */}
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Tools</h3>
                <div className="grid grid-cols-4 gap-2">
                  {[...selectionTools, ...drawingTools].map(tool => (
                    <ToolButton
                      key={tool.id}
                      tool={tool}
                      onClick={() => {
                        handleToolClick(tool.id)
                        setShowMobileMenu(false)
                      }}
                      isActive={activeTool === tool.id}
                      showLabel={true}
                    />
                  ))}
                </div>
              </div>

              {/* Edit Actions */}
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Edit</h3>
                <div className="grid grid-cols-3 gap-2">
                  {editTools.slice(2).map(tool => ( // Skip undo/redo as they're in main toolbar
                    <ToolButton
                      key={tool.action}
                      tool={tool}
                      onClick={() => {
                        handleActionClick(tool.action)
                        setShowMobileMenu(false)
                      }}
                      disabled={tool.disabled}
                      showLabel={true}
                    />
                  ))}
                </div>
              </div>

              {/* View Actions */}
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">View</h3>
                <div className="grid grid-cols-2 gap-2">
                  {viewTools.map(tool => (
                    <ToolButton
                      key={tool.action}
                      tool={tool}
                      onClick={() => {
                        handleActionClick(tool.action)
                        setShowMobileMenu(false)
                      }}
                      disabled={tool.disabled}
                      showLabel={true}
                    />
                  ))}
                </div>
              </div>

              {/* Export */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Export</h3>
                <ToolButton
                  tool={{ icon: Download, label: 'Export' }}
                  onClick={() => {
                    setShowExportMenu(true)
                    setShowMobileMenu(false)
                  }}
                  showLabel={true}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Desktop Toolbar
  return (
    <div className={`bg-white border-b border-gray-200 px-4 py-2 ${className}`}>
      <div className="flex items-center gap-1">
        {/* Selection Tools */}
        <div className="flex items-center gap-1 pr-3 border-r border-gray-200">
          {selectionTools.map(tool => (
            <ToolButton
              key={tool.id}
              tool={tool}
              onClick={() => handleToolClick(tool.id)}
              isActive={activeTool === tool.id}
            />
          ))}
        </div>

        {/* Drawing Tools */}
        <div className="flex items-center gap-1 px-3 border-r border-gray-200">
          {drawingTools.map(tool => (
            <ToolButton
              key={tool.id}
              tool={tool}
              onClick={() => handleToolClick(tool.id)}
              isActive={activeTool === tool.id}
            />
          ))}
        </div>

        {/* Edit Tools */}
        <div className="flex items-center gap-1 px-3 border-r border-gray-200">
          {editTools.map(tool => (
            <ToolButton
              key={tool.action}
              tool={tool}
              onClick={() => handleActionClick(tool.action)}
              disabled={tool.disabled}
            />
          ))}
        </div>

        {/* View Tools */}
        <div className="flex items-center gap-1 px-3 border-r border-gray-200">
          {viewTools.map(tool => (
            <ToolButton
              key={tool.action}
              tool={tool}
              onClick={() => handleActionClick(tool.action)}
              disabled={tool.disabled}
            />
          ))}
        </div>

        {/* Selection-specific Tools */}
        {hasSelection && (
          <div className="flex items-center gap-1 px-3 border-r border-gray-200">
            <ToolButton
              tool={{ 
                icon: selectedElements.some(el => el.locked) ? Unlock : Lock, 
                label: selectedElements.some(el => el.locked) ? 'Unlock' : 'Lock',
                action: 'lock'
              }}
              onClick={() => handleActionClick('lock')}
            />
            <ToolButton
              tool={{ 
                icon: selectedElements.some(el => !el.visible) ? Eye : EyeOff, 
                label: selectedElements.some(el => !el.visible) ? 'Show' : 'Hide',
                action: 'visibility'
              }}
              onClick={() => handleActionClick('visibility')}
            />
            
            {/* Alignment Tools */}
            {selectedElements.length > 1 && (
              <div className="relative">
                <ToolButton
                  tool={{ 
                    icon: AlignLeft, 
                    label: 'Align',
                    action: 'align'
                  }}
                  onClick={() => setShowAlignMenu(!showAlignMenu)}
                />
                
                {showAlignMenu && (
                  <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-50">
                    <div className="grid grid-cols-3 gap-1">
                      <button
                        onClick={() => handleAlign('left')}
                        className="p-2 rounded hover:bg-gray-100"
                        title="Align Left"
                      >
                        <AlignLeft size={16} />
                      </button>
                      <button
                        onClick={() => handleAlign('center')}
                        className="p-2 rounded hover:bg-gray-100"
                        title="Align Center"
                      >
                        <AlignCenter size={16} />
                      </button>
                      <button
                        onClick={() => handleAlign('right')}
                        className="p-2 rounded hover:bg-gray-100"
                        title="Align Right"
                      >
                        <AlignRight size={16} />
                      </button>
                      <button
                        onClick={() => handleAlign('top')}
                        className="p-2 rounded hover:bg-gray-100"
                        title="Align Top"
                      >
                        <AlignVerticalJustifyStart size={16} />
                      </button>
                      <button
                        onClick={() => handleAlign('middle')}
                        className="p-2 rounded hover:bg-gray-100"
                        title="Align Middle"
                      >
                        <AlignVerticalJustifyCenter size={16} />
                      </button>
                      <button
                        onClick={() => handleAlign('bottom')}
                        className="p-2 rounded hover:bg-gray-100"
                        title="Align Bottom"
                      >
                        <AlignVerticalJustifyEnd size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Export */}
        <div className="flex items-center gap-1 px-3 ml-auto">
          <div className="relative">
            <ToolButton
              tool={{ 
                icon: Download, 
                label: 'Export',
                action: 'export'
              }}
              onClick={() => setShowExportMenu(!showExportMenu)}
            />
            
            {showExportMenu && (
              <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-50 min-w-48">
                <button
                  onClick={handleOpenExportModal}
                  className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm font-medium border-b border-gray-100 mb-2"
                >
                  Advanced Export...
                </button>
                <button
                  onClick={() => handleExport('png')}
                  className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm"
                >
                  Quick Export as PNG
                </button>
                <button
                  onClick={() => handleExport('jpg')}
                  className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm"
                >
                  Quick Export as JPG
                </button>
                <button
                  onClick={() => handleExport('svg')}
                  className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm"
                >
                  Quick Export as SVG
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Canvas Info - Hidden on smaller screens */}
        <div className="hidden lg:block px-3 border-l border-gray-200 text-sm text-gray-500">
          {Math.round(canvas.zoom * 100)}% | {elements.length} elements
          {hasSelection && ` | ${selectedElements.length} selected`}
        </div>
      </div>

      {/* Export Modal */}
      <ExportModal 
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        stage={stage}
      />
    </div>
  )
}

// Keyboard shortcuts component
export function KeyboardShortcuts() {
  const shortcuts = [
    { key: 'V', action: 'Select Tool' },
    { key: 'T', action: 'Text Tool' },
    { key: 'R', action: 'Rectangle Tool' },
    { key: 'I', action: 'Image Tool' },
    { key: 'F', action: 'Frame Tool' },
    { key: 'G', action: 'Toggle Grid' },
    { key: 'Ctrl+Z', action: 'Undo' },
    { key: 'Ctrl+Y', action: 'Redo' },
    { key: 'Ctrl+C', action: 'Copy' },
    { key: 'Ctrl+V', action: 'Paste' },
    { key: 'Ctrl+X', action: 'Cut' },
    { key: 'Ctrl+A', action: 'Select All' },
    { key: 'Delete', action: 'Delete Selected' },
    { key: 'Esc', action: 'Deselect All' },
    { key: 'Ctrl+=', action: 'Zoom In' },
    { key: 'Ctrl+-', action: 'Zoom Out' },
    { key: 'Ctrl+0', action: 'Fit to Screen' }
  ]

  return (
    <div className="max-w-md">
      <h3 className="font-semibold text-gray-900 mb-3">Keyboard Shortcuts</h3>
      <div className="space-y-2">
        {shortcuts.map((shortcut, index) => (
          <div key={index} className="flex justify-between items-center text-sm">
            <span className="text-gray-600">{shortcut.action}</span>
            <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono text-gray-800">
              {shortcut.key}
            </kbd>
          </div>
        ))}
      </div>
    </div>
  )
}

// Toolbar context menu for additional options
export function ToolbarContextMenu({ 
  isOpen, 
  onClose, 
  position 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  position: { x: number; y: number } 
}) {
  if (!isOpen) return null

  return (
    <div 
      className="fixed bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-50"
      style={{ 
        left: position.x, 
        top: position.y,
        minWidth: '200px'
      }}
    >
      <div className="py-1">
        <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded">
          Customize Toolbar
        </button>
        <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded">
          Reset to Default
        </button>
        <hr className="my-1" />
        <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded">
          Keyboard Shortcuts
        </button>
      </div>
    </div>
  )
}