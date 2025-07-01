import { TemplateWithCanvas } from '../../store/templates'
import { AnyCanvasElement } from '../../store/editor'

// Template categories with metadata
export const TEMPLATE_CATEGORIES = {
  education: {
    id: 'education',
    name: 'Education',
    description: 'Templates for educational apps, courses, and learning platforms',
    icon: '🎓',
    color: '#3B82F6'
  },
  food: {
    id: 'food',
    name: 'Food & Dining',
    description: 'Templates for restaurants, food delivery, and culinary apps',
    icon: '🍕',
    color: '#F97316'
  },
  'e-commerce': {
    id: 'e-commerce',
    name: 'E-commerce',
    description: 'Templates for online stores, shopping apps, and marketplaces',
    icon: '🛒',
    color: '#10B981'
  },
  'mobile-app': {
    id: 'mobile-app',
    name: 'Mobile Apps',
    description: 'Templates for mobile applications and responsive designs',
    icon: '📱',
    color: '#8B5CF6'
  },
  'web-app': {
    id: 'web-app',
    name: 'Web Apps',
    description: 'Templates for web applications and SaaS platforms',
    icon: '💻',
    color: '#06B6D4'
  },
  'social-media': {
    id: 'social-media',
    name: 'Social Media',
    description: 'Templates for social networking and communication apps',
    icon: '📱',
    color: '#EC4899'
  },
  presentation: {
    id: 'presentation',
    name: 'Presentations',
    description: 'Templates for presentations and slide decks',
    icon: '📊',
    color: '#F59E0B'
  },
  marketing: {
    id: 'marketing',
    name: 'Marketing',
    description: 'Templates for marketing materials and promotional content',
    icon: '📢',
    color: '#EF4444'
  },
  portfolio: {
    id: 'portfolio',
    name: 'Portfolio',
    description: 'Templates for personal portfolios and showcase websites',
    icon: '👤',
    color: '#6366F1'
  },
  blog: {
    id: 'blog',
    name: 'Blog',
    description: 'Templates for blogs and content publishing platforms',
    icon: '📝',
    color: '#84CC16'
  },
  dashboard: {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'Templates for admin panels and data visualization',
    icon: '📈',
    color: '#14B8A6'
  },
  'landing-page': {
    id: 'landing-page',
    name: 'Landing Page',
    description: 'Templates for landing pages and marketing websites',
    icon: '🌐',
    color: '#F97316'
  },
  other: {
    id: 'other',
    name: 'Other',
    description: 'Miscellaneous templates for various use cases',
    icon: '📄',
    color: '#6B7280'
  }
} as const

// Helper function to create a template element
export const createElement = (
  type: AnyCanvasElement['type'],
  x: number,
  y: number,
  width: number,
  height: number,
  data: Record<string, any>,
  style: Record<string, any> = {}
): Omit<AnyCanvasElement, 'id' | 'zIndex'> => ({
  type,
  x,
  y,
  width,
  height,
  rotation: 0,
  scaleX: 1,
  scaleY: 1,
  opacity: 1,
  visible: true,
  locked: false,
  style,
  data
} as any)

