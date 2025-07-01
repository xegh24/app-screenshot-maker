'use client'

import React from 'react'
import { CheckCircle, AlertCircle, Clock, Loader2 } from 'lucide-react'

export interface ProgressItem {
  id: string
  label: string
  status: 'pending' | 'processing' | 'completed' | 'error'
  progress?: number
  error?: string
  size?: number
}

interface ProgressBarProps {
  items: ProgressItem[]
  title?: string
  showDetails?: boolean
  className?: string
}

export function ProgressBar({ 
  items, 
  title = "Progress", 
  showDetails = true,
  className = "" 
}: ProgressBarProps) {
  const totalItems = items.length
  const completedItems = items.filter(item => item.status === 'completed').length
  const errorItems = items.filter(item => item.status === 'error').length
  const overallProgress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0

  const getStatusIcon = (status: ProgressItem['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-gray-400" />
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusColor = (status: ProgressItem['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-600'
      case 'processing':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'error':
        return 'bg-red-50 text-red-700 border-red-200'
    }
  }

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return ''
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="text-sm text-gray-500">
          {completedItems}/{totalItems} completed
          {errorItems > 0 && (
            <span className="text-red-500 ml-2">({errorItems} failed)</span>
          )}
        </div>
      </div>

      {/* Overall Progress Bar */}
      <div className="space-y-2">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              errorItems > 0 ? 'bg-red-500' : 'bg-blue-500'
            }`}
            style={{ width: `${overallProgress}%` }}
          />
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>{Math.round(overallProgress)}% complete</span>
          {totalItems > 0 && (
            <span>
              {items.filter(item => item.status === 'processing').length > 0 
                ? 'Processing...' 
                : completedItems === totalItems 
                  ? 'All done!' 
                  : `${totalItems - completedItems} remaining`
              }
            </span>
          )}
        </div>
      </div>

      {/* Detailed Progress Items */}
      {showDetails && items.length > 0 && (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {items.map((item) => (
            <div
              key={item.id}
              className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${getStatusColor(item.status)}`}
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                {getStatusIcon(item.status)}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {item.label}
                  </div>
                  {item.error && (
                    <div className="text-xs text-red-600 mt-1">
                      {item.error}
                    </div>
                  )}
                  {item.status === 'processing' && item.progress !== undefined && (
                    <div className="mt-1">
                      <div className="w-full bg-white bg-opacity-50 rounded-full h-1">
                        <div 
                          className="h-1 bg-current rounded-full transition-all duration-300"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* File size display */}
              {item.size && item.status === 'completed' && (
                <div className="text-xs text-gray-500 ml-2">
                  {formatFileSize(item.size)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {items.length > 0 && (
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <div className="flex space-x-4 text-sm">
            {completedItems > 0 && (
              <div className="flex items-center text-green-600">
                <CheckCircle className="h-4 w-4 mr-1" />
                {completedItems} completed
              </div>
            )}
            {errorItems > 0 && (
              <div className="flex items-center text-red-600">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errorItems} failed
              </div>
            )}
            {items.filter(item => item.status === 'processing').length > 0 && (
              <div className="flex items-center text-blue-600">
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Processing...
              </div>
            )}
          </div>
          
          {/* Total file size */}
          {completedItems > 0 && (
            <div className="text-sm text-gray-500">
              Total size: {formatFileSize(
                items
                  .filter(item => item.status === 'completed' && item.size)
                  .reduce((total, item) => total + (item.size || 0), 0)
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Simple linear progress bar component
export function SimpleProgressBar({ 
  value, 
  max = 100, 
  className = "",
  label,
  showValue = true,
  color = "blue"
}: {
  value: number
  max?: number
  className?: string
  label?: string
  showValue?: boolean
  color?: 'blue' | 'green' | 'red' | 'yellow'
}) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
  
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500'
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {(label || showValue) && (
        <div className="flex justify-between text-sm text-gray-600">
          {label && <span>{label}</span>}
          {showValue && <span>{Math.round(percentage)}%</span>}
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${colorClasses[color]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

// Circular progress component
export function CircularProgress({ 
  value, 
  max = 100, 
  size = 64,
  strokeWidth = 4,
  className = "",
  color = "blue",
  showValue = true
}: {
  value: number
  max?: number
  size?: number
  strokeWidth?: number
  className?: string
  color?: 'blue' | 'green' | 'red' | 'yellow'
  showValue?: boolean
}) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  const colorClasses = {
    blue: 'stroke-blue-500',
    green: 'stroke-green-500',
    red: 'stroke-red-500',
    yellow: 'stroke-yellow-500'
  }

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-200"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={`transition-all duration-300 ${colorClasses[color]}`}
        />
      </svg>
      {showValue && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-medium text-gray-900">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
    </div>
  )
}

export default ProgressBar