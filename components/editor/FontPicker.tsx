'use client'

import React, { useState, useEffect, useRef } from 'react'
import { 
  ALL_FONTS, 
  FONT_CATEGORIES, 
  loadGoogleFont, 
  getFontsByCategory,
  searchFonts,
  preloadPopularFonts
} from '../../lib/fonts'
import { Search, Check, X } from 'lucide-react'

interface FontPickerProps {
  value: string
  onChange: (font: string) => void
  onClose: () => void
}

export default function FontPicker({ value, onChange, onClose }: FontPickerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [hoveredFont, setHoveredFont] = useState<string | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Preload popular fonts on mount
    preloadPopularFonts()
    
    // Focus search input
    searchInputRef.current?.focus()

    // Handle click outside
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  // Get filtered fonts
  const filteredFonts = searchQuery
    ? searchFonts(searchQuery)
    : getFontsByCategory(selectedCategory)

  // Load font on hover for preview
  const handleFontHover = (fontFamily: string) => {
    setHoveredFont(fontFamily)
    const font = ALL_FONTS.find(f => f.family === fontFamily)
    if (font && font.category !== 'system') {
      loadGoogleFont(fontFamily, ['400', '700'])
    }
  }

  const handleFontSelect = (fontFamily: string) => {
    // Load the font before applying
    const font = ALL_FONTS.find(f => f.family === fontFamily)
    if (font && font.category !== 'system') {
      loadGoogleFont(fontFamily, font.variants)
    }
    onChange(fontFamily)
  }

  return (
    <div 
      ref={containerRef}
      className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
      style={{ maxHeight: '400px', width: '320px' }}
    >
      {/* Header */}
      <div className="p-3 border-b bg-gray-50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-700">Select Font</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search fonts..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Categories */}
      {!searchQuery && (
        <div className="flex gap-1 p-2 border-b overflow-x-auto">
          {FONT_CATEGORIES.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      )}

      {/* Font List */}
      <div className="overflow-y-auto" style={{ maxHeight: '280px' }}>
        {filteredFonts.length > 0 ? (
          <div className="p-2">
            {filteredFonts.map(font => (
              <button
                key={font.family}
                onClick={() => handleFontSelect(font.family)}
                onMouseEnter={() => handleFontHover(font.family)}
                onMouseLeave={() => setHoveredFont(null)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors ${
                  value === font.family
                    ? 'bg-blue-50 text-blue-700'
                    : 'hover:bg-gray-100'
                }`}
              >
                <div className="flex flex-col items-start">
                  <span 
                    className="text-sm font-medium"
                    style={{ 
                      fontFamily: hoveredFont === font.family || value === font.family 
                        ? `'${font.family}', ${font.category}` 
                        : 'inherit' 
                    }}
                  >
                    {font.family}
                  </span>
                  <span className="text-xs text-gray-500">
                    {font.category}
                  </span>
                </div>
                {value === font.family && (
                  <Check className="h-4 w-4 text-blue-600" />
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <p className="text-sm">No fonts found</p>
            <p className="text-xs mt-1">Try a different search term</p>
          </div>
        )}
      </div>

      {/* Preview */}
      {hoveredFont && (
        <div className="p-3 border-t bg-gray-50">
          <p className="text-xs text-gray-600 mb-1">Preview:</p>
          <p 
            className="text-lg"
            style={{ fontFamily: `'${hoveredFont}', ${ALL_FONTS.find(f => f.family === hoveredFont)?.category || 'sans-serif'}` }}
          >
            The quick brown fox jumps over the lazy dog
          </p>
        </div>
      )}
    </div>
  )
}