// Sample template data
export const SAMPLE_TEMPLATES: TemplateWithCanvas[] = [
  // Education Templates
  {
    id: 'edu-course-landing',
    name: 'Online Course Landing',
    description: 'A modern landing page template for online courses with hero section, features, and CTA',
    category: 'education',
    is_featured: true,
    created_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    preview_url: '/templates/education/course-landing-preview.jpg',
    canvas_data: {
      canvas: {
        width: 1200,
        height: 800,
        backgroundColor: '#ffffff'
      },
      elements: [
        createElement('text', 100, 50, 1000, 80, {
          text: 'Master Web Development',
          fontSize: 48,
          fontFamily: 'Inter',
          fontWeight: 'bold',
          textAlign: 'center',
          color: '#1F2937'
        }),
        createElement('text', 100, 150, 1000, 40, {
          text: 'Learn modern web development with hands-on projects and expert guidance',
          fontSize: 18,
          fontFamily: 'Inter',
          fontWeight: 'normal',
          textAlign: 'center',
          color: '#6B7280'
        }),
        createElement('shape', 450, 220, 300, 60, {
          shape: 'rectangle',
          fill: '#3B82F6',
          stroke: 'none',
          strokeWidth: 0,
          cornerRadius: 12
        }),
        createElement('text', 450, 235, 300, 30, {
          text: 'Start Learning Today',
          fontSize: 16,
          fontFamily: 'Inter',
          fontWeight: '600',
          textAlign: 'center',
          color: '#ffffff'
        })
      ]
    }
  },

  // Food Templates
  {
    id: 'food-restaurant-menu',
    name: 'Restaurant Menu App',
    description: 'Mobile app template for restaurant menus with categories and item details',
    category: 'food',
    is_featured: true,
    created_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    preview_url: '/templates/food/restaurant-menu-preview.jpg',
    canvas_data: {
      canvas: {
        width: 375,
        height: 812,
        backgroundColor: '#F9FAFB'
      },
      elements: [
        createElement('shape', 0, 0, 375, 100, {
          shape: 'rectangle',
          fill: '#DC2626',
          stroke: 'none',
          strokeWidth: 0
        }),
        createElement('text', 20, 50, 335, 30, {
          text: 'Bella Italia',
          fontSize: 24,
          fontFamily: 'Inter',
          fontWeight: 'bold',
          textAlign: 'center',
          color: '#ffffff'
        }),
        createElement('text', 20, 120, 100, 25, {
          text: 'Categories',
          fontSize: 18,
          fontFamily: 'Inter',
          fontWeight: '600',
          color: '#1F2937'
        }),
        createElement('shape', 20, 160, 80, 40, {
          shape: 'rectangle',
          fill: '#FEF3C7',
          stroke: '#F59E0B',
          strokeWidth: 1,
          cornerRadius: 20
        }),
        createElement('text', 20, 170, 80, 20, {
          text: 'Pizza 🍕',
          fontSize: 14,
          fontFamily: 'Inter',
          fontWeight: '500',
          textAlign: 'center',
          color: '#92400E'
        })
      ]
    }
  },

  // E-commerce Templates
  {
    id: 'ecom-product-showcase',
    name: 'Product Showcase',
    description: 'E-commerce product page template with image gallery and purchase options',
    category: 'e-commerce',
    is_featured: true,
    created_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    preview_url: '/templates/ecommerce/product-showcase-preview.jpg',
    canvas_data: {
      canvas: {
        width: 1200,
        height: 800,
        backgroundColor: '#ffffff'
      },
      elements: [
        createElement('shape', 50, 50, 500, 400, {
          shape: 'rectangle',
          fill: '#F3F4F6',
          stroke: '#E5E7EB',
          strokeWidth: 1,
          cornerRadius: 8
        }),
        createElement('text', 50, 60, 500, 30, {
          text: 'Product Image',
          fontSize: 16,
          fontFamily: 'Inter',
          fontWeight: 'normal',
          textAlign: 'center',
          color: '#9CA3AF'
        }),
        createElement('text', 600, 50, 550, 50, {
          text: 'Premium Wireless Headphones',
          fontSize: 32,
          fontFamily: 'Inter',
          fontWeight: 'bold',
          color: '#1F2937'
        }),
        createElement('text', 600, 120, 100, 30, {
          text: '$299.99',
          fontSize: 24,
          fontFamily: 'Inter',
          fontWeight: 'bold',
          color: '#10B981'
        }),
        createElement('shape', 600, 200, 200, 50, {
          shape: 'rectangle',
          fill: '#1F2937',
          stroke: 'none',
          strokeWidth: 0,
          cornerRadius: 8
        }),
        createElement('text', 600, 215, 200, 20, {
          text: 'Add to Cart',
          fontSize: 16,
          fontFamily: 'Inter',
          fontWeight: '600',
          textAlign: 'center',
          color: '#ffffff'
        })
      ]
    }
  },

  // Mobile App Templates
  {
    id: 'mobile-fitness-tracker',
    name: 'Fitness Tracker App',
    description: 'Mobile fitness tracking app with dashboard, statistics, and workout plans',
    category: 'mobile-app',
    is_featured: false,
    created_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    preview_url: '/templates/mobile/fitness-tracker-preview.jpg',
    canvas_data: {
      canvas: {
        width: 375,
        height: 812,
        backgroundColor: '#1F2937'
      },
      elements: [
        createElement('text', 20, 60, 335, 40, {
          text: 'FitTrack',
          fontSize: 28,
          fontFamily: 'Inter',
          fontWeight: 'bold',
          textAlign: 'center',
          color: '#ffffff'
        }),
        createElement('shape', 20, 120, 335, 200, {
          shape: 'rectangle',
          fill: '#374151',
          stroke: 'none',
          strokeWidth: 0,
          cornerRadius: 16
        }),
        createElement('text', 40, 140, 295, 30, {
          text: "Today's Progress",
          fontSize: 20,
          fontFamily: 'Inter',
          fontWeight: '600',
          color: '#ffffff'
        }),
        createElement('text', 40, 180, 100, 60, {
          text: '8,547\nSteps',
          fontSize: 18,
          fontFamily: 'Inter',
          fontWeight: 'bold',
          textAlign: 'center',
          color: '#10B981'
        }),
        createElement('text', 155, 180, 100, 60, {
          text: '2.4\nMiles',
          fontSize: 18,
          fontFamily: 'Inter',
          fontWeight: 'bold',
          textAlign: 'center',
          color: '#3B82F6'
        }),
        createElement('text', 270, 180, 100, 60, {
          text: '320\nCalories',
          fontSize: 18,
          fontFamily: 'Inter',
          fontWeight: 'bold',
          textAlign: 'center',
          color: '#F59E0B'
        })
      ]
    }
  },

  // Dashboard Templates
  {
    id: 'dash-analytics',
    name: 'Analytics Dashboard',
    description: 'Comprehensive analytics dashboard with charts, KPIs, and data visualization',
    category: 'dashboard',
    is_featured: true,
    created_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    preview_url: '/templates/dashboard/analytics-preview.jpg',
    canvas_data: {
      canvas: {
        width: 1400,
        height: 900,
        backgroundColor: '#F9FAFB'
      },
      elements: [
        createElement('shape', 50, 50, 1300, 80, {
          shape: 'rectangle',
          fill: '#ffffff',
          stroke: '#E5E7EB',
          strokeWidth: 1,
          cornerRadius: 8
        }),
        createElement('text', 70, 75, 300, 30, {
          text: 'Analytics Dashboard',
          fontSize: 24,
          fontFamily: 'Inter',
          fontWeight: 'bold',
          color: '#1F2937'
        }),
        createElement('shape', 50, 150, 300, 200, {
          shape: 'rectangle',
          fill: '#ffffff',
          stroke: '#E5E7EB',
          strokeWidth: 1,
          cornerRadius: 8
        }),
        createElement('text', 70, 170, 260, 20, {
          text: 'Total Users',
          fontSize: 14,
          fontFamily: 'Inter',
          fontWeight: '500',
          color: '#6B7280'
        }),
        createElement('text', 70, 200, 260, 40, {
          text: '24,567',
          fontSize: 32,
          fontFamily: 'Inter',
          fontWeight: 'bold',
          color: '#1F2937'
        }),
        createElement('text', 70, 250, 260, 20, {
          text: '+12% from last month',
          fontSize: 12,
          fontFamily: 'Inter',
          fontWeight: 'normal',
          color: '#10B981'
        }),
        createElement('shape', 370, 150, 500, 300, {
          shape: 'rectangle',
          fill: '#ffffff',
          stroke: '#E5E7EB',
          strokeWidth: 1,
          cornerRadius: 8
        }),
        createElement('text', 390, 170, 460, 20, {
          text: 'Revenue Trends',
          fontSize: 16,
          fontFamily: 'Inter',
          fontWeight: '600',
          color: '#1F2937'
        })
      ]
    }
  },

  // Social Media Templates
  {
    id: 'social-chat-app',
    name: 'Chat Application',
    description: 'Modern chat application interface with message bubbles and user profiles',
    category: 'social-media',
    is_featured: false,
    created_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    preview_url: '/templates/social/chat-app-preview.jpg',
    canvas_data: {
      canvas: {
        width: 375,
        height: 812,
        backgroundColor: '#ffffff'
      },
      elements: [
        createElement('shape', 0, 0, 375, 100, {
          shape: 'rectangle',
          fill: '#3B82F6',
          stroke: 'none',
          strokeWidth: 0
        }),
        createElement('text', 20, 50, 335, 30, {
          text: 'Messages',
          fontSize: 20,
          fontFamily: 'Inter',
          fontWeight: 'bold',
          textAlign: 'center',
          color: '#ffffff'
        }),
        createElement('shape', 20, 120, 300, 60, {
          shape: 'rectangle',
          fill: '#E5E7EB',
          stroke: 'none',
          strokeWidth: 0,
          cornerRadius: 20
        }),
        createElement('text', 40, 140, 260, 20, {
          text: 'Hey! How are you doing?',
          fontSize: 14,
          fontFamily: 'Inter',
          fontWeight: 'normal',
          color: '#1F2937'
        }),
        createElement('shape', 55, 200, 280, 60, {
          shape: 'rectangle',
          fill: '#3B82F6',
          stroke: 'none',
          strokeWidth: 0,
          cornerRadius: 20
        }),
        createElement('text', 75, 220, 240, 20, {
          text: "I'm great! Thanks for asking 😊",
          fontSize: 14,
          fontFamily: 'Inter',
          fontWeight: 'normal',
          color: '#ffffff'
        })
      ]
    }
  }
]

