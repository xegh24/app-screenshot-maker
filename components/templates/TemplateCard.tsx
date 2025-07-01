'use client'

import React from 'react'
import { TemplateWithCanvas } from '../../store/templates'
import { Star, Eye, Download, Clock, Tag, User } from 'lucide-react'

interface TemplateCardProps {
  template: TemplateWithCanvas
  viewMode?: 'grid' | 'list'
  onClick?: () => void
  showAuthor?: boolean
  showUsageCount?: boolean
}

export const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  viewMode = 'grid',
  onClick,
  showAuthor = true,
  showUsageCount = true
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getCategoryIcon = (category: string) => {
    const icons = {
      'education': '🎓',
      'food': '🍕',
      'e-commerce': '🛒',
      'mobile-app': '📱',
      'web-app': '💻',
      'social-media': '📱',
      'presentation': '📊',
      'marketing': '📢',
      'portfolio': '👤',
      'blog': '📝',
      'dashboard': '📈',
      'landing-page': '🌐',
      'other': '📄'
    }
    return icons[category as keyof typeof icons] || '📄'
  }

  const getCategoryName = (category: string) => {
    const names = {
      'education': 'Education',
      'food': 'Food & Dining',
      'e-commerce': 'E-commerce',
      'mobile-app': 'Mobile App',
      'web-app': 'Web App',
      'social-media': 'Social Media',
      'presentation': 'Presentation',
      'marketing': 'Marketing',
      'portfolio': 'Portfolio',
      'blog': 'Blog',
      'dashboard': 'Dashboard',
      'landing-page': 'Landing Page',
      'other': 'Other'
    }
    return names[category as keyof typeof names] || 'Other'
  }

  if (viewMode === 'list') {
    return (
      <div
        onClick={onClick}
        className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer group"
      >
        {/* Template Preview */}
        <div className="flex-shrink-0">
          <div className="w-24 h-16 bg-gray-100 rounded-lg overflow-hidden relative">
            {template.preview_url ? (
              <img
                src={template.preview_url}
                alt={template.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <span className="text-2xl">{getCategoryIcon(template.category)}</span>
              </div>
            )}
            {template.is_featured && (
              <div className="absolute top-1 right-1">
                <Star className="w-3 h-3 text-yellow-500 fill-current" />
              </div>
            )}
          </div>
        </div>

        {/* Template Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-blue-600">
                {template.name}
              </h3>
              {template.description && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {template.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Tag className="w-4 h-4" />
              <span>{getCategoryName(template.category)}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{formatDate(template.created_at)}</span>
            </div>

            {showAuthor && template.created_by && (
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>By User</span>
              </div>
            )}

            {showUsageCount && (
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>0 uses</span>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
    >
      {/* Template Preview */}
      <div className="aspect-video bg-gray-100 relative overflow-hidden">
        {template.preview_url ? (
          <img
            src={template.preview_url}
            alt={template.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <span className="text-4xl">{getCategoryIcon(template.category)}</span>
          </div>
        )}
        
        {/* Featured Badge */}
        {template.is_featured && (
          <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <Star className="w-3 h-3 fill-current" />
            Featured
          </div>
        )}

        {/* Category Badge */}
        <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded-full text-xs font-medium">
          {getCategoryName(template.category)}
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-200 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-2">
            <div className="bg-white rounded-full p-2 shadow-lg">
              <Eye className="w-4 h-4 text-gray-700" />
            </div>
            <div className="bg-white rounded-full p-2 shadow-lg">
              <Download className="w-4 h-4 text-gray-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Template Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
          {template.name}
        </h3>
        
        {template.description && (
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {template.description}
          </p>
        )}

        <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{formatDate(template.created_at)}</span>
          </div>
          
          {showUsageCount && (
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>0 uses</span>
            </div>
          )}
        </div>

        {showAuthor && template.created_by && (
          <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
            <User className="w-3 h-3" />
            <span>By User</span>
          </div>
        )}
      </div>
    </div>
  )
}