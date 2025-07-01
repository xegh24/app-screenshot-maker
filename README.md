# App Screenshot Maker

A professional web application for creating beautiful app screenshots with mobile-first design and touch-optimized interactions. Built with Next.js, React, TypeScript, and Tailwind CSS.

## Features

### 🎨 Core Design Tools
- **Visual Canvas Editor**: Drag-and-drop interface with real-time editing
- **Device Frames**: Pre-built frames for iPhone, Android, iPad, and browser mockups
- **Text Editor**: Advanced typography controls with Google Fonts integration
- **Image Handling**: Upload, crop, and apply filters to images
- **Shape Tools**: Rectangles, circles, and custom shapes with styling options
- **Background Designer**: Solid colors, gradients, and image backgrounds

### 📱 Mobile-Optimized Experience
- **Touch Gestures**: 
  - Pinch-to-zoom on canvas
  - Single-finger panning
  - Touch-friendly controls with 44px minimum touch targets
- **Responsive Layout**: 
  - Mobile-first design approach
  - Collapsible panels and toolbars
  - Stacked layout on small screens
- **Mobile-Specific Features**:
  - Slide-out navigation menu
  - Bottom-sheet property panels
  - Full-screen modals on mobile
  - Optimized keyboard interactions

### 🔧 Advanced Features
- **Auto-Save**: Automatic project saving every 30 seconds
- **Export Options**: PNG, JPG, SVG with custom dimensions and quality
- **Template Library**: Pre-designed templates for different app categories
- **Layer Management**: Z-index control and visibility toggles
- **History**: Undo/redo functionality
- **Asset Management**: Organized asset library with search

### 🔐 User Management
- **Authentication**: Email/password and social login (Google, GitHub)
- **Project Management**: Save, load, and organize designs
- **Dashboard**: Grid view of all user projects with search and filtering

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun
- Supabase account (for authentication and database)

### Environment Setup

1. **Clone the repository**
```bash
git clone https://github.com/your-username/app-screenshot-maker.git
cd app-screenshot-maker
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Environment Variables**
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

4. **Database Setup**
Run the SQL schema from `/lib/supabase/schema.sql` in your Supabase dashboard to set up the required tables.

5. **Start the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
app-screenshot-maker/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages (login, register)
│   ├── dashboard/         # User dashboard
│   ├── editor/           # Main editor interface
│   └── layout.tsx        # Root layout
├── components/           # React components
│   ├── auth/            # Authentication components
│   ├── dashboard/       # Dashboard components
│   ├── editor/          # Editor-specific components
│   ├── layout/          # Layout components (Header, Sidebar)
│   ├── shared/          # Shared/common components
│   ├── templates/       # Template-related components
│   └── ui/              # Base UI components
├── hooks/               # Custom React hooks
├── lib/                 # Utility libraries
│   ├── canvas/         # Canvas rendering and export utilities
│   ├── devices/        # Device frame specifications
│   ├── fonts/          # Font loading utilities
│   ├── storage/        # Database operations
│   └── supabase/       # Supabase client and helpers
├── store/              # Zustand state management
├── types/              # TypeScript type definitions
└── public/             # Static assets
    ├── frames/         # Device frame SVGs
    ├── templates/      # Template presets
    └── backgrounds/    # Background images
```

## Mobile Development Guide

### Touch Interactions
The application is optimized for touch devices with:
- **Minimum 44px touch targets** for all interactive elements
- **Touch-action: manipulation** to prevent scroll delays
- **Smooth scrolling** with `-webkit-overflow-scrolling: touch`

### Responsive Breakpoints
- **xs**: 475px (extra small phones)
- **sm**: 640px (small phones)
- **md**: 768px (tablets)
- **lg**: 1024px (small laptops)
- **xl**: 1280px (laptops)
- **2xl**: 1536px (large screens)

### Mobile-Specific Components

#### Header Component
- Hamburger menu for navigation
- Collapsible user menu
- Touch-optimized buttons

#### Sidebar Component
- Drawer pattern on mobile
- Horizontal tabs for better thumb reach
- Auto-collapse functionality

#### Canvas Component
- Touch gesture support:
  ```javascript
  // Pinch to zoom
  handleTouchStart(e) // Initialize touch tracking
  handleTouchMove(e)  // Handle zoom and pan
  handleTouchEnd(e)   // Cleanup touch state
  ```

#### Property Panel
- Collapsible sections
- Stack layout on mobile
- Larger form inputs for better usability

#### Toolbar
- Essential tools in main bar
- Overflow menu for additional tools
- Context-aware tool selection

### CSS Utilities
Custom utilities for mobile optimization:
```css
.touch-manipulation { touch-action: manipulation; }
.mobile-safe-area { /* Safe area padding */ }
.mobile-viewport-height { height: 100dvh; }
.mobile-menu-height { max-height: calc(100vh - 4rem); }
```

## API Reference

### Editor Store
The main state management for the editor:
```typescript
interface EditorState {
  canvas: CanvasConfig
  elements: CanvasElement[]
  selectedElementIds: string[]
  activeTool: Tool
  // ... methods
}
```

### Key Methods
- `addElement(element)` - Add new element to canvas
- `updateElement(id, updates)` - Update element properties
- `selectElement(id)` - Select element for editing
- `setZoom(level)` - Set canvas zoom level
- `exportCanvas(options)` - Export canvas as image

## Deployment

### Build for Production
```bash
npm run build
npm run start
```

### Deploy to Vercel
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on git push

### Deploy to Other Platforms
The application can be deployed to any platform supporting Next.js:
- Netlify
- AWS Amplify  
- DigitalOcean App Platform
- Railway

## Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes with mobile-first approach
4. Test on multiple screen sizes
5. Submit a pull request

### Testing Mobile Features
- Use browser dev tools device emulation
- Test on actual mobile devices
- Verify touch interactions work correctly
- Check text input behavior on iOS/Android

### Code Style
- Use TypeScript for type safety
- Follow mobile-first responsive design
- Include `touch-manipulation` class for interactive elements
- Ensure minimum 44px touch targets
- Test across different screen sizes

## Troubleshooting

### Common Mobile Issues

**iOS Input Zoom Prevention**
```css
input { font-size: 16px !important; }
```

**Android Touch Delays**
```css
.touch-element { touch-action: manipulation; }
```

**Safe Area Issues**
```css
.safe-area { padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left); }
```

### Performance Optimization
- Canvas rendering optimized for mobile GPUs
- Lazy loading for large asset libraries
- Debounced touch events for smooth interaction
- Optimized bundle size for faster mobile loading

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
- GitHub Issues: Report bugs and feature requests
- Documentation: Check this README and inline code comments
- Mobile Testing: Test on various devices and report compatibility issues

---

Built with ❤️ for creating beautiful app screenshots on any device.