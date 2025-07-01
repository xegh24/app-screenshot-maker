'use client'

import React, { useRef, useEffect, useState } from 'react'
import { Group, Text, Image, Rect, Circle, RegularPolygon, Transformer } from 'react-konva'
import Konva from 'konva'
import useImage from 'use-image'
import type { 
  AnyCanvasElement, 
  TextElement, 
  ImageElement, 
  ShapeElement, 
  FrameElement, 
  BackgroundElement 
} from '../../store/editor'
import { useEditorStore } from '../../store/editor'
import { snapToGrid } from '../../lib/canvas/utils'

interface CanvasElementProps {
  element: AnyCanvasElement
  isSelected: boolean
  onSelect: (id: string) => void
  onUpdate: (id: string, updates: Partial<AnyCanvasElement>) => void
  snapToGridEnabled?: boolean
  gridSize?: number
}

export default function CanvasElement({
  element,
  isSelected,
  onSelect,
  onUpdate,
  snapToGridEnabled = false,
  gridSize = 20
}: CanvasElementProps) {
  const groupRef = useRef<Konva.Group>(null)
  const transformerRef = useRef<Konva.Transformer>(null)
  const [isEditingText, setIsEditingText] = useState(false)
  
  // Handle transformer attachment
  useEffect(() => {
    if (isSelected && transformerRef.current && groupRef.current) {
      transformerRef.current.nodes([groupRef.current])
      transformerRef.current.getLayer()?.batchDraw()
    }
  }, [isSelected])

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    const node = e.target
    let newX = node.x()
    let newY = node.y()
    
    if (snapToGridEnabled) {
      newX = snapToGrid(newX, gridSize)
      newY = snapToGrid(newY, gridSize)
      node.position({ x: newX, y: newY })
    }
    
    onUpdate(element.id, { x: newX, y: newY })
  }

  const handleTransformEnd = () => {
    const node = groupRef.current
    if (!node) return

    const scaleX = node.scaleX()
    const scaleY = node.scaleY()
    const rotation = node.rotation()
    
    // Reset scale and apply to element dimensions
    node.scaleX(1)
    node.scaleY(1)
    
    let newWidth = Math.max(5, element.width * scaleX)
    let newHeight = Math.max(5, element.height * scaleY)
    
    if (snapToGridEnabled) {
      newWidth = snapToGrid(newWidth, gridSize)
      newHeight = snapToGrid(newHeight, gridSize)
    }
    
    onUpdate(element.id, {
      width: newWidth,
      height: newHeight,
      rotation: rotation,
      scaleX: 1,
      scaleY: 1
    })
  }

  const handleClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true
    onSelect(element.id)
  }

  const handleDoubleClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true
    // Handle double-click for text editing
    if (element.type === 'text') {
      setIsEditingText(true)
    }
  }

  const handleTextEditEnd = (newText: string) => {
    if (element.type === 'text') {
      onUpdate(element.id, {
        data: {
          ...element.data,
          text: newText
        }
      })
    }
    setIsEditingText(false)
  }

  const commonProps = {
    x: element.x,
    y: element.y,
    width: element.width,
    height: element.height,
    rotation: element.rotation,
    scaleX: element.scaleX,
    scaleY: element.scaleY,
    opacity: element.opacity,
    visible: element.visible,
    draggable: !element.locked,
    onClick: handleClick,
    onDblClick: handleDoubleClick,
    onDragEnd: handleDragEnd,
    onTransformEnd: handleTransformEnd,
    id: element.id
  }

  const renderElement = () => {
    switch (element.type) {
      case 'text':
        return (
          <TextElementRenderer 
            element={element as TextElement} 
            {...commonProps} 
            isEditing={isEditingText}
            onEditEnd={handleTextEditEnd}
          />
        )
      case 'image':
        return <ImageElementRenderer element={element as ImageElement} {...commonProps} />
      case 'shape':
        return <ShapeElementRenderer element={element as ShapeElement} {...commonProps} />
      case 'frame':
        return <FrameElementRenderer element={element as FrameElement} {...commonProps} />
      case 'background':
        return <BackgroundElementRenderer element={element as BackgroundElement} {...commonProps} />
      default:
        return null
    }
  }

  return (
    <>
      <Group
        ref={groupRef}
        {...commonProps}
      >
        {renderElement()}
      </Group>
      {isSelected && !element.locked && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            // Limit resize
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox
            }
            return newBox
          }}
          enabledAnchors={[
            'top-left',
            'top-center',
            'top-right',
            'middle-right',
            'bottom-right',
            'bottom-center',
            'bottom-left',
            'middle-left'
          ]}
          rotateEnabled={true}
          borderEnabled={true}
          anchorSize={8}
          anchorCornerRadius={2}
          borderStroke="#0066ff"
          anchorStroke="#0066ff"
          anchorFill="white"
        />
      )}
    </>
  )
}

