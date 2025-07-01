'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Camera, 
  User, 
  Settings, 
  Menu,
  X,
  Home,
  LayoutDashboard,
  PenTool
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/auth'
import { useUIStore } from '@/store/ui'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils/cn'

export interface HeaderProps {
  className?: string
}

export function Header({ className }: HeaderProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, signOut } = useAuthStore()
  const { openModal } = useUIStore()

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, requiresAuth: true },
    { name: 'Editor', href: '/editor', icon: PenTool, requiresAuth: true },
  ]

  const isActivePath = (path: string) => {
    if (path === '/') return pathname === '/'
    return pathname.startsWith(path)
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      // Redirect will be handled by the auth store
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuOpen && !(event.target as HTMLElement)?.closest?.('.mobile-menu-container')) {
        setMobileMenuOpen(false)
      }
    }

    if (mobileMenuOpen) {
      document.addEventListener('click', handleClickOutside)
      // Prevent body scroll when mobile menu is open
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
      document.body.style.overflow = 'unset'
    }
  }, [mobileMenuOpen])

  return (
    <header className={cn(
      'sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
      className
    )}>
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4">
        {/* Logo */}
        <Link 
          href="/" 
          className="flex items-center space-x-2 font-bold text-xl touch-manipulation"
        >
          <Camera className="h-6 w-6 text-primary flex-shrink-0" />
          <span className="hidden sm:inline-block truncate">App Screenshot Maker</span>
          <span className="sm:hidden">ASM</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navigation.map((item) => {
            if (item.requiresAuth && !user) return null
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary touch-manipulation',
                  isActivePath(item.href) 
                    ? 'text-primary' 
                    : 'text-muted-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* Desktop User Menu */}
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => openModal('settings')}
                aria-label="Settings"
                className="touch-manipulation"
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => openModal('profile')}
                aria-label="Profile"
                className="touch-manipulation"
              >
                <User className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={handleSignOut}
                size="sm"
                className="touch-manipulation"
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                asChild
                size="sm"
                className="touch-manipulation"
              >
                <Link href="/login">Sign In</Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="touch-manipulation"
              >
                <Link href="/register">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-10 w-10 touch-manipulation"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle mobile menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </Button>
      </div>

      {/* Mobile Navigation Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 z-50 mobile-menu-container">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Slide-out Menu */}
          <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-background border-l shadow-xl">
            <div className="flex flex-col h-full overflow-y-auto">
              <div className="p-4 space-y-4">
                {/* Navigation Links */}
                <nav className="flex flex-col space-y-2">
                  {navigation.map((item) => {
                    if (item.requiresAuth && !user) return null
                    
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          'flex items-center space-x-3 text-base font-medium p-3 rounded-lg transition-colors touch-manipulation',
                          'min-h-[48px]', // Ensure minimum touch target size
                          isActivePath(item.href)
                            ? 'bg-primary/10 text-primary'
                            : 'text-foreground hover:text-primary hover:bg-accent'
                        )}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        <span>{item.name}</span>
                      </Link>
                    )
                  })}
                </nav>

                {/* User Actions */}
                <div className="border-t pt-4 mt-4">
                  {user ? (
                    <div className="flex flex-col space-y-2">
                      <Button
                        variant="ghost"
                        className="justify-start h-12 px-3 touch-manipulation"
                        onClick={() => {
                          openModal('profile')
                          setMobileMenuOpen(false)
                        }}
                      >
                        <User className="h-5 w-5 mr-3 flex-shrink-0" />
                        <span className="text-base">Profile</span>
                      </Button>
                      <Button
                        variant="ghost"
                        className="justify-start h-12 px-3 touch-manipulation"
                        onClick={() => {
                          openModal('settings')
                          setMobileMenuOpen(false)
                        }}
                      >
                        <Settings className="h-5 w-5 mr-3 flex-shrink-0" />
                        <span className="text-base">Settings</span>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          handleSignOut()
                          setMobileMenuOpen(false)
                        }}
                        className="justify-start h-12 px-3 mt-4 touch-manipulation"
                      >
                        <span className="text-base">Sign Out</span>
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-3">
                      <Button
                        variant="ghost"
                        asChild
                        className="justify-start h-12 px-3 touch-manipulation"
                      >
                        <Link 
                          href="/login"
                          onClick={() => setMobileMenuOpen(false)}
                          className="text-base"
                        >
                          Sign In
                        </Link>
                      </Button>
                      <Button
                        asChild
                        className="justify-start h-12 px-3 touch-manipulation"
                      >
                        <Link 
                          href="/register"
                          onClick={() => setMobileMenuOpen(false)}
                          className="text-base"
                        >
                          Sign Up
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}