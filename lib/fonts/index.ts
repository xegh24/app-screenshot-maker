// Google Fonts integration and font management

export interface Font {
  family: string
  category: string
  variants: string[]
  subsets: string[]
  popularity?: number
}

// Popular Google Fonts with their variants
export const GOOGLE_FONTS: Font[] = [
  {
    family: 'Inter',
    category: 'sans-serif',
    variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
    subsets: ['latin', 'latin-ext'],
    popularity: 1
  },
  {
    family: 'Roboto',
    category: 'sans-serif',
    variants: ['100', '300', '400', '500', '700', '900'],
    subsets: ['latin', 'latin-ext'],
    popularity: 2
  },
  {
    family: 'Open Sans',
    category: 'sans-serif',
    variants: ['300', '400', '500', '600', '700', '800'],
    subsets: ['latin', 'latin-ext'],
    popularity: 3
  },
  {
    family: 'Lato',
    category: 'sans-serif',
    variants: ['100', '300', '400', '700', '900'],
    subsets: ['latin', 'latin-ext'],
    popularity: 4
  },
  {
    family: 'Montserrat',
    category: 'sans-serif',
    variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
    subsets: ['latin', 'latin-ext'],
    popularity: 5
  },
  {
    family: 'Poppins',
    category: 'sans-serif',
    variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
    subsets: ['latin', 'latin-ext'],
    popularity: 6
  },
  {
    family: 'Raleway',
    category: 'sans-serif',
    variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
    subsets: ['latin', 'latin-ext'],
    popularity: 7
  },
  {
    family: 'Ubuntu',
    category: 'sans-serif',
    variants: ['300', '400', '500', '700'],
    subsets: ['latin', 'latin-ext'],
    popularity: 8
  },
  {
    family: 'Nunito',
    category: 'sans-serif',
    variants: ['200', '300', '400', '600', '700', '800', '900'],
    subsets: ['latin', 'latin-ext'],
    popularity: 9
  },
  {
    family: 'Playfair Display',
    category: 'serif',
    variants: ['400', '500', '600', '700', '800', '900'],
    subsets: ['latin', 'latin-ext'],
    popularity: 10
  },
  {
    family: 'Merriweather',
    category: 'serif',
    variants: ['300', '400', '700', '900'],
    subsets: ['latin', 'latin-ext'],
    popularity: 11
  },
  {
    family: 'Georgia',
    category: 'serif',
    variants: ['400', '700'],
    subsets: ['latin'],
    popularity: 12
  },
  {
    family: 'Roboto Slab',
    category: 'serif',
    variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
    subsets: ['latin', 'latin-ext'],
    popularity: 13
  },
  {
    family: 'Source Code Pro',
    category: 'monospace',
    variants: ['200', '300', '400', '500', '600', '700', '800', '900'],
    subsets: ['latin', 'latin-ext'],
    popularity: 14
  },
  {
    family: 'Fira Code',
    category: 'monospace',
    variants: ['300', '400', '500', '600', '700'],
    subsets: ['latin', 'latin-ext'],
    popularity: 15
  },
  {
    family: 'Dancing Script',
    category: 'cursive',
    variants: ['400', '500', '600', '700'],
    subsets: ['latin', 'latin-ext'],
    popularity: 16
  },
  {
    family: 'Pacifico',
    category: 'cursive',
    variants: ['400'],
    subsets: ['latin', 'latin-ext'],
    popularity: 17
  },
  {
    family: 'Bebas Neue',
    category: 'display',
    variants: ['400'],
    subsets: ['latin', 'latin-ext'],
    popularity: 18
  },
  {
    family: 'Anton',
    category: 'display',
    variants: ['400'],
    subsets: ['latin', 'latin-ext'],
    popularity: 19
  },
  {
    family: 'Comfortaa',
    category: 'display',
    variants: ['300', '400', '500', '600', '700'],
    subsets: ['latin', 'latin-ext'],
    popularity: 20
  }
]

