'use client'

import React, { useState, useEffect } from 'react'
import { useTemplatesStore } from '../../store/templates'
import { useEditorStore } from '../../store/editor'
import { TemplateCard } from '../templates/TemplateCard'
import { TemplateModal } from '../templates/TemplateModal'
import { Button } from '../ui/Button'
import { 
  Search, 
  Filter, 
  Star, 
  Clock, 
  TrendingUp, 
  Grid,
  ChevronDown,
  ChevronRight,
  X,
  Layers
} from 'lucide-react'

interface TemplatePanelProps {
  className?: string
  onClose?: () => void
}

export const TemplatePanel: React.FC<TemplatePanelProps> = ({
  className = '',
  onClose
}) => {
  const [activeSection, setActiveSection] = useState<'featured' | 'categories' | 'recent'>('featured')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['featured']))
  const [showModal, setShowModal] = useState(false)

  const {
    templates,
    featuredTemplates,
    recentTemplates,
    filters,
    isLoading,
    isFetching,
    selectedTemplate,
    fetchTemplates,
    fetchFeaturedTemplates,
    fetchRecentTemplates,
    setFilters,
    searchTemplates,
    selectTemplate,
    getTemplatesByCategory,
    getRecommendedTemplates
  } = useTemplatesStore()

  const { importCanvas, setCanvasSize, setBackgroundColor } = useEditorStore()

  useEffect(() => {
    fetchFeaturedTemplates()
    fetchRecentTemplates()
    if (selectedCategory !== 'all') {
      fetchTemplates({ category: selectedCategory as any })
    }
  }, [fetchFeaturedTemplates, fetchRecentTemplates, fetchTemplates, selectedCategory])

  useEffect(() => {
    if (searchQuery) {
      searchTemplates(searchQuery)
    }
  }, [searchQuery, searchTemplates])

  const handleTemplateClick = (template: any) => {
    selectTemplate(template)
    setShowModal(true)
  }

  const handleTemplateApply = async (templateId: string) => {
    const template = templates.find(t => t.id === templateId) || 
                    featuredTemplates.find(t => t.id === templateId) ||
                    recentTemplates.find(t => t.id === templateId)
    
    if (template?.canvas_data) {
      const { elements, canvas } = template.canvas_data
      
      // Import elements
      if (elements && Array.isArray(elements)) {
        importCanvas(elements)
      }
      
      // Apply canvas settings
      if (canvas) {
        if (canvas.width && canvas.height) {
          setCanvasSize(canvas.width, canvas.height)
        }
        if (canvas.backgroundColor) {
          setBackgroundColor(canvas.backgroundColor)
        }
      }
    }
    
    setShowModal(false)
    onClose?.() // Close the panel after applying template
  }

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  const categories = [
    { id: 'education', name: 'Education', icon: '🎓', count: getTemplatesByCategory('education').length },
    { id: 'food', name: 'Food & Dining', icon: '🍕', count: getTemplatesByCategory('food').length },
    { id: 'e-commerce', name: 'E-commerce', icon: '🛒', count: getTemplatesByCategory('e-commerce').length },
    { id: 'mobile-app', name: 'Mobile Apps', icon: '📱', count: getTemplatesByCategory('mobile-app').length },
    { id: 'web-app', name: 'Web Apps', icon: '💻', count: getTemplatesByCategory('web-app').length },
    { id: 'social-media', name: 'Social Media', icon: '📱', count: getTemplatesByCategory('social-media').length },
    { id: 'dashboard', name: 'Dashboard', icon: '📈', count: getTemplatesByCategory('dashboard').length },
    { id: 'other', name: 'Other', icon: '📄', count: getTemplatesByCategory('other').length }
  ]

  const getDisplayTemplates = () => {
    if (searchQuery) {
      return templates.filter(t => 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    switch (activeSection) {
      case 'featured':
        return featuredTemplates
      case 'recent':
        return recentTemplates
      case 'categories':
        return selectedCategory === 'all' ? templates : getTemplatesByCategory(selectedCategory as any)
      default:
        return featuredTemplates
    }
  }

  const displayTemplates = getDisplayTemplates().slice(0, 12) // Limit for sidebar

  return (
    <div className={`template-panel bg-white border-l border-gray-200 h-full flex flex-col ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Templates</h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-auto">
        {!searchQuery && (
          <div className="p-2">
            {/* Featured Section */}
            <div className="mb-2">
              <button
                onClick={() => {
                  setActiveSection('featured')
                  toggleCategory('featured')
                }}
                className={`w-full flex items-center justify-between p-2 text-sm font-medium rounded-lg transition-colors ${
                  activeSection === 'featured' && expandedCategories.has('featured')
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  <span>Featured</span>
                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                    {featuredTemplates.length}
                  </span>
                </div>
                {expandedCategories.has('featured') ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Recent Section */}
            <div className="mb-2">
              <button
                onClick={() => {
                  setActiveSection('recent')
                  toggleCategory('recent')
                }}
                className={`w-full flex items-center justify-between p-2 text-sm font-medium rounded-lg transition-colors ${
                  activeSection === 'recent' && expandedCategories.has('recent')
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Recent</span>
                </div>
                {expandedCategories.has('recent') ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Categories Section */}
            <div className="mb-2">
              <button
                onClick={() => {
                  setActiveSection('categories')
                  toggleCategory('categories')
                }}
                className={`w-full flex items-center justify-between p-2 text-sm font-medium rounded-lg transition-colors ${
                  activeSection === 'categories' && expandedCategories.has('categories')
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <span>Categories</span>
                </div>
                {expandedCategories.has('categories') ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>

              {/* Category List */}
              {expandedCategories.has('categories') && activeSection === 'categories' && (
                <div className="ml-4 mt-1 space-y-1">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`w-full flex items-center justify-between px-2 py-1.5 text-sm rounded transition-colors ${
                      selectedCategory === 'all'
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span>All Categories</span>
                    <span className="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">
                      {templates.length}
                    </span>
                  </button>
                  
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center justify-between px-2 py-1.5 text-sm rounded transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{category.icon}</span>
                        <span>{category.name}</span>
                      </div>
                      <span className="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">
                        {category.count}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Templates Grid */}
        <div className="p-2">
          {(isLoading || isFetching) && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          )}

          {!isLoading && !isFetching && (
            <>
              {searchQuery && (
                <div className="mb-3 px-2">
                  <h4 className="text-sm font-medium text-gray-900">
                    Search Results ({displayTemplates.length})
                  </h4>
                </div>
              )}

              <div className="space-y-3">
                {displayTemplates.map((template) => (
                  <div key={template.id} className="transform scale-95">
                    <TemplateCard
                      template={template}
                      viewMode="list"
                      onClick={() => handleTemplateClick(template)}
                      showAuthor={false}
                      showUsageCount={false}
                    />
                  </div>
                ))}
              </div>

              {displayTemplates.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">
                    <Grid className="w-8 h-8 mx-auto" />
                  </div>
                  <p className="text-sm text-gray-600">
                    {searchQuery ? 'No templates found' : 'No templates available'}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Browse All Templates Link */}
      <div className="p-4 border-t border-gray-200">
        <Button
          variant="secondary"
          size="sm"
          className="w-full justify-center"
          onClick={() => {
            // This would open the full template library
            console.log('Open full template library')
          }}
        >
          Browse All Templates
        </Button>
      </div>

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