// Text Element Renderer
function TextElementRenderer({ 
  element, 
  isEditing = false,
  onEditEnd,
  ...props 
}: { 
  element: TextElement
  isEditing?: boolean
  onEditEnd?: (text: string) => void
} & any) {
  const textRef = useRef<Konva.Text>(null)
  const [editingText, setEditingText] = useState(element.data.text)

  useEffect(() => {
    if (isEditing && textRef.current) {
      const textNode = textRef.current
      const stage = textNode.getStage()
      if (!stage) return

      // Create textarea for editing
      const textPosition = textNode.getAbsolutePosition()
      const stageBox = stage.container().getBoundingClientRect()
      const areaPosition = {
        x: stageBox.left + textPosition.x,
        y: stageBox.top + textPosition.y,
      }

      const textarea = document.createElement('textarea')
      document.body.appendChild(textarea)

      textarea.value = element.data.text
      textarea.style.position = 'absolute'
      textarea.style.top = `${areaPosition.y}px`
      textarea.style.left = `${areaPosition.x}px`
      textarea.style.width = `${textNode.width() - textNode.padding() * 2}px`
      textarea.style.height = `${textNode.height() - textNode.padding() * 2}px`
      textarea.style.fontSize = `${element.data.fontSize}px`
      textarea.style.fontFamily = element.data.fontFamily
      textarea.style.fontWeight = element.data.fontWeight
      textarea.style.fontStyle = element.data.fontStyle
      textarea.style.color = element.data.color
      textarea.style.lineHeight = `${element.data.lineHeight}`
      textarea.style.letterSpacing = `${element.data.letterSpacing}px`
      textarea.style.border = 'none'
      textarea.style.padding = '0px'
      textarea.style.margin = '0px'
      textarea.style.overflow = 'hidden'
      textarea.style.background = 'none'
      textarea.style.outline = 'none'
      textarea.style.resize = 'none'
      textarea.style.transformOrigin = 'left top'
      textarea.style.textAlign = element.data.textAlign
      textarea.style.zIndex = '1000'

      const rotation = textNode.rotation()
      let transform = ''
      if (rotation) {
        transform += `rotateZ(${rotation}deg)`
      }
      const scale = textNode.getAbsoluteScale()
      if (scale) {
        transform += ` scaleX(${scale.x}) scaleY(${scale.y})`
      }
      textarea.style.transform = transform

      textarea.focus()
      textarea.select()

      function removeTextarea() {
        if (document.body.contains(textarea)) {
          textarea.parentNode?.removeChild(textarea)
          window.removeEventListener('click', handleOutsideClick)
        }
      }

      function handleOutsideClick(e: MouseEvent) {
        if (e.target !== textarea) {
          if (onEditEnd) {
            onEditEnd(textarea.value)
          }
          removeTextarea()
        }
      }

      textarea.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          if (onEditEnd) {
            onEditEnd(textarea.value)
          }
          removeTextarea()
        }
        if (e.key === 'Escape') {
          removeTextarea()
        }
      })

      textarea.addEventListener('input', () => {
        setEditingText(textarea.value)
      })

      setTimeout(() => {
        window.addEventListener('click', handleOutsideClick)
      }, 100)

      // Hide the original text while editing
      textNode.hide()
      textNode.getLayer()?.batchDraw()

      return () => {
        removeTextarea()
        textNode.show()
        textNode.getLayer()?.batchDraw()
      }
    }
  }, [isEditing, element.data, onEditEnd])

  return (
    <Text
      ref={textRef}
      {...props}
      text={isEditing ? editingText : element.data.text}
      fontSize={element.data.fontSize}
      fontFamily={element.data.fontFamily}
      fontStyle={`${element.data.fontStyle} ${element.data.fontWeight}`}
      fill={element.data.color}
      align={element.data.textAlign as any}
      textDecoration={element.data.textDecoration}
      lineHeight={element.data.lineHeight}
      letterSpacing={element.data.letterSpacing}
      wrap="word"
      padding={5}
    />
  )
}

