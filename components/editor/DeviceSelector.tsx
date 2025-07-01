'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import { 
  ALL_DEVICES, 
  DEVICE_CATEGORIES, 
  getPopularDevices,
  type DeviceSpec 
} from '../../lib/devices'
import { Button } from '../ui/Button'

interface DeviceSelectorProps {
  selectedDeviceId?: string
  onDeviceSelect: (device: DeviceSpec) => void
  className?: string
  showCategories?: boolean
  showPreview?: boolean
  maxPreviewSize?: number
}

type CategoryKey = keyof typeof DEVICE_CATEGORIES

const CATEGORY_LABELS: Record<CategoryKey, string> = {
  mobile: 'Mobile Devices',
  tablet: 'Tablet Devices', 
  desktop: 'Desktop Devices',
  browser: 'Browser Frames'
}

const CATEGORY_ICONS: Record<CategoryKey, string> = {
  mobile: '📱',
  tablet: '📱',
  desktop: '💻',
  browser: '🌐'
}

export default function DeviceSelector({
  selectedDeviceId,
  onDeviceSelect,
  className = '',
  showCategories = true,
  showPreview = true,
  maxPreviewSize = 120
}: DeviceSelectorProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryKey | 'popular'>('popular')
  const [previewImages, setPreviewImages] = useState<Record<string, HTMLImageElement>>({})
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')

  // Get devices based on active category and search
  const filteredDevices = useMemo(() => {
    let devices: DeviceSpec[]
    
    if (activeCategory === 'popular') {
      devices = getPopularDevices()
    } else {
      devices = DEVICE_CATEGORIES[activeCategory] || []
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      devices = devices.filter(device => 
        device.name.toLowerCase().includes(query) ||
        device.brand.toLowerCase().includes(query) ||
        device.category.toLowerCase().includes(query)
      )
    }
    
    return devices
  }, [activeCategory, searchQuery])

  // Preload device frame images for previews
  useEffect(() => {
    if (!showPreview) return

    filteredDevices.forEach(device => {
      if (previewImages[device.id] || loadingImages.has(device.id)) return

      setLoadingImages(prev => new Set(prev).add(device.id))
      
      const img = new window.Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        setPreviewImages(prev => ({ ...prev, [device.id]: img }))
        setLoadingImages(prev => {
          const next = new Set(prev)
          next.delete(device.id)
          return next
        })
      }
      img.onerror = () => {
        setLoadingImages(prev => {
          const next = new Set(prev)
          next.delete(device.id)
          return next
        })
      }
      img.src = device.frame.src
    })
  }, [filteredDevices, showPreview, previewImages, loadingImages])

  const handleDeviceSelect = (device: DeviceSpec) => {
    onDeviceSelect(device)
  }

  const renderDevicePreview = (device: DeviceSpec) => {
    const previewImg = previewImages[device.id]
    const isLoading = loadingImages.has(device.id)
    
    if (!showPreview) {
      return (
        <div className="w-full h-16 bg-gray-100 rounded-md flex items-center justify-center">
          <span className="text-2xl">{CATEGORY_ICONS[device.category]}</span>
        </div>
      )
    }

    return (
      <div 
        className="w-full bg-gray-50 rounded-md overflow-hidden flex items-center justify-center"
        style={{ height: maxPreviewSize }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : previewImg ? (
          <img
            src={previewImg.src}
            alt={device.name}
            className="max-w-full max-h-full object-contain"
            style={{ 
              maxWidth: maxPreviewSize,
              maxHeight: maxPreviewSize 
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400">
            <span className="text-3xl mb-1">{CATEGORY_ICONS[device.category]}</span>
            <span className="text-xs">No preview</span>
          </div>
        )}
      </div>
    )
  }

  const renderDeviceCard = (device: DeviceSpec) => {
    const isSelected = selectedDeviceId === device.id
    
    return (
      <button
        key={device.id}
        onClick={() => handleDeviceSelect(device)}
        className={`
          relative p-3 rounded-lg border-2 transition-all duration-200 text-left w-full
          ${isSelected 
            ? 'border-blue-500 bg-blue-50 shadow-md' 
            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm bg-white'
          }
        `}
        title={`${device.name} - ${device.metadata.screenSize || ''} ${device.metadata.resolution || ''}`}
      >
        {/* Device Preview */}
        {renderDevicePreview(device)}
        
        {/* Device Info */}
        <div className="mt-3">
          <div className="font-medium text-gray-900 text-sm mb-1 line-clamp-1">
            {device.name}
          </div>
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="capitalize">{device.brand}</span>
            {device.metadata.year && (
              <span>{device.metadata.year}</span>
            )}
          </div>
          
          {device.metadata.screenSize && (
            <div className="text-xs text-gray-400 mt-1">
              {device.metadata.screenSize}
            </div>
          )}
        </div>
        
        {/* Selection Indicator */}
        {isSelected && (
          <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </button>
    )
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search devices..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Category Tabs */}
      {showCategories && (
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={activeCategory === 'popular' ? 'default' : 'secondary'}
              size="sm"
              onClick={() => setActiveCategory('popular')}
              className="text-xs"
            >
              ⭐ Popular
            </Button>
            
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <Button
                key={key}
                variant={activeCategory === key ? 'default' : 'secondary'}
                size="sm"
                onClick={() => setActiveCategory(key as CategoryKey)}
                className="text-xs"
              >
                {CATEGORY_ICONS[key as CategoryKey]} {label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Category Title */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {activeCategory === 'popular' ? '⭐ Popular Devices' : CATEGORY_LABELS[activeCategory]}
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          {searchQuery ? (
            `${filteredDevices.length} device${filteredDevices.length !== 1 ? 's' : ''} found`
          ) : (
            `Choose from ${filteredDevices.length} ${activeCategory === 'popular' ? 'popular' : activeCategory} device${filteredDevices.length !== 1 ? 's' : ''}`
          )}
        </p>
      </div>

      {/* Device Grid */}
      {filteredDevices.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredDevices.map(renderDeviceCard)}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-4xl text-gray-300 mb-4">📱</div>
          <div className="text-gray-500">
            {searchQuery ? (
              <>
                No devices found for "<strong>{searchQuery}</strong>"
                <div className="mt-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setSearchQuery('')}
                  >
                    Clear search
                  </Button>
                </div>
              </>
            ) : (
              'No devices available in this category'
            )}
          </div>
        </div>
      )}

      {/* Device Count Info */}
      <div className="mt-6 text-center text-xs text-gray-400">
        Total devices available: {ALL_DEVICES.length}
      </div>
    </div>
  )
}

// Hook for managing device selection state
export function useDeviceSelector(initialDeviceId?: string) {
  const [selectedDevice, setSelectedDevice] = useState<DeviceSpec | null>(
    initialDeviceId ? ALL_DEVICES.find(d => d.id === initialDeviceId) || null : null
  )

  const selectDevice = (device: DeviceSpec) => {
    setSelectedDevice(device)
  }

  const clearSelection = () => {
    setSelectedDevice(null)
  }

  return {
    selectedDevice,
    selectedDeviceId: selectedDevice?.id,
    selectDevice,
    clearSelection,
    hasSelection: selectedDevice !== null
  }
}

// Compact device selector for toolbar/sidebar usage
export function CompactDeviceSelector({
  selectedDeviceId,
  onDeviceSelect,
  className = ''
}: Pick<DeviceSelectorProps, 'selectedDeviceId' | 'onDeviceSelect' | 'className'>) {
  const [isOpen, setIsOpen] = useState(false)
  const selectedDevice = selectedDeviceId ? ALL_DEVICES.find(d => d.id === selectedDeviceId) : null

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="secondary"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between"
      >
        <span className="flex items-center gap-2">
          <span>📱</span>
          {selectedDevice ? selectedDevice.name : 'Select Device'}
        </span>
        <svg 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          <DeviceSelector
            selectedDeviceId={selectedDeviceId}
            onDeviceSelect={(device) => {
              onDeviceSelect(device)
              setIsOpen(false)
            }}
            showCategories={false}
            showPreview={false}
            className="p-4"
          />
        </div>
      )}
    </div>
  )
}