'use client'

import React, { useState, useEffect } from 'react'
import { useTemplatesStore } from '../../store/templates'
import { TemplateCard } from './TemplateCard'
import { TemplateModal } from './TemplateModal'
import { Button } from '../ui/Button'
import { Search, Filter, Grid, List, Star, Clock, TrendingUp } from 'lucide-react'

const TEMPLATE_CATEGORIES = [
  { id: 'all', name: 'All Templates', icon: Grid },
  { id: 'education', name: 'Education', icon: Filter },
  { id: 'food', name: 'Food & Dining', icon: Filter },
  { id: 'e-commerce', name: 'E-commerce', icon: Filter },
  { id: 'mobile-app', name: 'Mobile Apps', icon: Filter },
  { id: 'web-app', name: 'Web Apps', icon: Filter },
  { id: 'social-media', name: 'Social Media', icon: Filter },
  { id: 'presentation', name: 'Presentations', icon: Filter },
  { id: 'marketing', name: 'Marketing', icon: Filter },
  { id: 'portfolio', name: 'Portfolio', icon: Filter },
  { id: 'blog', name: 'Blog', icon: Filter },
  { id: 'dashboard', name: 'Dashboard', icon: Filter },
  { id: 'landing-page', name: 'Landing Page', icon: Filter },
  { id: 'other', name: 'Other', icon: Filter }
]

const SORT_OPTIONS = [
  { value: 'created_at', label: 'Recently Added' },
  { value: 'name', label: 'Name' },
  { value: 'usage_count', label: 'Most Popular' }
]

interface TemplateLibraryProps {
  className?: string
  showHeader?: boolean
  showCategories?: boolean
  showFilters?: boolean
  maxTemplates?: number
  onTemplateSelect?: (templateId: string) => void
}

export const TemplateLibrary: React.FC<TemplateLibraryProps> = ({
  className = '',
  showHeader = true,
  showCategories = true,
  showFilters = true,
  maxTemplates,
  onTemplateSelect
}) => {
  const {
    templates,
    featuredTemplates,
    filters,
    isLoading,
    isFetching,
    error,
    selectedTemplate,
    fetchTemplates,
    fetchFeaturedTemplates,
    setFilters,
    searchTemplates,
    selectTemplate,
    clearError
  } = useTemplatesStore()

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [activeTab, setActiveTab] = useState<'all' | 'featured' | 'recent'>('all')
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchTemplates()
    fetchFeaturedTemplates()
  }, [fetchTemplates, fetchFeaturedTemplates])

  useEffect(() => {
    fetchTemplates(filters)
  }, [filters, fetchTemplates])

  const handleCategoryChange = (category: string) => {
    setFilters({ category: category as any })
  }

  const handleSearch = (query: string) => {
    searchTemplates(query)
  }

  const handleSortChange = (sortBy: string) => {
    setFilters({ sortBy: sortBy as any })
  }

  const handleTemplateClick = (template: any) => {
    selectTemplate(template)
    setShowModal(true)
  }

  const handleTemplateApply = (templateId: string) => {
    setShowModal(false)
    onTemplateSelect?.(templateId)
  }

  const getDisplayTemplates = () => {
    let displayTemplates = templates
    
    if (activeTab === 'featured') {
      displayTemplates = featuredTemplates
    }
    
    if (maxTemplates) {
      displayTemplates = displayTemplates.slice(0, maxTemplates)
    }
    
    return displayTemplates
  }

  const displayTemplates = getDisplayTemplates()

  return (
    <div className={`template-library ${className}`}>
      {showHeader && (
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Template Library</h2>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'secondary'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="p-2"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'secondary'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="p-2"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'all'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Grid className="w-4 h-4" />
              All Templates
            </button>
            <button
              onClick={() => setActiveTab('featured')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'featured'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Star className="w-4 h-4" />
              Featured
            </button>
            <button
              onClick={() => setActiveTab('recent')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'recent'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Clock className="w-4 h-4" />
              Recent
            </button>
          </div>
        </div>
      )}

      {showFilters && (
        <div className="flex flex-col gap-4 mb-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search templates..."
              value={filters.search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-4">
            {/* Category Filter */}
            {showCategories && (
              <div className="flex-1">
                <select
                  value={filters.category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {TEMPLATE_CATEGORIES.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Sort Options */}
            <div className="min-w-[200px]">
              <select
                value={filters.sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Order */}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setFilters({ sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' })}
              className="px-3 py-2"
            >
              {filters.sortOrder === 'asc' ? '↑' : '↓'}
            </Button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={clearError}
              className="text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {(isLoading || isFetching) && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Template Grid/List */}
      {!isLoading && !isFetching && (
        <div
          className={`template-grid ${
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          }`}
        >
          {displayTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              viewMode={viewMode}
              onClick={() => handleTemplateClick(template)}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isFetching && displayTemplates.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Grid className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-600">
            {filters.search || filters.category !== 'all'
              ? 'Try adjusting your search criteria or browse all templates.'
              : 'There are no templates available yet.'}
          </p>
        </div>
      )}

      {/* Template Modal */}
      {showModal && selectedTemplate && (
        <TemplateModal
          template={selectedTemplate}
          onClose={() => setShowModal(false)}
          onApply={handleTemplateApply}
        />
      )}
    </div>
  )
}