// Image Element Renderer
function ImageElementRenderer({ element, ...props }: { element: ImageElement } & any) {
  const [image] = useImage(element.data.src, 'anonymous')
  const [filters, setFilters] = useState<Konva.Filter[]>([])

  useEffect(() => {
    const imageFilters: Konva.Filter[] = []
    
    if (element.data.filters.brightness !== 100) {
      imageFilters.push(Konva.Filters.Brighten)
    }
    if (element.data.filters.contrast !== 100) {
      imageFilters.push(Konva.Filters.Contrast)
    }
    if (element.data.filters.blur > 0) {
      imageFilters.push(Konva.Filters.Blur)
    }
    if (element.data.filters.grayscale > 0) {
      imageFilters.push(Konva.Filters.Grayscale)
    }
    if (element.data.filters.sepia > 0) {
      imageFilters.push(Konva.Filters.Sepia)
    }
    
    setFilters(imageFilters)
  }, [element.data.filters])

  if (!image) {
    // Loading placeholder
    return (
      <Rect
        {...props}
        fill="#f0f0f0"
        stroke="#ddd"
        strokeWidth={1}
      />
    )
  }

  // Calculate image position and size based on fit mode
  const getImageProps = () => {
    const { fit } = element.data
    const imageRatio = image.width / image.height
    const elementRatio = element.width / element.height

    switch (fit) {
      case 'cover': {
        let scale: number
        let offsetX = 0
        let offsetY = 0

        if (imageRatio > elementRatio) {
          scale = element.height / image.height
          offsetX = (element.width - image.width * scale) / 2
        } else {
          scale = element.width / image.width
          offsetY = (element.height - image.height * scale) / 2
        }

        return {
          image,
          width: image.width * scale,
          height: image.height * scale,
          offsetX,
          offsetY,
          crop: {
            x: Math.max(0, -offsetX / scale),
            y: Math.max(0, -offsetY / scale),
            width: Math.min(image.width, element.width / scale),
            height: Math.min(image.height, element.height / scale)
          }
        }
      }
      case 'contain': {
        let scale: number
        let offsetX = 0
        let offsetY = 0

        if (imageRatio > elementRatio) {
          scale = element.width / image.width
          offsetY = (element.height - image.height * scale) / 2
        } else {
          scale = element.height / image.height
          offsetX = (element.width - image.width * scale) / 2
        }

        return {
          image,
          width: image.width * scale,
          height: image.height * scale,
          offsetX,
          offsetY
        }
      }
      case 'fill':
      case 'stretch':
      default:
        return {
          image,
          width: element.width,
          height: element.height,
          offsetX: 0,
          offsetY: 0
        }
    }
  }

  const imageProps = getImageProps()

  return (
    <Image
      {...props}
      {...imageProps}
      filters={filters}
      brightness={element.data.filters.brightness / 100 - 1}
      contrast={element.data.filters.contrast / 100}
      blurRadius={element.data.filters.blur}
      saturation={element.data.filters.saturation / 100 - 1}
    />
  )
}

// Shape Element Renderer
function ShapeElementRenderer({ element, ...props }: { element: ShapeElement } & any) {
  const { shape, fill, stroke, strokeWidth, cornerRadius, sides } = element.data

  switch (shape) {
    case 'rectangle':
      return (
        <Rect
          {...props}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          cornerRadius={cornerRadius || 0}
        />
      )
    case 'circle':
      return (
        <Circle
          {...props}
          radius={Math.min(element.width, element.height) / 2}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          offsetX={-element.width / 2}
          offsetY={-element.height / 2}
        />
      )
    case 'triangle':
      return (
        <RegularPolygon
          {...props}
          sides={3}
          radius={Math.min(element.width, element.height) / 2}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          offsetX={-element.width / 2}
          offsetY={-element.height / 2}
        />
      )
    case 'polygon':
      return (
        <RegularPolygon
          {...props}
          sides={sides || 6}
          radius={Math.min(element.width, element.height) / 2}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          offsetX={-element.width / 2}
          offsetY={-element.height / 2}
        />
      )
    default:
      return null
  }
}

// Frame Element Renderer
function FrameElementRenderer({ element, ...props }: { element: FrameElement } & any) {
  const [frameImage] = useImage(element.data.src, 'anonymous')

  if (!frameImage) {
    return (
      <Rect
        {...props}
        fill="transparent"
        stroke="#ddd"
        strokeWidth={2}
        dash={[5, 5]}
      />
    )
  }

  return (
    <Image
      {...props}
      image={frameImage}
    />
  )
}

// Background Element Renderer
function BackgroundElementRenderer({ element, ...props }: { element: BackgroundElement } & any) {
  const { backgroundType, color, gradient, image: bgImage } = element.data
  const [backgroundImage] = useImage(bgImage?.src || '', 'anonymous')

  switch (backgroundType) {
    case 'color':
      return (
        <Rect
          {...props}
          fill={color}
        />
      )
    case 'gradient':
      // For gradient backgrounds, we'd need to create a pattern or use canvas gradient
      // This is a simplified implementation
      return (
        <Rect
          {...props}
          fillLinearGradientStartPoint={{ x: 0, y: 0 }}
          fillLinearGradientEndPoint={{ x: element.width, y: element.height }}
          fillLinearGradientColorStops={
            gradient?.colors.flatMap(c => [c.stop, c.color]) || [0, '#ffffff', 1, '#000000']
          }
        />
      )
    case 'image':
      if (!backgroundImage || !bgImage) {
        return (
          <Rect
            {...props}
            fill="#f0f0f0"
          />
        )
      }
      
      return (
        <Image
          {...props}
          image={backgroundImage}
          opacity={bgImage.opacity}
        />
      )
    default:
      return null
  }
}