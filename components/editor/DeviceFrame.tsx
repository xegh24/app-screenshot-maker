'use client'

import React, { useState, useEffect } from 'react'
import { Group, Image, Rect } from 'react-konva'
import useImage from 'use-image'
import type { FrameElement } from '../../store/editor'
import { getDeviceById, calculateScaledContentArea, type DeviceSpec } from '../../lib/devices'

interface DeviceFrameProps {
  frame: FrameElement
  contentArea?: {
    x: number
    y: number
    width: number
    height: number
  }
  onContentAreaChange?: (area: { x: number; y: number; width: number; height: number }) => void
}


export default function DeviceFrame({
  frame,
  contentArea,
  onContentAreaChange
}: DeviceFrameProps) {
  // Try to get device spec from our new device library
  const deviceSpec = getDeviceById(frame.data.src) || getFrameSpecFromSrc(frame.data.src)
  const [frameImage, frameImageStatus] = useImage(deviceSpec.frame.src, 'anonymous')
  const [scaledContentArea, setScaledContentArea] = useState(contentArea)

  useEffect(() => {
    if (deviceSpec && frame.width && frame.height) {
      // Calculate scaling factor based on frame dimensions
      const scaleX = frame.width / deviceSpec.frame.width
      const scaleY = frame.height / deviceSpec.frame.height
      const scale = Math.min(scaleX, scaleY)

      const newContentArea = {
        x: frame.x + deviceSpec.contentArea.x * scale,
        y: frame.y + deviceSpec.contentArea.y * scale,
        width: deviceSpec.contentArea.width * scale,
        height: deviceSpec.contentArea.height * scale
      }

      setScaledContentArea(newContentArea)
      onContentAreaChange?.(newContentArea)
    }
  }, [frame, deviceSpec, onContentAreaChange])

  if (frameImageStatus === 'loading') {
    return (
      <Group>
        <Rect
          x={frame.x}
          y={frame.y}
          width={frame.width}
          height={frame.height}
          fill="#f0f0f0"
          stroke="#ddd"
          strokeWidth={2}
          dash={[5, 5]}
          opacity={0.7}
        />
        <Rect
          x={scaledContentArea?.x || frame.x}
          y={scaledContentArea?.y || frame.y}
          width={scaledContentArea?.width || frame.width * 0.8}
          height={scaledContentArea?.height || frame.height * 0.8}
          fill="#ffffff"
          stroke="#999"
          strokeWidth={1}
          dash={[3, 3]}
        />
      </Group>
    )
  }

  if (frameImageStatus === 'failed' || !frameImage) {
    return (
      <Group>
        <Rect
          x={frame.x}
          y={frame.y}
          width={frame.width}
          height={frame.height}
          fill="#ffebee"
          stroke="#f44336"
          strokeWidth={2}
          dash={[5, 5]}
          opacity={0.7}
        />
        <Rect
          x={scaledContentArea?.x || frame.x}
          y={scaledContentArea?.y || frame.y}
          width={scaledContentArea?.width || frame.width * 0.8}
          height={scaledContentArea?.height || frame.height * 0.8}
          fill="#ffffff"
          stroke="#f44336"
          strokeWidth={1}
          dash={[3, 3]}
        />
      </Group>
    )
  }

  return (
    <Group>
      {/* Content area background (optional) */}
      {scaledContentArea && (
        <Rect
          x={scaledContentArea.x}
          y={scaledContentArea.y}
          width={scaledContentArea.width}
          height={scaledContentArea.height}
          fill="#ffffff"
          listening={false}
        />
      )}
      
      {/* Device frame */}
      <Image
        x={frame.x}
        y={frame.y}
        width={frame.width}
        height={frame.height}
        image={frameImage}
        opacity={frame.opacity}
        rotation={frame.rotation}
        scaleX={frame.scaleX}
        scaleY={frame.scaleY}
        listening={false}
      />
    </Group>
  )
}

// Helper function to get frame specifications (fallback for old frame sources)
function getFrameSpecFromSrc(frameSrc: string): DeviceSpec {
  // Legacy frame mapping
  const legacyMapping: Record<string, string> = {
    '/frames/iphone-14.png': 'iphone-14',
    '/frames/iphone-14-pro.png': 'iphone-14-pro',
    '/frames/macbook-pro.png': 'macbook-pro-16',
    '/frames/macbook-air.png': 'macbook-air-15',
    '/frames/ipad-pro.png': 'ipad-pro-12-9',
    '/frames/imac-24.png': 'imac-24',
    '/frames/browser-chrome.png': 'chrome-browser',
    '/frames/browser-safari.png': 'safari-browser',
    '/frames/browser-firefox.png': 'firefox-browser',
    '/frames/android-pixel.png': 'pixel-8-pro',
    '/frames/tablet-generic.png': 'generic-tablet',
    '/frames/desktop-monitor.png': 'desktop-monitor'
  }

  const deviceId = legacyMapping[frameSrc]
  if (deviceId) {
    const device = getDeviceById(deviceId)
    if (device) return device
  }

  // Default frame specification for unknown frames
  return {
    id: 'custom-frame',
    name: 'Custom Frame',
    category: 'desktop',
    brand: 'generic',
    frame: {
      src: frameSrc,
      width: 400,
      height: 300,
      aspectRatio: 400 / 300
    },
    contentArea: { x: 50, y: 50, width: 300, height: 200 },
    metadata: {
      orientation: 'landscape'
    },
    scaling: {
      minScale: 0.1,
      maxScale: 2.0,
      defaultScale: 1.0,
      maintainAspectRatio: true
    }
  }
}

// Export device specifications for use in other components
export { getDeviceById, calculateScaledContentArea }
export type { DeviceSpec }


// Hook for managing device frame state
export function useDeviceFrame(frameElement: FrameElement | null) {
  const [contentArea, setContentArea] = useState<{
    x: number
    y: number
    width: number
    height: number
  } | null>(null)

  const updateContentArea = (area: { x: number; y: number; width: number; height: number }) => {
    setContentArea(area)
  }

  const getDeviceSpec = (frameSrc: string): DeviceSpec => {
    return getDeviceById(frameSrc) || getFrameSpecFromSrc(frameSrc)
  }

  const isPointInContentArea = (x: number, y: number): boolean => {
    if (!contentArea) return false
    return (
      x >= contentArea.x &&
      x <= contentArea.x + contentArea.width &&
      y >= contentArea.y &&
      y <= contentArea.y + contentArea.height
    )
  }

  const getContentAreaBounds = () => contentArea

  return {
    contentArea,
    updateContentArea,
    getDeviceSpec,
    isPointInContentArea,
    getContentAreaBounds
  }
}