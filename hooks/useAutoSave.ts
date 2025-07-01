import { useEffect, useRef } from 'react'
import { useEditorStore } from '../store/editor'
import { useAuthStore } from '../store/auth'

interface UseAutoSaveOptions {
  enabled?: boolean
  interval?: number
  onAutoSave?: () => void
  onAutoSaveError?: (error: Error) => void
}

export function useAutoSave({
  enabled = true,
  interval = 30000, // 30 seconds
  onAutoSave,
  onAutoSaveError
}: UseAutoSaveOptions = {}) {
  const {
    autoSaveEnabled,
    isDesignSaved,
    triggerAutoSave,
    setAutoSaveEnabled,
    setAutoSaveInterval,
    lastAutoSave
  } = useEditorStore()
  
  const { isAuthenticated } = useAuthStore()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastSaveAttemptRef = useRef<number>(0)

  // Update store settings when options change
  useEffect(() => {
    setAutoSaveEnabled(enabled && isAuthenticated())
    setAutoSaveInterval(interval)
  }, [enabled, interval, isAuthenticated, setAutoSaveEnabled, setAutoSaveInterval])

  // Auto-save interval
  useEffect(() => {
    if (!autoSaveEnabled || !isAuthenticated()) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    const performAutoSave = async () => {
      const now = Date.now()
      
      // Debounce: Don't auto-save too frequently
      if (now - lastSaveAttemptRef.current < 5000) {
        return
      }
      
      lastSaveAttemptRef.current = now
      
      try {
        await triggerAutoSave()
        onAutoSave?.()
      } catch (error) {
        console.error('Auto-save error:', error)
        onAutoSaveError?.(error as Error)
      }
    }

    // Set up interval
    intervalRef.current = setInterval(performAutoSave, interval)

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [autoSaveEnabled, interval, triggerAutoSave, onAutoSave, onAutoSaveError, isAuthenticated])

  // Also trigger auto-save on visibility change (when user switches tabs/apps)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && autoSaveEnabled && !isDesignSaved) {
        triggerAutoSave().catch(error => {
          console.error('Auto-save on visibility change failed:', error)
          onAutoSaveError?.(error as Error)
        })
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [autoSaveEnabled, isDesignSaved, triggerAutoSave, onAutoSaveError])

  // Manual trigger for immediate auto-save
  const saveNow = async () => {
    if (!autoSaveEnabled || !isAuthenticated()) {
      return false
    }

    try {
      await triggerAutoSave()
      onAutoSave?.()
      return true
    } catch (error) {
      console.error('Manual auto-save failed:', error)
      onAutoSaveError?.(error as Error)
      return false
    }
  }

  return {
    isAutoSaveEnabled: autoSaveEnabled && isAuthenticated(),
    lastAutoSave,
    saveNow
  }
}