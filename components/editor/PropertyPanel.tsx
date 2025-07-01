'use client'

import React, { useState, useEffect } from 'react'
import { HexColorPicker } from 'react-colorful'
import { 
  Palette, 
  Type, 
  Image, 
  Square, 
  Smartphone, 
  Settings, 
  ChevronDown,
  ChevronRight,
  Sliders,
  RotateCw,
  Move,
  Maximize2,
  Eye,
  Lock,
  Layers
} from 'lucide-react'
import { useEditorStore } from '../../store/editor'
import type { 
  AnyCanvasElement, 
  TextElement, 
  ImageElement, 
  ShapeElement, 
  FrameElement, 
  BackgroundElement 
} from '../../store/editor'
// import { DeviceFrameSelector } from './DeviceFrame' // TODO: Implement DeviceFrameSelector
import TextEditor from './TextEditor'
import BackgroundPanel from './BackgroundPanel'

interface PropertyPanelProps {
  className?: string
}

export default function PropertyPanel({ className = '' }: PropertyPanelProps) {
  const { elements, selectedElementIds, updateElement, canvas, setCanvasSize, setBackgroundColor } = useEditorStore()
  const selectedElements = elements.filter(el => selectedElementIds.includes(el.id))
  const hasSelection = selectedElements.length > 0
  const singleSelection = selectedElements.length === 1
  const selectedElement = singleSelection ? selectedElements[0] : null
  const hasTextSelected = selectedElements.some(el => el.type === 'text')
  const [isMobile, setIsMobile] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Detect mobile screen size
  useEffect(() => {
    const checkIsMobile = () => {
      const mobile = window.innerWidth < 1024 // lg breakpoint
      setIsMobile(mobile)
      // Auto-collapse on mobile
      if (mobile) {
        setIsCollapsed(true)
      }
    }
    
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    canvas: true,
    position: true,
    appearance: true,
    content: true
  })

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const handlePropertyChange = (elementId: string, property: string, value: any) => {
    const element = elements.find(el => el.id === elementId)
    if (!element) return

    if (property.startsWith('data.')) {
      const dataKey = property.replace('data.', '')
      updateElement(elementId, {
        data: { ...element.data, [dataKey]: value }
      })
    } else {
      updateElement(elementId, { [property]: value })
    }
  }

  const handleBatchPropertyChange = (property: string, value: any) => {
    selectedElements.forEach(element => {
      handlePropertyChange(element.id, property, value)
    })
  }

  const SectionHeader = ({ title, icon: Icon, sectionKey }: { title: string; icon: any; sectionKey: string }) => (
    <button
      onClick={() => toggleSection(sectionKey)}
      className="w-full flex items-center justify-between p-3 lg:p-3 bg-gray-50 hover:bg-gray-100 transition-colors duration-200 border-b border-gray-200 touch-manipulation min-h-[48px]"
    >
      <div className="flex items-center gap-2">
        <Icon size={isMobile ? 18 : 16} className="text-gray-600 flex-shrink-0" />
        <span className="font-medium text-gray-900 text-sm lg:text-base">{title}</span>
      </div>
      {openSections[sectionKey] ? <ChevronDown size={isMobile ? 18 : 16} /> : <ChevronRight size={isMobile ? 18 : 16} />}
    </button>
  )

  const PropertyGroup = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  )

  const NumberInput = ({ 
    label, 
    value, 
    onChange, 
    min = -Infinity, 
    max = Infinity, 
    step = 1,
    suffix = ''
  }: {
    label: string
    value: number
    onChange: (value: number) => void
    min?: number
    max?: number
    step?: number
    suffix?: string
  }) => (
    <PropertyGroup label={label}>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Math.max(min, Math.min(max, parseFloat(e.target.value) || 0)))}
          min={min}
          max={max}
          step={step}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 touch-manipulation min-h-[44px] lg:min-h-auto"
        />
        {suffix && <span className="text-sm text-gray-500">{suffix}</span>}
      </div>
    </PropertyGroup>
  )

  const ColorInput = ({ 
    label, 
    value, 
    onChange 
  }: {
    label: string
    value: string
    onChange: (value: string) => void
  }) => {
    const [showPicker, setShowPicker] = useState(false)

    return (
      <PropertyGroup label={label}>
        <div className="relative">
          <button
            onClick={() => setShowPicker(!showPicker)}
            className="w-full flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <div 
              className="w-4 h-4 rounded border border-gray-300"
              style={{ backgroundColor: value }}
            />
            <span className="flex-1 text-left">{value}</span>
          </button>
          
          {showPicker && (
            <div className="absolute top-full left-0 mt-2 z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-3">
              <HexColorPicker color={value} onChange={onChange} />
              <button
                onClick={() => setShowPicker(false)}
                className="w-full mt-3 px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </PropertyGroup>
    )
  }

  const SelectInput = ({ 
    label, 
    value, 
    onChange, 
    options 
  }: {
    label: string
    value: string
    onChange: (value: string) => void
    options: Array<{ value: string; label: string }>
  }) => (
    <PropertyGroup label={label}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </PropertyGroup>
  )

  const SliderInput = ({ 
    label, 
    value, 
    onChange, 
    min = 0, 
    max = 100, 
    step = 1,
    suffix = ''
  }: {
    label: string
    value: number
    onChange: (value: number) => void
    min?: number
    max?: number
    step?: number
    suffix?: string
  }) => (
    <PropertyGroup label={label}>
      <div className="flex items-center gap-2">
        <input
          type="range"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          min={min}
          max={max}
          step={step}
          className="flex-1"
        />
        <span className="text-sm text-gray-500 min-w-12 text-right">
          {value}{suffix}
        </span>
      </div>
    </PropertyGroup>
  )

  // Mobile collapsible property panel
  if (isMobile && isCollapsed) {
    return (
      <div className={`bg-white border-b lg:border-l lg:border-b-0 border-gray-200 ${className}`}>
        <button
          onClick={() => setIsCollapsed(false)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors touch-manipulation"
        >
          <div className="flex items-center gap-2">
            <Settings size={18} className="text-gray-600" />
            <span className="font-medium text-gray-900">Properties</span>
            {hasSelection && (
              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                {selectedElements.length} selected
              </span>
            )}
          </div>
          <ChevronDown size={18} />
        </button>
      </div>
    )
  }

  return (
    <div className={`bg-white border-b lg:border-l lg:border-b-0 border-gray-200 overflow-y-auto ${className}`}>
      {/* Mobile Header with collapse button */}
      {isMobile && (
        <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
          <button
            onClick={() => setIsCollapsed(true)}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors touch-manipulation"
          >
            <div className="flex items-center gap-2">
              <Settings size={18} className="text-gray-600" />
              <span className="font-medium text-gray-900">Properties</span>
              {hasSelection && (
                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                  {selectedElements.length} selected
                </span>
              )}
            </div>
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Text Editor - Show when text is selected or no selection */}
      {(hasTextSelected || !hasSelection) && (
        <TextEditor />
      )}

      {/* Background Panel */}
      <BackgroundPanel />

      {/* Canvas Properties */}
      <div className="border-b border-gray-200">
        <SectionHeader title="Canvas" icon={Square} sectionKey="canvas" />
        {openSections.canvas && (
          <div className="p-3 lg:p-3 space-y-4">
            <NumberInput
              label="Width"
              value={canvas.width}
              onChange={(value) => setCanvasSize(value, canvas.height)}
              min={100}
              max={5000}
              suffix="px"
            />
            <NumberInput
              label="Height"
              value={canvas.height}
              onChange={(value) => setCanvasSize(canvas.width, value)}
              min={100}
              max={5000}
              suffix="px"
            />
          </div>
        )}
      </div>

      {/* Element Properties */}
      {hasSelection && (
        <>
          {/* Position & Transform */}
          <div className="border-b border-gray-200">
            <SectionHeader title="Position & Transform" icon={Move} sectionKey="position" />
            {openSections.position && (
              <div className="p-3 lg:p-3 space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <NumberInput
                    label="X"
                    value={singleSelection ? selectedElement!.x : 0}
                    onChange={(value) => handleBatchPropertyChange('x', value)}
                    suffix="px"
                  />
                  <NumberInput
                    label="Y"
                    value={singleSelection ? selectedElement!.y : 0}
                    onChange={(value) => handleBatchPropertyChange('y', value)}
                    suffix="px"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <NumberInput
                    label="Width"
                    value={singleSelection ? selectedElement!.width : 0}
                    onChange={(value) => handleBatchPropertyChange('width', value)}
                    min={1}
                    suffix="px"
                  />
                  <NumberInput
                    label="Height"
                    value={singleSelection ? selectedElement!.height : 0}
                    onChange={(value) => handleBatchPropertyChange('height', value)}
                    min={1}
                    suffix="px"
                  />
                </div>
                <SliderInput
                  label="Rotation"
                  value={singleSelection ? selectedElement!.rotation : 0}
                  onChange={(value) => handleBatchPropertyChange('rotation', value)}
                  min={-180}
                  max={180}
                  suffix="°"
                />
                <SliderInput
                  label="Opacity"
                  value={singleSelection ? Math.round(selectedElement!.opacity * 100) : 100}
                  onChange={(value) => handleBatchPropertyChange('opacity', value / 100)}
                  min={0}
                  max={100}
                  suffix="%"
                />
              </div>
            )}
          </div>

          {/* Appearance */}
          <div className="border-b border-gray-200">
            <SectionHeader title="Appearance" icon={Palette} sectionKey="appearance" />
            {openSections.appearance && (
              <div className="p-3 lg:p-3 space-y-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <button
                    onClick={() => handleBatchPropertyChange('visible', !selectedElements.some(el => !el.visible))}
                    className={`flex items-center justify-center gap-2 px-3 py-3 sm:py-2 rounded-md text-sm touch-manipulation ${
                      selectedElements.some(el => !el.visible)
                        ? 'bg-gray-100 text-gray-600'
                        : 'bg-blue-100 text-blue-600'
                    }`}
                  >
                    <Eye size={16} />
                    Visible
                  </button>
                  <button
                    onClick={() => handleBatchPropertyChange('locked', !selectedElements.some(el => el.locked))}
                    className={`flex items-center justify-center gap-2 px-3 py-3 sm:py-2 rounded-md text-sm touch-manipulation ${
                      selectedElements.some(el => el.locked)
                        ? 'bg-red-100 text-red-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    <Lock size={16} />
                    Locked
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Element-specific Properties */}
          {singleSelection && (
            <ElementSpecificProperties
              element={selectedElement!}
              onPropertyChange={(property, value) => handlePropertyChange(selectedElement!.id, property, value)}
              openSections={openSections}
              toggleSection={toggleSection}
            />
          )}
        </>
      )}

      {/* No Selection State */}
      {!hasSelection && (
        <div className="p-6 lg:p-6 text-center">
          <div className="text-gray-400 mb-2">
            <Layers size={isMobile ? 40 : 48} className="mx-auto" />
          </div>
          <p className="text-gray-500 text-sm">
            Select an element to edit its properties
          </p>
        </div>
      )}
    </div>
  )
}

// Element-specific property editors
function ElementSpecificProperties({ 
  element, 
  onPropertyChange, 
  openSections, 
  toggleSection 
}: {
  element: AnyCanvasElement
  onPropertyChange: (property: string, value: any) => void
  openSections: Record<string, boolean>
  toggleSection: (section: string) => void
}) {
  const SectionHeader = ({ title, icon: Icon, sectionKey }: { title: string; icon: any; sectionKey: string }) => (
    <button
      onClick={() => toggleSection(sectionKey)}
      className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors duration-200 border-b border-gray-200"
    >
      <div className="flex items-center gap-2">
        <Icon size={16} className="text-gray-600" />
        <span className="font-medium text-gray-900">{title}</span>
      </div>
      {openSections[sectionKey] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
    </button>
  )

  switch (element.type) {
    case 'text':
      return <TextProperties element={element as TextElement} onPropertyChange={onPropertyChange} openSections={openSections} toggleSection={toggleSection} SectionHeader={SectionHeader} />
    case 'image':
      return <ImageProperties element={element as ImageElement} onPropertyChange={onPropertyChange} openSections={openSections} toggleSection={toggleSection} SectionHeader={SectionHeader} />
    case 'shape':
      return <ShapeProperties element={element as ShapeElement} onPropertyChange={onPropertyChange} openSections={openSections} toggleSection={toggleSection} SectionHeader={SectionHeader} />
    case 'frame':
      return <FrameProperties element={element as FrameElement} onPropertyChange={onPropertyChange} openSections={openSections} toggleSection={toggleSection} SectionHeader={SectionHeader} />
    case 'background':
      return <BackgroundProperties element={element as BackgroundElement} onPropertyChange={onPropertyChange} openSections={openSections} toggleSection={toggleSection} SectionHeader={SectionHeader} />
    default:
      return null
  }
}

// Text Properties
function TextProperties({ element, onPropertyChange, openSections, toggleSection, SectionHeader }: any) {
  const textElement = element as TextElement

  return (
    <div className="border-b border-gray-200">
      <SectionHeader title="Text" icon={Type} sectionKey="text" />
      {openSections.text && (
        <div className="p-3 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Text Content</label>
            <textarea
              value={textElement.data.text}
              onChange={(e) => onPropertyChange('data.text', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Font Size</label>
              <input
                type="number"
                value={textElement.data.fontSize}
                onChange={(e) => onPropertyChange('data.fontSize', parseInt(e.target.value) || 16)}
                min={8}
                max={200}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Font Family</label>
              <select
                value={textElement.data.fontFamily}
                onChange={(e) => onPropertyChange('data.fontFamily', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Arial">Arial</option>
                <option value="Helvetica">Helvetica</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Georgia">Georgia</option>
                <option value="Courier New">Courier New</option>
                <option value="Verdana">Verdana</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Font Weight</label>
              <select
                value={textElement.data.fontWeight}
                onChange={(e) => onPropertyChange('data.fontWeight', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="normal">Normal</option>
                <option value="bold">Bold</option>
                <option value="lighter">Lighter</option>
                <option value="bolder">Bolder</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Text Align</label>
              <select
                value={textElement.data.textAlign}
                onChange={(e) => onPropertyChange('data.textAlign', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Text Color</label>
            <div className="relative">
              <input
                type="color"
                value={textElement.data.color}
                onChange={(e) => onPropertyChange('data.color', e.target.value)}
                className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Image Properties
function ImageProperties({ element, onPropertyChange, openSections, toggleSection, SectionHeader }: any) {
  const imageElement = element as ImageElement

  return (
    <div className="border-b border-gray-200">
      <SectionHeader title="Image" icon={Image} sectionKey="image" />
      {openSections.image && (
        <div className="p-3 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Image URL</label>
            <input
              type="text"
              value={imageElement.data.src}
              onChange={(e) => onPropertyChange('data.src', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter image URL"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Fit Mode</label>
            <select
              value={imageElement.data.fit}
              onChange={(e) => onPropertyChange('data.fit', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="contain">Contain</option>
              <option value="cover">Cover</option>
              <option value="fill">Fill</option>
              <option value="stretch">Stretch</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Filters</label>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 min-w-20">Brightness</span>
                <input
                  type="range"
                  value={imageElement.data.filters.brightness}
                  onChange={(e) => onPropertyChange('data.filters.brightness', parseFloat(e.target.value))}
                  min={0}
                  max={200}
                  step={1}
                  className="flex-1"
                />
                <span className="text-sm text-gray-500 min-w-12 text-right">
                  {imageElement.data.filters.brightness}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 min-w-20">Contrast</span>
                <input
                  type="range"
                  value={imageElement.data.filters.contrast}
                  onChange={(e) => onPropertyChange('data.filters.contrast', parseFloat(e.target.value))}
                  min={0}
                  max={200}
                  step={1}
                  className="flex-1"
                />
                <span className="text-sm text-gray-500 min-w-12 text-right">
                  {imageElement.data.filters.contrast}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 min-w-20">Saturation</span>
                <input
                  type="range"
                  value={imageElement.data.filters.saturation}
                  onChange={(e) => onPropertyChange('data.filters.saturation', parseFloat(e.target.value))}
                  min={0}
                  max={200}
                  step={1}
                  className="flex-1"
                />
                <span className="text-sm text-gray-500 min-w-12 text-right">
                  {imageElement.data.filters.saturation}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 min-w-20">Blur</span>
                <input
                  type="range"
                  value={imageElement.data.filters.blur}
                  onChange={(e) => onPropertyChange('data.filters.blur', parseFloat(e.target.value))}
                  min={0}
                  max={20}
                  step={0.1}
                  className="flex-1"
                />
                <span className="text-sm text-gray-500 min-w-12 text-right">
                  {imageElement.data.filters.blur}px
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 min-w-20">Grayscale</span>
                <input
                  type="range"
                  value={imageElement.data.filters.grayscale}
                  onChange={(e) => onPropertyChange('data.filters.grayscale', parseFloat(e.target.value))}
                  min={0}
                  max={100}
                  step={1}
                  className="flex-1"
                />
                <span className="text-sm text-gray-500 min-w-12 text-right">
                  {imageElement.data.filters.grayscale}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 min-w-20">Sepia</span>
                <input
                  type="range"
                  value={imageElement.data.filters.sepia}
                  onChange={(e) => onPropertyChange('data.filters.sepia', parseFloat(e.target.value))}
                  min={0}
                  max={100}
                  step={1}
                  className="flex-1"
                />
                <span className="text-sm text-gray-500 min-w-12 text-right">
                  {imageElement.data.filters.sepia}%
                </span>
              </div>
              
              {/* Reset filters button */}
              <button
                onClick={() => {
                  onPropertyChange('data.filters', {
                    brightness: 100,
                    contrast: 100,
                    saturation: 100,
                    blur: 0,
                    grayscale: 0,
                    sepia: 0
                  })
                }}
                className="w-full mt-3 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm font-medium transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Shape Properties
function ShapeProperties({ element, onPropertyChange, openSections, toggleSection, SectionHeader }: any) {
  const shapeElement = element as ShapeElement

  return (
    <div className="border-b border-gray-200">
      <SectionHeader title="Shape" icon={Square} sectionKey="shape" />
      {openSections.shape && (
        <div className="p-3 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Shape Type</label>
            <select
              value={shapeElement.data.shape}
              onChange={(e) => onPropertyChange('data.shape', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="rectangle">Rectangle</option>
              <option value="circle">Circle</option>
              <option value="triangle">Triangle</option>
              <option value="polygon">Polygon</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Fill Color</label>
              <input
                type="color"
                value={shapeElement.data.fill}
                onChange={(e) => onPropertyChange('data.fill', e.target.value)}
                className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Stroke Color</label>
              <input
                type="color"
                value={shapeElement.data.stroke}
                onChange={(e) => onPropertyChange('data.stroke', e.target.value)}
                className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Stroke Width</label>
            <input
              type="number"
              value={shapeElement.data.strokeWidth}
              onChange={(e) => onPropertyChange('data.strokeWidth', parseInt(e.target.value) || 0)}
              min={0}
              max={50}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {shapeElement.data.shape === 'rectangle' && (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Corner Radius</label>
              <input
                type="number"
                value={shapeElement.data.cornerRadius || 0}
                onChange={(e) => onPropertyChange('data.cornerRadius', parseInt(e.target.value) || 0)}
                min={0}
                max={100}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {shapeElement.data.shape === 'polygon' && (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Sides</label>
              <input
                type="number"
                value={shapeElement.data.sides || 6}
                onChange={(e) => onPropertyChange('data.sides', parseInt(e.target.value) || 6)}
                min={3}
                max={20}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Frame Properties
function FrameProperties({ element, onPropertyChange, openSections, toggleSection, SectionHeader }: any) {
  const frameElement = element as FrameElement

  return (
    <div className="border-b border-gray-200">
      <SectionHeader title="Device Frame" icon={Smartphone} sectionKey="frame" />
      {openSections.frame && (
        <div className="p-3 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Frame Type</label>
            <select
              value={frameElement.data.frameType}
              onChange={(e) => onPropertyChange('data.frameType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="mobile">Mobile</option>
              <option value="tablet">Tablet</option>
              <option value="desktop">Desktop</option>
              <option value="browser">Browser</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Frame Source</label>
            <input
              type="text"
              value={frameElement.data.src}
              onChange={(e) => onPropertyChange('data.src', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter frame image URL"
            />
          </div>

          {/* TODO: Implement DeviceFrameSelector */}
          <div className="mt-4 p-3 bg-gray-50 rounded-md text-sm text-gray-600">
            Device frame selector will be implemented
          </div>
        </div>
      )}
    </div>
  )
}

// Background Properties
function BackgroundProperties({ element, onPropertyChange, openSections, toggleSection, SectionHeader }: any) {
  const backgroundElement = element as BackgroundElement

  return (
    <div className="border-b border-gray-200">
      <SectionHeader title="Background" icon={Palette} sectionKey="background" />
      {openSections.background && (
        <div className="p-3 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Background Type</label>
            <select
              value={backgroundElement.data.backgroundType}
              onChange={(e) => onPropertyChange('data.backgroundType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="color">Solid Color</option>
              <option value="gradient">Gradient</option>
              <option value="image">Image</option>
            </select>
          </div>

          {backgroundElement.data.backgroundType === 'color' && (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Color</label>
              <input
                type="color"
                value={backgroundElement.data.color || '#ffffff'}
                onChange={(e) => onPropertyChange('data.color', e.target.value)}
                className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
              />
            </div>
          )}

          {backgroundElement.data.backgroundType === 'image' && (
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Image URL</label>
                <input
                  type="text"
                  value={backgroundElement.data.image?.src || ''}
                  onChange={(e) => onPropertyChange('data.image.src', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter image URL"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Image Fit</label>
                <select
                  value={backgroundElement.data.image?.fit || 'cover'}
                  onChange={(e) => onPropertyChange('data.image.fit', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="cover">Cover</option>
                  <option value="contain">Contain</option>
                  <option value="repeat">Repeat</option>
                  <option value="stretch">Stretch</option>
                </select>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}