// System fonts as fallbacks
export const SYSTEM_FONTS: Font[] = [
  {
    family: 'Arial',
    category: 'sans-serif',
    variants: ['400', '700'],
    subsets: ['latin']
  },
  {
    family: 'Helvetica',
    category: 'sans-serif',
    variants: ['400', '700'],
    subsets: ['latin']
  },
  {
    family: 'Times New Roman',
    category: 'serif',
    variants: ['400', '700'],
    subsets: ['latin']
  },
  {
    family: 'Courier New',
    category: 'monospace',
    variants: ['400', '700'],
    subsets: ['latin']
  },
  {
    family: 'Verdana',
    category: 'sans-serif',
    variants: ['400', '700'],
    subsets: ['latin']
  },
  {
    family: 'Tahoma',
    category: 'sans-serif',
    variants: ['400', '700'],
    subsets: ['latin']
  }
]

// Get all available fonts
export const ALL_FONTS = [...GOOGLE_FONTS, ...SYSTEM_FONTS]

// Font categories
export const FONT_CATEGORIES = [
  { id: 'all', label: 'All Fonts' },
  { id: 'sans-serif', label: 'Sans Serif' },
  { id: 'serif', label: 'Serif' },
  { id: 'display', label: 'Display' },
  { id: 'monospace', label: 'Monospace' },
  { id: 'cursive', label: 'Cursive' }
]

// Load Google Font
export function loadGoogleFont(fontFamily: string, variants: string[] = ['400']) {
  // Check if font is already loaded
  const existingLink = document.querySelector(`link[data-font="${fontFamily}"]`)
  if (existingLink) return

  // Create Google Fonts URL
  const variantsStr = variants.join(',')
  const fontUrl = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(' ', '+')}:wght@${variantsStr}&display=swap`

  // Create and append link element
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = fontUrl
  link.setAttribute('data-font', fontFamily)
  document.head.appendChild(link)
}

// Load multiple Google Fonts
export function loadGoogleFonts(fonts: { family: string; variants?: string[] }[]) {
  fonts.forEach(font => {
    const fontData = GOOGLE_FONTS.find(f => f.family === font.family)
    if (fontData) {
      loadGoogleFont(font.family, font.variants || ['400'])
    }
  })
}

// Preload popular fonts
export function preloadPopularFonts() {
  const popularFonts = GOOGLE_FONTS
    .filter(font => font.popularity && font.popularity <= 10)
    .map(font => ({
      family: font.family,
      variants: ['400', '700'] // Load regular and bold for popular fonts
    }))
  
  loadGoogleFonts(popularFonts)
}

// Get font by family name
export function getFont(family: string): Font | undefined {
  return ALL_FONTS.find(font => font.family === family)
}

// Get fonts by category
export function getFontsByCategory(category: string): Font[] {
  if (category === 'all') return ALL_FONTS
  return ALL_FONTS.filter(font => font.category === category)
}

// Search fonts
export function searchFonts(query: string): Font[] {
  const lowercaseQuery = query.toLowerCase()
  return ALL_FONTS.filter(font => 
    font.family.toLowerCase().includes(lowercaseQuery)
  )
}

// Get font weight from variant
export function getFontWeightFromVariant(variant: string): string {
  const weightMap: Record<string, string> = {
    '100': 'thin',
    '200': 'extralight',
    '300': 'light',
    '400': 'normal',
    '500': 'medium',
    '600': 'semibold',
    '700': 'bold',
    '800': 'extrabold',
    '900': 'black'
  }
  return weightMap[variant] || 'normal'
}

// Convert weight name to numeric value
export function getNumericFontWeight(weight: string): string {
  const weightMap: Record<string, string> = {
    'thin': '100',
    'extralight': '200',
    'light': '300',
    'normal': '400',
    'medium': '500',
    'semibold': '600',
    'bold': '700',
    'extrabold': '800',
    'black': '900'
  }
  return weightMap[weight] || '400'
}