'use client'

import React, { useState } from 'react'
import { useEditorStore } from '../../store/editor'
import { BackgroundElement } from '../../store/editor'
import ColorPicker from './ColorPicker'
import { 
  Palette, 
  Image as ImageIcon,
  Upload,
  X,
  RotateCw
} from 'lucide-react'

interface GradientStop {
  color: string
  stop: number
}

export default function BackgroundPanel() {
  const { elements, addElement, updateElement, deleteElement } = useEditorStore()
  const [activeTab, setActiveTab] = useState<'color' | 'gradient' | 'image'>('color')
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [selectedStopIndex, setSelectedStopIndex] = useState(0)
  
  // Find background element
  const backgroundElement = elements.find(el => el.type === 'background') as BackgroundElement | undefined
  
  // Local gradient state
  const [gradientStops, setGradientStops] = useState<GradientStop[]>(
    backgroundElement?.data.gradient?.colors || [
      { color: '#667eea', stop: 0 },
      { color: '#764ba2', stop: 100 }
    ]
  )
  const [gradientAngle, setGradientAngle] = useState(
    backgroundElement?.data.gradient?.angle || 45
  )
  const [gradientType, setGradientType] = useState<'linear' | 'radial'>(
    backgroundElement?.data.gradient?.type || 'linear'
  )

  const createOrUpdateBackground = (data: BackgroundElement['data']) => {
    if (backgroundElement) {
      updateElement(backgroundElement.id, { data })
    } else {
      const newBackground: Omit<BackgroundElement, 'id' | 'zIndex'> = {
        type: 'background',
        x: 0,
        y: 0,
        width: 1200,
        height: 800,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        opacity: 1,
        visible: true,
        locked: true,
        style: {},
        data
      }
      addElement(newBackground)
    }
  }

  const handleColorChange = (color: string) => {
    createOrUpdateBackground({
      backgroundType: 'color',
      color
    })
  }

  const updateGradient = () => {
    createOrUpdateBackground({
      backgroundType: 'gradient',
      gradient: {
        type: gradientType,
        colors: gradientStops,
        angle: gradientType === 'linear' ? gradientAngle : undefined
      }
    })
  }

  const addGradientStop = () => {
    const newStops = [...gradientStops]
    const lastStop = newStops[newStops.length - 1]
    newStops.push({ 
      color: '#000000', 
      stop: Math.min(lastStop.stop + 10, 100) 
    })
    setGradientStops(newStops)
  }

  const removeGradientStop = (index: number) => {
    if (gradientStops.length > 2) {
      const newStops = gradientStops.filter((_, i) => i !== index)
      setGradientStops(newStops)
      setSelectedStopIndex(Math.max(0, selectedStopIndex - 1))
    }
  }

  const updateGradientStop = (index: number, updates: Partial<GradientStop>) => {
    const newStops = [...gradientStops]
    newStops[index] = { ...newStops[index], ...updates }
    setGradientStops(newStops)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const imageSrc = event.target?.result as string
        createOrUpdateBackground({
          backgroundType: 'image',
          image: {
            src: imageSrc,
            fit: 'cover',
            opacity: 1
          }
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const removeBackground = () => {
    if (backgroundElement) {
      deleteElement(backgroundElement.id)
    }
  }

  const getGradientPreview = () => {
    const colors = gradientStops
      .sort((a, b) => a.stop - b.stop)
      .map(stop => `${stop.color} ${stop.stop}%`)
      .join(', ')
    
    if (gradientType === 'linear') {
      return `linear-gradient(${gradientAngle}deg, ${colors})`
    } else {
      return `radial-gradient(circle, ${colors})`
    }
  }

  return (
    <div className="p-4 border-b space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">Background</h3>
        {backgroundElement && (
          <button
            onClick={removeBackground}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            title="Remove background"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Background Type Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
        <button
          onClick={() => setActiveTab('color')}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'color' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Palette className="h-4 w-4" />
          Color
        </button>
        <button
          onClick={() => setActiveTab('gradient')}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'gradient' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Palette className="h-4 w-4" />
          Gradient
        </button>
        <button
          onClick={() => setActiveTab('image')}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'image' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <ImageIcon className="h-4 w-4" />
          Image
        </button>
      </div>

      {/* Color Tab */}
      {activeTab === 'color' && (
        <div className="space-y-3">
          <div className="relative">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="w-full flex items-center gap-3 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <div
                className="w-8 h-8 rounded border border-gray-300"
                style={{ 
                  backgroundColor: backgroundElement?.data.color || '#ffffff' 
                }}
              />
              <span className="text-sm">
                {backgroundElement?.data.color || '#ffffff'}
              </span>
            </button>
            {showColorPicker && (
              <div className="absolute top-full left-0 right-0 mt-1 z-10">
                <ColorPicker
                  color={backgroundElement?.data.color || '#ffffff'}
                  onChange={handleColorChange}
                  onClose={() => setShowColorPicker(false)}
                />
              </div>
            )}
          </div>
          
          {/* Preset Colors */}
          <div className="grid grid-cols-6 gap-2">
            {['#ffffff', '#f3f4f6', '#e5e7eb', '#d1d5db', '#9ca3af', '#6b7280',
              '#4b5563', '#374151', '#1f2937', '#111827', '#000000', '#ef4444',
              '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4'
            ].map(color => (
              <button
                key={color}
                onClick={() => handleColorChange(color)}
                className="w-full aspect-square rounded-md border-2 border-gray-200 hover:border-gray-400 transition-colors"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      )}

      {/* Gradient Tab */}
      {activeTab === 'gradient' && (
        <div className="space-y-4">
          {/* Gradient Preview */}
          <div
            className="w-full h-24 rounded-md border border-gray-300"
            style={{ background: getGradientPreview() }}
          />

          {/* Gradient Type */}
          <div className="flex gap-2">
            <button
              onClick={() => setGradientType('linear')}
              className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${
                gradientType === 'linear'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Linear
            </button>
            <button
              onClick={() => setGradientType('radial')}
              className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${
                gradientType === 'radial'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Radial
            </button>
          </div>

          {/* Angle Control (for linear gradients) */}
          {gradientType === 'linear' && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Angle
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={gradientAngle}
                  onChange={(e) => setGradientAngle(parseInt(e.target.value))}
                  className="flex-1"
                />
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="360"
                    value={gradientAngle}
                    onChange={(e) => setGradientAngle(parseInt(e.target.value) || 0)}
                    className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
                  />
                  <span className="text-xs text-gray-500">°</span>
                </div>
                <button
                  onClick={() => setGradientAngle((gradientAngle + 45) % 360)}
                  className="p-1 hover:bg-gray-100 rounded"
                  title="Rotate 45°"
                >
                  <RotateCw className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Gradient Stops */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-gray-600">
                Color Stops
              </label>
              <button
                onClick={addGradientStop}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                Add Stop
              </button>
            </div>
            <div className="space-y-2">
              {gradientStops.map((stop, index) => (
                <div key={index} className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedStopIndex(index)
                      setShowColorPicker(true)
                    }}
                    className="w-8 h-8 rounded border-2 border-gray-300 hover:border-gray-400"
                    style={{ backgroundColor: stop.color }}
                  />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={stop.stop}
                    onChange={(e) => updateGradientStop(index, { stop: parseInt(e.target.value) })}
                    className="flex-1"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={stop.stop}
                    onChange={(e) => updateGradientStop(index, { stop: parseInt(e.target.value) || 0 })}
                    className="w-14 px-2 py-1 text-sm border border-gray-300 rounded"
                  />
                  <span className="text-xs text-gray-500">%</span>
                  {gradientStops.length > 2 && (
                    <button
                      onClick={() => removeGradientStop(index)}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {showColorPicker && selectedStopIndex < gradientStops.length && (
              <div className="mt-2">
                <ColorPicker
                  color={gradientStops[selectedStopIndex].color}
                  onChange={(color) => {
                    updateGradientStop(selectedStopIndex, { color })
                  }}
                  onClose={() => setShowColorPicker(false)}
                />
              </div>
            )}
          </div>

          <button
            onClick={updateGradient}
            className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Apply Gradient
          </button>
        </div>
      )}

      {/* Image Tab */}
      {activeTab === 'image' && (
        <div className="space-y-4">
          {backgroundElement?.data.image ? (
            <>
              <div className="relative">
                <img
                  src={backgroundElement.data.image.src}
                  alt="Background"
                  className="w-full h-32 object-cover rounded-md border border-gray-300"
                />
                <button
                  onClick={removeBackground}
                  className="absolute top-2 right-2 p-1 bg-white rounded-md shadow-md hover:bg-gray-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Image Settings */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Fit
                  </label>
                  <select
                    value={backgroundElement.data.image.fit}
                    onChange={(e) => {
                      if (backgroundElement.data.image) {
                        createOrUpdateBackground({
                          ...backgroundElement.data,
                          image: {
                            ...backgroundElement.data.image,
                            fit: e.target.value as any
                          }
                        })
                      }
                    }}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
                  >
                    <option value="cover">Cover</option>
                    <option value="contain">Contain</option>
                    <option value="stretch">Stretch</option>
                    <option value="repeat">Repeat</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Opacity
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={backgroundElement.data.image.opacity}
                      onChange={(e) => {
                        if (backgroundElement.data.image) {
                          createOrUpdateBackground({
                            ...backgroundElement.data,
                            image: {
                              ...backgroundElement.data.image,
                              opacity: parseFloat(e.target.value)
                            }
                          })
                        }
                      }}
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-600 w-12 text-right">
                      {Math.round(backgroundElement.data.image.opacity * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <label className="block">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-md hover:border-gray-400 cursor-pointer transition-colors">
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">Click to upload image</span>
                <span className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</span>
              </div>
            </label>
          )}
        </div>
      )}
    </div>
  )
}