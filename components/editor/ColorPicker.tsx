'use client'

import React, { useState, useRef, useEffect } from 'react'
import { X, Pipette } from 'lucide-react'

interface ColorPickerProps {
  color: string
  onChange: (color: string) => void
  onClose: () => void
  showAlpha?: boolean
}

export default function ColorPicker({ 
  color = '#000000', 
  onChange, 
  onClose,
  showAlpha = false 
}: ColorPickerProps) {
  const [hue, setHue] = useState(0)
  const [saturation, setSaturation] = useState(100)
  const [lightness, setLightness] = useState(50)
  const [alpha, setAlpha] = useState(1)
  const [hexInput, setHexInput] = useState(color)
  
  const containerRef = useRef<HTMLDivElement>(null)
  const saturationRef = useRef<HTMLDivElement>(null)

  // Convert hex to HSL
  useEffect(() => {
    const rgb = hexToRgb(color)
    if (rgb) {
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
      setHue(hsl.h)
      setSaturation(hsl.s)
      setLightness(hsl.l)
      setHexInput(color)
    }
  }, [color])

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        }
      : null
  }

  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255
    g /= 255
    b /= 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0
    let s = 0
    const l = (max + min) / 2

    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6
          break
        case g:
          h = ((b - r) / d + 2) / 6
          break
        case b:
          h = ((r - g) / d + 4) / 6
          break
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    }
  }

  const hslToRgb = (h: number, s: number, l: number) => {
    h = h / 360
    s = s / 100
    l = l / 100

    let r, g, b

    if (s === 0) {
      r = g = b = l
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1
        if (t > 1) t -= 1
        if (t < 1 / 6) return p + (q - p) * 6 * t
        if (t < 1 / 2) return q
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
        return p
      }

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s
      const p = 2 * l - q
      r = hue2rgb(p, q, h + 1 / 3)
      g = hue2rgb(p, q, h)
      b = hue2rgb(p, q, h - 1 / 3)
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    }
  }

  const rgbToHex = (r: number, g: number, b: number) => {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16)
      return hex.length === 1 ? '0' + hex : hex
    }).join('')
  }

  const updateColor = (h?: number, s?: number, l?: number, a?: number) => {
    const newHue = h !== undefined ? h : hue
    const newSaturation = s !== undefined ? s : saturation
    const newLightness = l !== undefined ? l : lightness
    const newAlpha = a !== undefined ? a : alpha

    setHue(newHue)
    setSaturation(newSaturation)
    setLightness(newLightness)
    setAlpha(newAlpha)

    const rgb = hslToRgb(newHue, newSaturation, newLightness)
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b)
    setHexInput(hex)
    onChange(hex)
  }

  const handleSaturationLightnessChange = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!saturationRef.current) return

    const rect = saturationRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
    const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height))

    const newSaturation = Math.round((x / rect.width) * 100)
    const newLightness = Math.round((1 - y / rect.height) * 100)

    updateColor(undefined, newSaturation, newLightness)
  }

  const handleHexInput = (value: string) => {
    setHexInput(value)
    if (/^#[0-9A-F]{6}$/i.test(value)) {
      const rgb = hexToRgb(value)
      if (rgb) {
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
        setHue(hsl.h)
        setSaturation(hsl.s)
        setLightness(hsl.l)
        onChange(value)
      }
    }
  }

  const presetColors = [
    '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00',
    '#ff00ff', '#00ffff', '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24',
    '#f0932b', '#eb4d4b', '#6ab04c', '#130f40', '#535c68', '#95afc0'
  ]

  return (
    <div 
      ref={containerRef}
      className="bg-white border border-gray-200 rounded-lg shadow-lg p-4"
      style={{ width: '280px' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-700">Color Picker</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <X className="h-4 w-4 text-gray-500" />
        </button>
      </div>

      {/* Saturation/Lightness Picker */}
      <div
        ref={saturationRef}
        className="relative w-full h-40 rounded-md cursor-crosshair mb-3"
        style={{
          background: `linear-gradient(to right, hsl(${hue}, 0%, 50%), hsl(${hue}, 100%, 50%))`,
          backgroundImage: `
            linear-gradient(to bottom, transparent, black),
            linear-gradient(to right, white, hsl(${hue}, 100%, 50%))
          `
        }}
        onClick={handleSaturationLightnessChange}
        onMouseMove={(e) => {
          if (e.buttons === 1) {
            handleSaturationLightnessChange(e)
          }
        }}
      >
        <div
          className="absolute w-3 h-3 border-2 border-white rounded-full shadow-md pointer-events-none"
          style={{
            left: `${saturation}%`,
            top: `${100 - lightness}%`,
            transform: 'translate(-50%, -50%)',
            backgroundColor: (() => {
              const rgb = hslToRgb(hue, saturation, lightness)
              return rgbToHex(rgb.r, rgb.g, rgb.b)
            })()
          }}
        />
      </div>

      {/* Hue Slider */}
      <div className="mb-3">
        <input
          type="range"
          min="0"
          max="360"
          value={hue}
          onChange={(e) => updateColor(parseInt(e.target.value))}
          className="w-full h-3 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, 
              hsl(0, 100%, 50%), 
              hsl(60, 100%, 50%), 
              hsl(120, 100%, 50%), 
              hsl(180, 100%, 50%), 
              hsl(240, 100%, 50%), 
              hsl(300, 100%, 50%), 
              hsl(360, 100%, 50%)
            )`
          }}
        />
      </div>

      {/* Alpha Slider */}
      {showAlpha && (
        <div className="mb-3">
          <input
            type="range"
            min="0"
            max="100"
            value={alpha * 100}
            onChange={(e) => updateColor(undefined, undefined, undefined, parseInt(e.target.value) / 100)}
            className="w-full h-3 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, 
                transparent, 
                ${(() => {
                  const rgb = hslToRgb(hue, saturation, lightness)
                  return rgbToHex(rgb.r, rgb.g, rgb.b)
                })()})`
            }}
          />
        </div>
      )}

      {/* Hex Input and Current Color */}
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-12 h-12 rounded-md border border-gray-300"
          style={{ backgroundColor: hexInput }}
        />
        <div className="flex-1">
          <input
            type="text"
            value={hexInput}
            onChange={(e) => handleHexInput(e.target.value.toUpperCase())}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="#000000"
          />
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-md" title="Pick color">
          <Pipette className="h-4 w-4 text-gray-600" />
        </button>
      </div>

      {/* Preset Colors */}
      <div className="grid grid-cols-9 gap-1">
        {presetColors.map(presetColor => (
          <button
            key={presetColor}
            onClick={() => {
              handleHexInput(presetColor.toUpperCase())
            }}
            className="w-full aspect-square rounded border border-gray-200 hover:scale-110 transition-transform"
            style={{ backgroundColor: presetColor }}
            title={presetColor}
          />
        ))}
      </div>
    </div>
  )
}