// Utility functions
export const getTemplateById = (id: string): TemplateWithCanvas | undefined => {
  return SAMPLE_TEMPLATES.find(template => template.id === id)
}

export const getTemplatesByCategory = (category: string): TemplateWithCanvas[] => {
  if (category === 'all') return SAMPLE_TEMPLATES
  return SAMPLE_TEMPLATES.filter(template => template.category === category)
}

export const getFeaturedTemplates = (): TemplateWithCanvas[] => {
  return SAMPLE_TEMPLATES.filter(template => template.is_featured)
}

export const searchTemplates = (query: string): TemplateWithCanvas[] => {
  const lowercaseQuery = query.toLowerCase()
  return SAMPLE_TEMPLATES.filter(template =>
    template.name.toLowerCase().includes(lowercaseQuery) ||
    template.description?.toLowerCase().includes(lowercaseQuery) ||
    template.category.toLowerCase().includes(lowercaseQuery)
  )
}

export const getCategoryInfo = (categoryId: string) => {
  return TEMPLATE_CATEGORIES[categoryId as keyof typeof TEMPLATE_CATEGORIES] || TEMPLATE_CATEGORIES.other
}

// Template validation
export const validateTemplate = (template: TemplateWithCanvas): string[] => {
  const errors: string[] = []
  
  if (!template.name?.trim()) {
    errors.push('Template name is required')
  }
  
  if (!template.category) {
    errors.push('Template category is required')
  }
  
  if (!template.canvas_data) {
    errors.push('Canvas data is required')
  } else {
    if (!template.canvas_data.canvas) {
      errors.push('Canvas configuration is required')
    }
    
    if (!Array.isArray(template.canvas_data.elements)) {
      errors.push('Canvas elements must be an array')
    }
  }
  
  return errors
}

// Template export/import utilities
export const exportTemplate = (template: TemplateWithCanvas): string => {
  return JSON.stringify(template, null, 2)
}

export const importTemplate = (jsonString: string): TemplateWithCanvas | null => {
  try {
    const template = JSON.parse(jsonString) as TemplateWithCanvas
    const errors = validateTemplate(template)
    
    if (errors.length > 0) {
      console.error('Template validation errors:', errors)
      return null
    }
    
    return template
  } catch (error) {
    console.error('Failed to parse template JSON:', error)
    return null
  }
}

// Generate template preview (placeholder implementation)
export const generateTemplatePreview = async (template: TemplateWithCanvas): Promise<string> => {
  // This would typically render the template to an image
  // For now, return a placeholder
  return `/templates/previews/${template.id}-preview.jpg`
}