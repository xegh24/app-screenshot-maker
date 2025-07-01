'use client'

import React, { useEffect, useState } from 'react'
import { useEditorStore } from '../../store/editor'
import { TextElement } from '../../store/editor'
import FontPicker from './FontPicker'
import ColorPicker from './ColorPicker'
import { 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  Bold,
  Italic,
  Underline,
  Type,
  Minus,
  Plus
} from 'lucide-react'

export default function TextEditor() {
  const { selectedElementIds, elements, updateElement, addElement, setActiveTool } = useEditorStore()
  const [localText, setLocalText] = useState('')
  const [showFontPicker, setShowFontPicker] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)

  // Get selected text element
  const selectedElement = elements.find(
    el => el.type === 'text' && selectedElementIds.includes(el.id)
  ) as TextElement | undefined

  useEffect(() => {
    if (selectedElement) {
      setLocalText(selectedElement.data.text)
    }
  }, [selectedElement])

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value
    setLocalText(newText)
    
    if (selectedElement) {
      updateElement(selectedElement.id, {
        data: {
          ...selectedElement.data,
          text: newText
        }
      })
    }
  }

  const handleAddText = () => {
    setActiveTool('text')
    const newTextElement: Omit<TextElement, 'id' | 'zIndex'> = {
      type: 'text',
      x: 100,
      y: 100,
      width: 200,
      height: 50,
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
        lineHeight: 1.5,
        letterSpacing: 0
      }
    }
    addElement(newTextElement)
  }

  const updateTextProperty = (property: keyof TextElement['data'], value: any) => {
    if (selectedElement) {
      updateElement(selectedElement.id, {
        data: {
          ...selectedElement.data,
          [property]: value
        }
      })
    }
  }

  const toggleFontStyle = (style: 'bold' | 'italic' | 'underline') => {
    if (!selectedElement) return
    
    let fontWeight = selectedElement.data.fontWeight
    let fontStyle = selectedElement.data.fontStyle
    let textDecoration = selectedElement.data.textDecoration

    switch (style) {
      case 'bold':
        fontWeight = fontWeight === 'bold' ? 'normal' : 'bold'
        break
      case 'italic':
        fontStyle = fontStyle === 'italic' ? 'normal' : 'italic'
        break
      case 'underline':
        textDecoration = textDecoration === 'underline' ? 'none' : 'underline'
        break
    }

    updateElement(selectedElement.id, {
      data: {
        ...selectedElement.data,
        fontWeight,
        fontStyle,
        textDecoration
      }
    })
  }

  const adjustFontSize = (increment: number) => {
    if (selectedElement) {
      const newSize = Math.max(8, Math.min(200, selectedElement.data.fontSize + increment))
      updateTextProperty('fontSize', newSize)
    }
  }

  return (
    <div className="p-4 border-b space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">Text Editor</h3>
        {!selectedElement && (
          <button
            onClick={handleAddText}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Type className="h-4 w-4" />
            Add Text
          </button>
        )}
      </div>

      {selectedElement ? (
        <>
          {/* Text Input */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Text Content
            </label>
            <textarea
              value={localText}
              onChange={handleTextChange}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
              placeholder="Enter your text..."
            />
          </div>

          {/* Font Controls */}
          <div className="space-y-3">
            {/* Font Family */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Font
              </label>
              <div className="relative">
                <button
                  onClick={() => setShowFontPicker(!showFontPicker)}
                  className="w-full px-3 py-2 text-sm text-left border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{ fontFamily: selectedElement.data.fontFamily }}
                >
                  {selectedElement.data.fontFamily}
                </button>
                {showFontPicker && (
                  <div className="absolute top-full left-0 right-0 mt-1 z-10">
                    <FontPicker
                      value={selectedElement.data.fontFamily}
                      onChange={(font) => {
                        updateTextProperty('fontFamily', font)
                        setShowFontPicker(false)
                      }}
                      onClose={() => setShowFontPicker(false)}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Font Size and Style */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => adjustFontSize(-2)}
                  className="p-1 hover:bg-gray-100 rounded"
                  title="Decrease font size"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <input
                  type="number"
                  value={selectedElement.data.fontSize}
                  onChange={(e) => updateTextProperty('fontSize', parseInt(e.target.value) || 16)}
                  className="w-16 px-2 py-1 text-sm text-center border border-gray-300 rounded"
                  min="8"
                  max="200"
                />
                <button
                  onClick={() => adjustFontSize(2)}
                  className="p-1 hover:bg-gray-100 rounded"
                  title="Increase font size"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center gap-1 ml-2">
                <button
                  onClick={() => toggleFontStyle('bold')}
                  className={`p-1.5 rounded hover:bg-gray-100 ${
                    selectedElement.data.fontWeight === 'bold' ? 'bg-gray-200' : ''
                  }`}
                  title="Bold"
                >
                  <Bold className="h-4 w-4" />
                </button>
                <button
                  onClick={() => toggleFontStyle('italic')}
                  className={`p-1.5 rounded hover:bg-gray-100 ${
                    selectedElement.data.fontStyle === 'italic' ? 'bg-gray-200' : ''
                  }`}
                  title="Italic"
                >
                  <Italic className="h-4 w-4" />
                </button>
                <button
                  onClick={() => toggleFontStyle('underline')}
                  className={`p-1.5 rounded hover:bg-gray-100 ${
                    selectedElement.data.textDecoration === 'underline' ? 'bg-gray-200' : ''
                  }`}
                  title="Underline"
                >
                  <Underline className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Text Alignment */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Alignment
              </label>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => updateTextProperty('textAlign', 'left')}
                  className={`p-1.5 rounded hover:bg-gray-100 ${
                    selectedElement.data.textAlign === 'left' ? 'bg-gray-200' : ''
                  }`}
                  title="Align left"
                >
                  <AlignLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => updateTextProperty('textAlign', 'center')}
                  className={`p-1.5 rounded hover:bg-gray-100 ${
                    selectedElement.data.textAlign === 'center' ? 'bg-gray-200' : ''
                  }`}
                  title="Align center"
                >
                  <AlignCenter className="h-4 w-4" />
                </button>
                <button
                  onClick={() => updateTextProperty('textAlign', 'right')}
                  className={`p-1.5 rounded hover:bg-gray-100 ${
                    selectedElement.data.textAlign === 'right' ? 'bg-gray-200' : ''
                  }`}
                  title="Align right"
                >
                  <AlignRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => updateTextProperty('textAlign', 'justify')}
                  className={`p-1.5 rounded hover:bg-gray-100 ${
                    selectedElement.data.textAlign === 'justify' ? 'bg-gray-200' : ''
                  }`}
                  title="Justify"
                >
                  <AlignJustify className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Text Color */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Color
              </label>
              <div className="relative">
                <button
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="flex items-center gap-2 px-3 py-2 w-full border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <div
                    className="w-5 h-5 rounded border border-gray-300"
                    style={{ backgroundColor: selectedElement.data.color }}
                  />
                  <span className="text-sm">{selectedElement.data.color}</span>
                </button>
                {showColorPicker && (
                  <div className="absolute top-full left-0 right-0 mt-1 z-10">
                    <ColorPicker
                      color={selectedElement.data.color}
                      onChange={(color) => updateTextProperty('color', color)}
                      onClose={() => setShowColorPicker(false)}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Line Height and Letter Spacing */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Line Height
                </label>
                <input
                  type="number"
                  value={selectedElement.data.lineHeight}
                  onChange={(e) => updateTextProperty('lineHeight', parseFloat(e.target.value) || 1.5)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  min="0.5"
                  max="3"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Letter Spacing
                </label>
                <input
                  type="number"
                  value={selectedElement.data.letterSpacing}
                  onChange={(e) => updateTextProperty('letterSpacing', parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  min="-5"
                  max="10"
                  step="0.1"
                />
              </div>
            </div>
          </div>
        </>
      ) : (
        <p className="text-sm text-gray-500 text-center py-4">
          Add a text element or select an existing one to edit
        </p>
      )}
    </div>
  )
}