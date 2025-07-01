'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Stage, Layer, Rect, Line, Image } from 'react-konva'
import Konva from 'konva'
import useImage from 'use-image'
import { useEditorStore } from '../../store/editor'
import CanvasElement from './CanvasElement'
import DeviceFrame from './DeviceFrame'
import { Modal } from '../ui/Modal'
import DeviceSelector from './DeviceSelector'
import { snapToGrid, screenToCanvas, throttle, debounce } from '../../lib/canvas/utils'
import { getOptimalFrameSize } from '../../lib/devices'
import type { AnyCanvasElement, FrameElement, BackgroundElement, TextElement } from '../../store/editor'
import type { DeviceSpec } from '../../lib/devices'
import { loadGoogleFont } from '../../lib/fonts'

interface CanvasProps {
  width?: number
  height?: number
  className?: string
}

export default function Canvas({ 
  width = 1200, 
  height = 800, 
  className = '' 
}: CanvasProps) {
  const stageRef = useRef<Konva.Stage>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [stageSize, setStageSize] = useState({ width, height })
  const [isPanning, setIsPanning] = useState(false)
  const [isSelecting, setIsSelecting] = useState(false)
  const [selectionRect, setSelectionRect] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 })
  const [showDeviceSelector, setShowDeviceSelector] = useState(false)
  const [pendingFramePosition, setPendingFramePosition] = useState<{ x: number; y: number } | null>(null)
  
  // Touch gesture state
  const [touchState, setTouchState] = useState({
    lastTouchDistance: 0,
    lastTouchCenter: { x: 0, y: 0 },
    touchStarted: false,
    singleTouchStart: { x: 0, y: 0 },
    touchCount: 0
  })

  // Store state
  const {
    canvas,
    elements,
    selectedElementIds,
    activeTool,
    isDrawing,
    setZoom,
    setOffset,
    selectElement,
    selectElements,
    clearSelection,
    addElement,
    updateElement,
    deleteElements,
    setIsDrawing,
    setActiveTool
  } = useEditorStore()

  // Touch gesture utilities
  const getTouchDistance = (touches: React.TouchList) => {
    if (touches.length < 2) return 0
    const touch1 = touches[0]
    const touch2 = touches[1]
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) + 
      Math.pow(touch2.clientY - touch1.clientY, 2)
    )
  }

  const getTouchCenter = (touches: React.TouchList) => {
    if (touches.length === 1) {
      return { x: touches[0].clientX, y: touches[0].clientY }
    } else if (touches.length === 2) {
      return {
        x: (touches[0].clientX + touches[1].clientX) / 2,
        y: (touches[0].clientY + touches[1].clientY) / 2
      }
    }
    return { x: 0, y: 0 }
  }

  // Handle container resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { offsetWidth, offsetHeight } = containerRef.current
        setStageSize({ width: offsetWidth, height: offsetHeight })
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Handle zoom with wheel
  const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault()
    
    if (e.evt.ctrlKey || e.evt.metaKey) {
      // Zoom
      const scaleBy = 1.1
      const stage = e.target.getStage()
      if (!stage) return

      const oldScale = stage.scaleX()
      const pointer = stage.getPointerPosition()
      if (!pointer) return

      const mousePointTo = {
        x: (pointer.x - stage.x()) / oldScale,
        y: (pointer.y - stage.y()) / oldScale,
      }

      const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy
      const clampedScale = Math.max(0.1, Math.min(5, newScale))

      stage.scale({ x: clampedScale, y: clampedScale })

      const newPos = {
        x: pointer.x - mousePointTo.x * clampedScale,
        y: pointer.y - mousePointTo.y * clampedScale,
      }
      
      stage.position(newPos)
      setZoom(clampedScale)
      setOffset(newPos.x, newPos.y)
    } else {
      // Pan
      const stage = e.target.getStage()
      if (!stage) return

      const newPos = {
        x: stage.x() - e.evt.deltaX,
        y: stage.y() - e.evt.deltaY,
      }
      
      stage.position(newPos)
      setOffset(newPos.x, newPos.y)
    }
  }, [setZoom, setOffset])

  // Handle mouse down on stage
  const handleMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage()
    if (!stage) return

    const pos = stage.getPointerPosition()
    if (!pos) return

    const canvasPos = screenToCanvas(pos.x, pos.y, canvas.zoom, canvas.offsetX, canvas.offsetY)

    // Check if clicked on empty area
    if (e.target === stage) {
      if (e.evt.button === 1 || (e.evt.button === 0 && e.evt.shiftKey)) {
        // Middle mouse or shift+click - start panning
        setIsPanning(true)
        setDragStartPos(pos)
      } else if (activeTool === 'select') {
        // Start selection rectangle
        setIsSelecting(true)
        setSelectionRect({ x: canvasPos.x, y: canvasPos.y, width: 0, height: 0 })
        clearSelection()
      } else if (activeTool === 'frame') {
        // Store position for frame placement and show device selector
        setPendingFramePosition(canvasPos)
        setShowDeviceSelector(true)
      } else {
        // Handle tool-specific actions
        handleToolAction(canvasPos)
      }
    }
  }, [canvas, activeTool, clearSelection])

  // Handle mouse move
  const handleMouseMove = useCallback(throttle((e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage()
    if (!stage) return

    const pos = stage.getPointerPosition()
    if (!pos) return

    if (isPanning) {
      const newPos = {
        x: canvas.offsetX + (pos.x - dragStartPos.x),
        y: canvas.offsetY + (pos.y - dragStartPos.y)
      }
      stage.position(newPos)
      setOffset(newPos.x, newPos.y)
      setDragStartPos(pos)
    } else if (isSelecting) {
      const canvasPos = screenToCanvas(pos.x, pos.y, canvas.zoom, canvas.offsetX, canvas.offsetY)
      const newRect = {
        x: Math.min(selectionRect.x, canvasPos.x),
        y: Math.min(selectionRect.y, canvasPos.y),
        width: Math.abs(canvasPos.x - selectionRect.x),
        height: Math.abs(canvasPos.y - selectionRect.y)
      }
      setSelectionRect(newRect)
    }
  }, 16), [isPanning, isSelecting, canvas, dragStartPos, selectionRect, setOffset])

  // Handle mouse up
  const handleMouseUp = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (isPanning) {
      setIsPanning(false)
    } else if (isSelecting) {
      setIsSelecting(false)
      
      // Select elements within selection rectangle
      const selectedIds = elements
        .filter(element => {
          return (
            element.x >= selectionRect.x &&
            element.y >= selectionRect.y &&
            element.x + element.width <= selectionRect.x + selectionRect.width &&
            element.y + element.height <= selectionRect.y + selectionRect.height
          )
        })
        .map(element => element.id)
      
      if (selectedIds.length > 0) {
        selectElements(selectedIds)
      }
      
      setSelectionRect({ x: 0, y: 0, width: 0, height: 0 })
    }
  }, [isPanning, isSelecting, elements, selectionRect, selectElements])

  // Touch event handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    const touches = e.touches
    const touchCount = touches.length

    setTouchState(prev => ({
      ...prev,
      touchCount,
      touchStarted: true
    }))

    if (touchCount === 1) {
      // Single touch - potential tap or drag
      const touch = touches[0]
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return

      const pos = {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      }

      setTouchState(prev => ({
        ...prev,
        singleTouchStart: pos
      }))
    } else if (touchCount === 2) {
      // Two fingers - zoom/pan
      const distance = getTouchDistance(touches)
      const center = getTouchCenter(touches)
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return

      setTouchState(prev => ({
        ...prev,
        lastTouchDistance: distance,
        lastTouchCenter: {
          x: center.x - rect.left,
          y: center.y - rect.top
        }
      }))
    }
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    const touches = e.touches
    const touchCount = touches.length

    if (touchCount === 1 && touchState.touchStarted) {
      // Single touch drag - pan canvas
      const touch = touches[0]
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return

      const currentPos = {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      }

      const deltaX = currentPos.x - touchState.singleTouchStart.x
      const deltaY = currentPos.y - touchState.singleTouchStart.y

      // Only start panning if moved enough (prevent accidental panning)
      if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
        const newPos = {
          x: canvas.offsetX + deltaX,
          y: canvas.offsetY + deltaY
        }
        
        setOffset(newPos.x, newPos.y)
        setTouchState(prev => ({
          ...prev,
          singleTouchStart: currentPos
        }))
      }
    } else if (touchCount === 2) {
      // Two finger pinch zoom
      const distance = getTouchDistance(touches)
      const center = getTouchCenter(touches)
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return

      const currentCenter = {
        x: center.x - rect.left,
        y: center.y - rect.top
      }

      if (touchState.lastTouchDistance > 0) {
        // Calculate zoom
        const scale = distance / touchState.lastTouchDistance
        const newZoom = Math.max(0.1, Math.min(5, canvas.zoom * scale))

        // Calculate new offset to zoom around touch center
        const zoomPoint = screenToCanvas(
          touchState.lastTouchCenter.x,
          touchState.lastTouchCenter.y,
          canvas.zoom,
          canvas.offsetX,
          canvas.offsetY
        )

        const newOffset = {
          x: currentCenter.x - zoomPoint.x * newZoom,
          y: currentCenter.y - zoomPoint.y * newZoom
        }

        setZoom(newZoom)
        setOffset(newOffset.x, newOffset.y)
      }

      setTouchState(prev => ({
        ...prev,
        lastTouchDistance: distance,
        lastTouchCenter: currentCenter
      }))
    }
  }, [touchState, canvas, setZoom, setOffset])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    const touches = e.touches

    if (touches.length === 0) {
      // All touches ended
      setTouchState(prev => ({
        ...prev,
        touchStarted: false,
        touchCount: 0,
        lastTouchDistance: 0
      }))
    } else {
      // Update state for remaining touches
      setTouchState(prev => ({
        ...prev,
        touchCount: touches.length
      }))

      if (touches.length === 1) {
        // Reset single touch state
        const touch = touches[0]
        const rect = containerRef.current?.getBoundingClientRect()
        if (!rect) return

        setTouchState(prev => ({
          ...prev,
          singleTouchStart: {
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top
          },
          lastTouchDistance: 0
        }))
      }
    }
  }, [])

  // Handle tool-specific actions
  const handleToolAction = useCallback((pos: { x: number; y: number }) => {
    let elementData: Omit<AnyCanvasElement, 'id' | 'zIndex'>

    switch (activeTool) {
      case 'text':
        elementData = {
          type: 'text',
          x: pos.x,
          y: pos.y,
          width: 200,
          height: 40,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          opacity: 1,
          visible: true,
          locked: false,
          style: {},
          data: {
            text: 'Click to edit text',
            fontSize: 24,
            fontFamily: 'Inter',
            fontWeight: 'normal',
            fontStyle: 'normal',
            textAlign: 'left',
            textDecoration: 'none',
            color: '#000000',
            lineHeight: 1.2,
            letterSpacing: 0
          }
        }
        addElement(elementData)
        setActiveTool('select')
        break

      case 'shape':
        elementData = {
          type: 'shape',
          x: pos.x,
          y: pos.y,
          width: 100,
          height: 100,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          opacity: 1,
          visible: true,
          locked: false,
          style: {},
          data: {
            shape: 'rectangle',
            fill: '#3b82f6',
            stroke: '#1e40af',
            strokeWidth: 2,
            cornerRadius: 0
          }
        }
        addElement(elementData)
        setActiveTool('select')
        break

      case 'frame':
        // Frame tool is handled in handleMouseDown when clicking on canvas
        break

      case 'background':
        // Background is handled via the BackgroundPanel, not by clicking
        setActiveTool('select')
        break

      default:
        break
    }
  }, [activeTool, addElement, setActiveTool])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      switch (e.key) {
        case 'Delete':
        case 'Backspace':
          if (selectedElementIds.length > 0) {
            deleteElements(selectedElementIds)
          }
          break
        case 'Escape':
          clearSelection()
          setActiveTool('select')
          break
        case 'a':
        case 'A':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            selectElements(elements.map(el => el.id))
          }
          break
        case '=':
        case '+':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            setZoom(Math.min(5, canvas.zoom * 1.2))
          }
          break
        case '-':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            setZoom(Math.max(0.1, canvas.zoom / 1.2))
          }
          break
        case '0':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            setZoom(1)
            setOffset(0, 0)
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedElementIds, elements, canvas.zoom, deleteElements, clearSelection, setActiveTool, selectElements, setZoom, setOffset])

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    
    const files = Array.from(e.dataTransfer.files)
    const rect = containerRef.current?.getBoundingClientRect()
    
    if (!rect) return

    const dropPos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }

    const canvasPos = screenToCanvas(dropPos.x, dropPos.y, canvas.zoom, canvas.offsetX, canvas.offsetY)

    files.forEach((file, index) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (event) => {
          const src = event.target?.result as string
          if (src) {
            const img = new window.Image()
            img.onload = () => {
              const elementData: Omit<AnyCanvasElement, 'id' | 'zIndex'> = {
                type: 'image',
                x: canvasPos.x + (index * 20),
                y: canvasPos.y + (index * 20),
                width: Math.min(400, img.width),
                height: Math.min(400, img.height * (Math.min(400, img.width) / img.width)),
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                opacity: 1,
                visible: true,
                locked: false,
                style: {},
                data: {
                  src,
                  originalWidth: img.width,
                  originalHeight: img.height,
                  fit: 'contain',
                  filters: {
                    brightness: 100,
                    contrast: 100,
                    saturation: 100,
                    blur: 0,
                    grayscale: 0,
                    sepia: 0
                  }
                }
              }
              addElement(elementData)
            }
            img.src = src
          }
        }
        reader.readAsDataURL(file)
      }
    })
  }, [canvas, addElement])

  // Handle device selection for frame tool
  const handleDeviceSelect = useCallback((device: DeviceSpec) => {
    if (!pendingFramePosition) return

    const containerWidth = stageSize.width
    const containerHeight = stageSize.height
    const optimalSize = getOptimalFrameSize(device, containerWidth, containerHeight)

    const elementData: Omit<AnyCanvasElement, 'id' | 'zIndex'> = {
      type: 'frame',
      x: pendingFramePosition.x - optimalSize.width / 2,
      y: pendingFramePosition.y - optimalSize.height / 2,
      width: optimalSize.width,
      height: optimalSize.height,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
      visible: true,
      locked: false,
      style: {},
      data: {
        src: device.id, // Store device ID instead of src
        frameType: device.category,
        contentId: undefined
      }
    }

    addElement(elementData)
    setShowDeviceSelector(false)
    setPendingFramePosition(null)
    setActiveTool('select')
  }, [pendingFramePosition, stageSize, addElement, setActiveTool])

  // Handle device selector close
  const handleDeviceSelectorClose = useCallback(() => {
    setShowDeviceSelector(false)
    setPendingFramePosition(null)
    setActiveTool('select')
  }, [setActiveTool])

  // Render grid
  const renderGrid = () => {
    if (!canvas.gridEnabled) return null

    const gridLines = []
    const gridSize = canvas.gridSize
    const stageWidth = stageSize.width / canvas.zoom
    const stageHeight = stageSize.height / canvas.zoom
    const offsetX = -canvas.offsetX / canvas.zoom
    const offsetY = -canvas.offsetY / canvas.zoom

    // Vertical lines
    for (let i = Math.floor(offsetX / gridSize) * gridSize; i < offsetX + stageWidth; i += gridSize) {
      gridLines.push(
        <Line
          key={`v-${i}`}
          points={[i, offsetY, i, offsetY + stageHeight]}
          stroke="#e0e0e0"
          strokeWidth={1 / canvas.zoom}
          listening={false}
        />
      )
    }

    // Horizontal lines
    for (let i = Math.floor(offsetY / gridSize) * gridSize; i < offsetY + stageHeight; i += gridSize) {
      gridLines.push(
        <Line
          key={`h-${i}`}
          points={[offsetX, i, offsetX + stageWidth, i]}
          stroke="#e0e0e0"
          strokeWidth={1 / canvas.zoom}
          listening={false}
        />
      )
    }

    return gridLines
  }

  // Sort elements by zIndex for proper rendering order
  const sortedElements = [...elements].sort((a, b) => a.zIndex - b.zIndex)
  const backgroundElement = sortedElements.find(el => el.type === 'background') as BackgroundElement | undefined
  const frameElements = sortedElements.filter(el => el.type === 'frame') as FrameElement[]
  const nonFrameElements = sortedElements.filter(el => el.type !== 'frame' && el.type !== 'background')

  // Load fonts for text elements
  useEffect(() => {
    const textElements = elements.filter(el => el.type === 'text') as TextElement[]
    const uniqueFonts = new Set(textElements.map(el => el.data.fontFamily))
    uniqueFonts.forEach(fontFamily => {
      if (fontFamily && fontFamily !== 'Arial' && fontFamily !== 'Helvetica' && fontFamily !== 'Times New Roman') {
        loadGoogleFont(fontFamily, ['400', '700'])
      }
    })
  }, [elements])

  // Render background
  const renderBackground = () => {
    if (!backgroundElement) {
      return (
        <Rect
          x={0}
          y={0}
          width={canvas.width}
          height={canvas.height}
          fill={canvas.backgroundColor}
          listening={false}
        />
      )
    }

    const { data } = backgroundElement

    if (data.backgroundType === 'color') {
      return (
        <Rect
          x={0}
          y={0}
          width={canvas.width}
          height={canvas.height}
          fill={data.color || canvas.backgroundColor}
          listening={false}
        />
      )
    }

    if (data.backgroundType === 'gradient' && data.gradient) {
      const { gradient } = data
      const stops = gradient.colors
        .sort((a, b) => a.stop - b.stop)
        .map(stop => ({ offset: stop.stop / 100, color: stop.color }))

      if (gradient.type === 'linear') {
        const angle = gradient.angle || 0
        const rad = (angle * Math.PI) / 180
        const x1 = Math.cos(rad + Math.PI) * 0.5 + 0.5
        const y1 = Math.sin(rad + Math.PI) * 0.5 + 0.5
        const x2 = Math.cos(rad) * 0.5 + 0.5
        const y2 = Math.sin(rad) * 0.5 + 0.5

        return (
          <Rect
            x={0}
            y={0}
            width={canvas.width}
            height={canvas.height}
            fillLinearGradientStartPoint={{ x: x1 * canvas.width, y: y1 * canvas.height }}
            fillLinearGradientEndPoint={{ x: x2 * canvas.width, y: y2 * canvas.height }}
            fillLinearGradientColorStops={stops.flatMap(stop => [stop.offset, stop.color])}
            listening={false}
          />
        )
      } else {
        return (
          <Rect
            x={0}
            y={0}
            width={canvas.width}
            height={canvas.height}
            fillRadialGradientStartPoint={{ x: canvas.width / 2, y: canvas.height / 2 }}
            fillRadialGradientEndPoint={{ x: canvas.width / 2, y: canvas.height / 2 }}
            fillRadialGradientStartRadius={0}
            fillRadialGradientEndRadius={Math.max(canvas.width, canvas.height) / 2}
            fillRadialGradientColorStops={stops.flatMap(stop => [stop.offset, stop.color])}
            listening={false}
          />
        )
      }
    }

    // Image background
    if (data.backgroundType === 'image' && data.image) {
      return (
        <ImageBackground 
          src={data.image.src}
          width={canvas.width}
          height={canvas.height}
          fit={data.image.fit}
          opacity={data.image.opacity}
        />
      )
    }

    return null
  }

  // Image background component
  function ImageBackground({ src, width, height, fit, opacity }: any) {
    const [image] = useImage(src, 'anonymous')
    
    if (!image) {
      return (
        <Rect
          x={0}
          y={0}
          width={width}
          height={height}
          fill="#f3f4f6"
          listening={false}
        />
      )
    }

    // Calculate image dimensions based on fit mode
    let imageProps: any = {
      x: 0,
      y: 0,
      width: width,
      height: height,
      opacity: opacity,
      listening: false
    }

    if (fit === 'cover') {
      const scale = Math.max(width / image.width, height / image.height)
      const scaledWidth = image.width * scale
      const scaledHeight = image.height * scale
      imageProps = {
        ...imageProps,
        width: scaledWidth,
        height: scaledHeight,
        x: (width - scaledWidth) / 2,
        y: (height - scaledHeight) / 2
      }
    } else if (fit === 'contain') {
      const scale = Math.min(width / image.width, height / image.height)
      const scaledWidth = image.width * scale
      const scaledHeight = image.height * scale
      imageProps = {
        ...imageProps,
        width: scaledWidth,
        height: scaledHeight,
        x: (width - scaledWidth) / 2,
        y: (height - scaledHeight) / 2
      }
    } else if (fit === 'repeat') {
      // For repeat, we'd need to create a pattern
      // For now, just tile it simply
      return (
        <>
          {Array.from({ length: Math.ceil(width / image.width) * Math.ceil(height / image.height) }).map((_, i) => {
            const col = i % Math.ceil(width / image.width)
            const row = Math.floor(i / Math.ceil(width / image.width))
            return (
              <Image
                key={i}
                image={image}
                x={col * image.width}
                y={row * image.height}
                width={image.width}
                height={image.height}
                opacity={opacity}
                listening={false}
              />
            )
          })}
        </>
      )
    }

    return (
      <Image
        image={image}
        {...imageProps}
      />
    )
  }

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden bg-gray-100 ${className}`}
      style={{ width: '100%', height: '100%', touchAction: 'none' }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        scaleX={canvas.zoom}
        scaleY={canvas.zoom}
        x={canvas.offsetX}
        y={canvas.offsetY}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        draggable={false}
      >
        {/* Background Layer */}
        <Layer>
          <Rect
            x={-canvas.offsetX / canvas.zoom}
            y={-canvas.offsetY / canvas.zoom}
            width={stageSize.width / canvas.zoom + Math.abs(canvas.offsetX / canvas.zoom)}
            height={stageSize.height / canvas.zoom + Math.abs(canvas.offsetY / canvas.zoom)}
            fill="#f3f4f6"
            listening={false}
          />
          {renderBackground()}
        </Layer>

        {/* Grid Layer */}
        <Layer listening={false}>
          {renderGrid()}
        </Layer>

        {/* Main Content Layer */}
        <Layer>
          {/* Render non-frame elements first */}
          {nonFrameElements.map(element => (
            <CanvasElement
              key={element.id}
              element={element}
              isSelected={selectedElementIds.includes(element.id)}
              onSelect={selectElement}
              onUpdate={updateElement}
              snapToGridEnabled={canvas.snapToGrid}
              gridSize={canvas.gridSize}
            />
          ))}

          {/* Render device frames */}
          {frameElements.map(frame => (
            <DeviceFrame
              key={frame.id}
              frame={frame}
            />
          ))}

          {/* Selection rectangle */}
          {isSelecting && (
            <Rect
              x={selectionRect.x}
              y={selectionRect.y}
              width={selectionRect.width}
              height={selectionRect.height}
              fill="rgba(0, 102, 255, 0.1)"
              stroke="#0066ff"
              strokeWidth={1 / canvas.zoom}
              dash={[5 / canvas.zoom, 5 / canvas.zoom]}
              listening={false}
            />
          )}
        </Layer>
      </Stage>

      {/* Canvas Info Overlay */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 text-sm text-gray-600 shadow-sm">
        <div>Zoom: {Math.round(canvas.zoom * 100)}%</div>
        <div>Elements: {elements.length}</div>
        {selectedElementIds.length > 0 && (
          <div>Selected: {selectedElementIds.length}</div>
        )}
      </div>

      {/* Tool Cursor Indicator */}
      {activeTool !== 'select' && (
        <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-sm">
          {activeTool === 'frame' ? 'Click to place device frame' : `${activeTool.charAt(0).toUpperCase() + activeTool.slice(1)} Tool Active`}
        </div>
      )}

      {/* Device Selector Modal */}
      <Modal
        isOpen={showDeviceSelector}
        onClose={handleDeviceSelectorClose}
        title="Select Device Frame"
        size="lg"
      >
        <DeviceSelector
          onDeviceSelect={handleDeviceSelect}
          showCategories={true}
          showPreview={true}
          className="max-h-96 overflow-y-auto"
        />
      </Modal>
    </div>
  )
}