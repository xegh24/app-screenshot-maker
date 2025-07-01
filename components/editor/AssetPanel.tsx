'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { 
  Upload, 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  MoreVertical, 
  Trash2, 
  Download, 
  Eye,
  RefreshCw,
  Folder,
  Image as ImageIcon,
  X,
  ChevronDown
} from 'lucide-react'
import { getUserAssets, deleteAsset, deleteAssets, getStorageUsage, Asset } from '../../lib/storage/assets'
import { formatFileSize } from '../../lib/images/processing'
import { useEditorStore } from '../../store/editor'
import ImageUploader from './ImageUploader'
import { cn } from '../../lib/utils/cn'

interface AssetPanelProps {
  className?: string
}

type ViewMode = 'grid' | 'list'
type FilterType = 'all' | 'image' | 'background' | 'asset'

interface StorageUsage {
  used: number
  limit: number
  percentage: number
}

export default function AssetPanel({ className }: AssetPanelProps) {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set())
  const [showUploader, setShowUploader] = useState(false)
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const [storageUsage, setStorageUsage] = useState<StorageUsage>({ used: 0, limit: 0, percentage: 0 })
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [totalCount, setTotalCount] = useState(0)

  const ITEMS_PER_PAGE = 20

  const { addElement } = useEditorStore()

  // Load assets
  const loadAssets = useCallback(async (pageNum = 0, append = false) => {
    setLoading(true)
    setError(null)

    try {
      const uploadType = filterType === 'all' ? undefined : filterType
      const { assets: newAssets, count, error: fetchError } = await getUserAssets(
        uploadType,
        ITEMS_PER_PAGE,
        pageNum * ITEMS_PER_PAGE
      )

      if (fetchError) {
        setError(fetchError)
        return
      }

      if (append) {
        setAssets(prev => [...prev, ...newAssets])
      } else {
        setAssets(newAssets)
      }

      setTotalCount(count)
      setHasMore(newAssets.length === ITEMS_PER_PAGE && (pageNum + 1) * ITEMS_PER_PAGE < count)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load assets')
    } finally {
      setLoading(false)
    }
  }, [filterType])

  // Load storage usage
  const loadStorageUsage = useCallback(async () => {
    try {
      const usage = await getStorageUsage()
      setStorageUsage(usage)
    } catch (err) {
      console.error('Failed to load storage usage:', err)
    }
  }, [])

  // Initial load
  useEffect(() => {
    loadAssets(0, false)
    loadStorageUsage()
  }, [loadAssets, loadStorageUsage])

  // Reset page when filter changes
  useEffect(() => {
    setPage(0)
    setAssets([])
    loadAssets(0, false)
  }, [filterType])

  // Load more assets
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1
      setPage(nextPage)
      loadAssets(nextPage, true)
    }
  }, [loading, hasMore, page, loadAssets])

  // Filter assets by search query
  const filteredAssets = useMemo(() => {
    if (!searchQuery.trim()) return assets

    return assets.filter(asset =>
      asset.file_name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [assets, searchQuery])

  // Handle asset selection
  const toggleAssetSelection = useCallback((assetId: string, isSelected: boolean) => {
    setSelectedAssets(prev => {
      const newSet = new Set(prev)
      if (isSelected) {
        newSet.add(assetId)
      } else {
        newSet.delete(assetId)
      }
      return newSet
    })
  }, [])

  // Select all filtered assets
  const selectAll = useCallback(() => {
    const allIds = new Set(filteredAssets.map(asset => asset.id))
    setSelectedAssets(allIds)
  }, [filteredAssets])

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedAssets(new Set())
  }, [])

  // Delete selected assets
  const deleteSelectedAssets = useCallback(async () => {
    if (selectedAssets.size === 0) return

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedAssets.size} asset${selectedAssets.size > 1 ? 's' : ''}?`
    )

    if (!confirmed) return

    try {
      const result = await deleteAssets(Array.from(selectedAssets))
      
      if (result.success) {
        // Remove deleted assets from state
        setAssets(prev => prev.filter(asset => !selectedAssets.has(asset.id)))
        setSelectedAssets(new Set())
        setTotalCount(prev => prev - selectedAssets.size)
        loadStorageUsage() // Refresh storage usage
      } else {
        setError(result.error || 'Failed to delete assets')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete assets')
    }
  }, [selectedAssets, loadStorageUsage])

  // Delete single asset
  const deleteSingleAsset = useCallback(async (assetId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this asset?')
    if (!confirmed) return

    try {
      const result = await deleteAsset(assetId)
      
      if (result.success) {
        setAssets(prev => prev.filter(asset => asset.id !== assetId))
        setSelectedAssets(prev => {
          const newSet = new Set(prev)
          newSet.delete(assetId)
          return newSet
        })
        setTotalCount(prev => prev - 1)
        loadStorageUsage() // Refresh storage usage
      } else {
        setError(result.error || 'Failed to delete asset')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete asset')
    }
  }, [loadStorageUsage])

  // Add asset to canvas
  const addAssetToCanvas = useCallback((asset: Asset) => {
    addElement({
      type: 'image',
      x: 50,
      y: 50,
      width: 200,
      height: 150,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
      visible: true,
      locked: false,
      style: {},
      data: {
        src: asset.url || '',
        originalWidth: 200,
        originalHeight: 150,
        fit: 'cover',
        filters: {
          brightness: 100,
          contrast: 100,
          saturation: 100,
          blur: 0,
          grayscale: 0,
          sepia: 0
        }
      }
    })
  }, [addElement])

  // Handle upload complete
  const handleUploadComplete = useCallback(() => {
    setShowUploader(false)
    loadAssets(0, false) // Refresh assets
    loadStorageUsage() // Refresh storage usage
  }, [loadAssets, loadStorageUsage])

  return (
    <div className={cn('flex flex-col h-full bg-white dark:bg-gray-900', className)}>
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Assets
          </h2>
          <button
            onClick={() => setShowUploader(true)}
            className="flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Upload className="h-4 w-4" />
            Upload
          </button>
        </div>

        {/* Storage Usage */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600 dark:text-gray-400">Storage Used</span>
            <span className="text-gray-900 dark:text-gray-100">
              {formatFileSize(storageUsage.used)} / {formatFileSize(storageUsage.limit)}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                storageUsage.percentage > 90 ? 'bg-red-500' :
                storageUsage.percentage > 70 ? 'bg-yellow-500' : 'bg-blue-500'
              )}
              style={{ width: `${Math.min(storageUsage.percentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Search and Controls */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
            >
              <Filter className="h-4 w-4" />
              {filterType === 'all' ? 'All' : filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              <ChevronDown className="h-4 w-4" />
            </button>

            {showFilterDropdown && (
              <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 shadow-lg z-10">
                {(['all', 'image', 'background', 'asset'] as FilterType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      setFilterType(type)
                      setShowFilterDropdown(false)
                    }}
                    className={cn(
                      'w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg',
                      filterType === type ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                    )}
                  >
                    {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* View Mode */}
          <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-2 text-sm',
                viewMode === 'grid' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              )}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-2 text-sm border-l border-gray-300 dark:border-gray-600',
                viewMode === 'list' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              )}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Selection Controls */}
        {selectedAssets.size > 0 && (
          <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <span className="text-sm text-blue-700 dark:text-blue-300">
              {selectedAssets.size} selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={clearSelection}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                Clear
              </button>
              <button
                onClick={deleteSelectedAssets}
                className="flex items-center gap-1 px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
              >
                <Trash2 className="h-3 w-3" />
                Delete
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
            >
              Dismiss
            </button>
          </div>
        )}

        {loading && assets.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            {searchQuery ? (
              <>
                <Search className="h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  No assets found for "{searchQuery}"
                </p>
              </>
            ) : (
              <>
                <ImageIcon className="h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-500 dark:text-gray-400 mb-2">
                  No assets uploaded yet
                </p>
                <button
                  onClick={() => setShowUploader(true)}
                  className="text-blue-500 hover:text-blue-600 text-sm"
                >
                  Upload your first asset
                </button>
              </>
            )}
          </div>
        ) : (
          <>
            {/* Asset Grid/List */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredAssets.map((asset) => (
                  <AssetGridItem
                    key={asset.id}
                    asset={asset}
                    isSelected={selectedAssets.has(asset.id)}
                    onSelect={(selected) => toggleAssetSelection(asset.id, selected)}
                    onDelete={() => deleteSingleAsset(asset.id)}
                    onAddToCanvas={() => addAssetToCanvas(asset)}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredAssets.map((asset) => (
                  <AssetListItem
                    key={asset.id}
                    asset={asset}
                    isSelected={selectedAssets.has(asset.id)}
                    onSelect={(selected) => toggleAssetSelection(asset.id, selected)}
                    onDelete={() => deleteSingleAsset(asset.id)}
                    onAddToCanvas={() => addAssetToCanvas(asset)}
                  />
                ))}
              </div>
            )}

            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  {loading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                  Load More
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Upload Modal */}
      {showUploader && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-600">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Upload Assets
              </h2>
              <button
                onClick={() => setShowUploader(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <ImageUploader
                onUploadComplete={handleUploadComplete}
                maxFiles={20}
                autoOptimize={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Asset Grid Item Component
interface AssetItemProps {
  asset: Asset
  isSelected: boolean
  onSelect: (selected: boolean) => void
  onDelete: () => void
  onAddToCanvas: () => void
}

function AssetGridItem({ asset, isSelected, onSelect, onDelete, onAddToCanvas }: AssetItemProps) {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div className="relative group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 hover:shadow-md transition-shadow">
      {/* Selection Checkbox */}
      <div className="absolute top-2 left-2 z-10">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(e.target.checked)}
          className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
        />
      </div>

      {/* Menu Button */}
      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-1 bg-white dark:bg-gray-800 rounded-full shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <MoreVertical className="h-4 w-4 text-gray-500" />
        </button>

        {showMenu && (
          <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 shadow-lg">
            <button
              onClick={() => {
                onAddToCanvas()
                setShowMenu(false)
              }}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-t-lg"
            >
              Add to Canvas
            </button>
            <button
              onClick={() => {
                window.open(asset.url, '_blank')
                setShowMenu(false)
              }}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              View Full Size
            </button>
            <button
              onClick={() => {
                onDelete()
                setShowMenu(false)
              }}
              className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-b-lg"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Image Preview */}
      <div
        className="aspect-square mb-2 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden cursor-pointer"
        onClick={onAddToCanvas}
      >
        <img
          src={asset.url}
          alt={asset.file_name}
          className="w-full h-full object-cover hover:scale-105 transition-transform"
          loading="lazy"
        />
      </div>

      {/* Asset Info */}
      <div className="space-y-1">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
          {asset.file_name}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {formatFileSize(asset.file_size)}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          {new Date(asset.created_at).toLocaleDateString()}
        </p>
      </div>
    </div>
  )
}

// Asset List Item Component
function AssetListItem({ asset, isSelected, onSelect, onDelete, onAddToCanvas }: AssetItemProps) {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-shadow group">
      {/* Selection Checkbox */}
      <input
        type="checkbox"
        checked={isSelected}
        onChange={(e) => onSelect(e.target.checked)}
        className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
      />

      {/* Thumbnail */}
      <div
        className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden flex-shrink-0 cursor-pointer"
        onClick={onAddToCanvas}
      >
        <img
          src={asset.url}
          alt={asset.file_name}
          className="w-full h-full object-cover hover:scale-105 transition-transform"
          loading="lazy"
        />
      </div>

      {/* Asset Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
          {asset.file_name}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {formatFileSize(asset.file_size)} • {new Date(asset.created_at).toLocaleDateString()}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onAddToCanvas}
          className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400"
          title="Add to Canvas"
        >
          <Eye className="h-4 w-4" />
        </button>
        
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 shadow-lg z-10">
              <button
                onClick={() => {
                  window.open(asset.url, '_blank')
                  setShowMenu(false)
                }}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-t-lg"
              >
                View Full Size
              </button>
              <button
                onClick={() => {
                  onDelete()
                  setShowMenu(false)
                }}
                className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-b-lg"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}