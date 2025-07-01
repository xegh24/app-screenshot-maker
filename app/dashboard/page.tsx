'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Plus,
  Search,
  Filter,
  Grid3X3,
  List,
  SortAsc,
  SortDesc
} from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
import { AuthProvider } from '@/components/auth/AuthProvider'
import { DesignGrid } from '@/components/dashboard/DesignGrid'
import type { Design } from '@/types/database'

function DashboardContent() {
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'created_at' | 'updated_at' | 'title'>('updated_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [showPublicOnly, setShowPublicOnly] = useState(false)
  
  const router = useRouter()

  const handleDesignSelect = (design: Design) => {
    // Navigate to editor with design loaded
    router.push(`/editor?design=${design.id}`)
  }

  const toggleSort = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-muted/30">
        <div className="container px-4 py-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 lg:mb-8">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">My Designs</h1>
              <p className="text-muted-foreground mt-1 text-sm lg:text-base">
                Manage your app screenshot designs
              </p>
            </div>
            
            <Button asChild size="lg" className="touch-manipulation">
              <Link href="/editor">
                <Plus className="h-4 w-4 mr-2" />
                New Design
              </Link>
            </Button>
          </div>

          {/* Toolbar */}
          <div className="space-y-4 mb-6">
            {/* Search */}
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search designs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 lg:py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent touch-manipulation text-base lg:text-sm min-h-[48px] lg:min-h-auto"
              />
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Sort */}
              <div className="flex items-center gap-1 border rounded-md flex-1 sm:flex-none">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-3 lg:py-2 bg-transparent border-0 focus:outline-none text-sm flex-1 touch-manipulation"
                >
                  <option value="updated_at">Last Updated</option>
                  <option value="created_at">Date Created</option>
                  <option value="title">Title</option>
                </select>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleSort}
                  className="px-3 py-3 lg:px-2 lg:py-2 touch-manipulation"
                >
                  {sortOrder === 'asc' ? (
                    <SortAsc className="h-4 w-4" />
                  ) : (
                    <SortDesc className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* View Mode - Hidden on mobile as grid is better for touch */}
              <div className="hidden sm:flex items-center border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none touch-manipulation"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none touch-manipulation"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              {/* Filters */}
              <Button
                variant={showPublicOnly ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowPublicOnly(!showPublicOnly)}
                className="touch-manipulation min-h-[48px] lg:min-h-auto"
              >
                <Filter className="h-4 w-4 mr-2" />
                <span className="sm:hidden">{showPublicOnly ? 'Public' : 'All'}</span>
                <span className="hidden sm:inline">{showPublicOnly ? 'Public Only' : 'All Designs'}</span>
              </Button>
            </div>
          </div>

          {/* Designs Grid */}
          <DesignGrid
            searchQuery={searchQuery}
            sortBy={sortBy}
            sortOrder={sortOrder}
            viewMode="grid" // Force grid view for better mobile experience
            isPublic={showPublicOnly ? true : undefined}
            onDesignSelect={handleDesignSelect}
          />
        </div>
      </main>
    </div>
  )
}

export default function Dashboard() {
  return (
    <AuthProvider requireAuth>
      <DashboardContent />
    </AuthProvider>
  )
}