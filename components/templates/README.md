# Template System

This directory contains the template system components for the app-screenshot-maker project.

## Components

### TemplateLibrary
Main template browser and manager component with:
- Template browsing by category
- Search functionality
- Featured, recent, and category-based filtering
- Grid and list view modes

### TemplateCard
Individual template preview card displaying:
- Template preview image/icon
- Template name and description
- Category badge
- Usage statistics
- Interactive hover effects

### TemplateModal
Template details modal with:
- Large preview
- Template metadata
- Canvas element information
- Apply template functionality
- Template management actions (duplicate, delete, etc.)

## Template Panel Integration

The template system is integrated into the editor sidebar via `TemplatePanel` component located in `components/editor/`.

## Sample Data

Sample templates are defined in `lib/templates/index.ts` and include:
- Education templates (course landing pages, etc.)
- Food & dining templates (restaurant menus, etc.)
- E-commerce templates (product showcases, etc.)
- Mobile app templates (fitness trackers, etc.)
- Dashboard templates (analytics dashboards, etc.)
- Social media templates (chat applications, etc.)

## Template Categories

Supported categories:
- education
- food
- e-commerce  
- mobile-app
- web-app
- social-media
- presentation
- marketing
- portfolio
- blog
- dashboard
- landing-page
- other

## Usage

Templates can be applied to the canvas by:
1. Opening the Templates panel in the editor sidebar
2. Browsing or searching for templates
3. Clicking on a template to open the details modal
4. Clicking "Use This Template" to apply it to the canvas

Applied templates will:
- Import all template elements to the canvas
- Set canvas dimensions if specified
- Set background color if specified
- Clear existing canvas content (templates replace current design)