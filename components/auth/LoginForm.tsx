'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/auth'
import { Button } from '@/components/ui/Button'

export function LoginForm() {
  const router = useRouter()
  const { signIn, signInWithProvider, isLoading, error, clearError, isAuthenticated } = useAuthStore()
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  })
  
  const [validation, setValidation] = useState({
    email: '',
    password: '',
  })

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      router.replace('/dashboard')
    }
  }, [isAuthenticated, router])

  // Clear errors when component mounts or form data changes
  useEffect(() => {
    clearError()
  }, [formData, clearError])

  const validateForm = () => {
    const errors = {
      email: '',
      password: '',
    }

    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address'
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters'
    }

    setValidation(errors)
    return !Object.values(errors).some(error => error)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Login form submitted', formData)
    
    if (!validateForm()) {
      console.log('Validation failed')
      return
    }

    console.log('Calling signIn...')
    const { error } = await signIn(formData.email, formData.password)
    console.log('SignIn result:', { error })
    
    if (!error) {
      console.log('Login successful, redirecting to dashboard...')
      router.push('/dashboard')
    } else {
      console.log('Login failed:', error)
    }
  }

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    await signInWithProvider(provider)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Clear validation error for this field
    if (validation[name as keyof typeof validation]) {
      setValidation(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8 border border-gray-100 w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Global Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className={`w-full px-4 py-3 sm:py-3 min-h-[48px] border rounded-lg text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors touch-manipulation ${
              validation.email 
                ? 'border-red-300 bg-red-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleInputChange}
            disabled={isLoading}
          />
          {validation.email && (
            <p className="mt-1 text-sm text-red-600">{validation.email}</p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className={`w-full px-4 py-3 sm:py-3 min-h-[48px] border rounded-lg text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors touch-manipulation ${
              validation.password 
                ? 'border-red-300 bg-red-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleInputChange}
            disabled={isLoading}
          />
          {validation.password && (
            <p className="mt-1 text-sm text-red-600">{validation.password}</p>
          )}
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center">
            <input
              id="rememberMe"
              name="rememberMe"
              type="checkbox"
              className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded touch-manipulation"
              checked={formData.rememberMe}
              onChange={handleInputChange}
              disabled={isLoading}
            />
            <label htmlFor="rememberMe" className="ml-3 block text-sm text-gray-700 cursor-pointer">
              Remember me
            </label>
          </div>

          <Link
            href="/auth/forgot-password"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors touch-manipulation"
          >
            Forgot your password?
          </Link>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation min-h-[48px]"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing in...
            </div>
          ) : (
            'Sign in'
          )}
        </Button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        {/* Social Login Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation min-h-[48px]"
            onClick={() => handleSocialLogin('google')}
            disabled={isLoading}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation min-h-[48px]"
            onClick={() => handleSocialLogin('github')}
            disabled={isLoading}
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            GitHub
          </Button>
        </div>
      </form>
    </div>
  )
}