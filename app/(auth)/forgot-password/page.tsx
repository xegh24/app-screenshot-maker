'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/auth'
import { Button } from '@/components/ui/Button'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const { resetPassword, isLoading, error, clearError } = useAuthStore()
  
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [validation, setValidation] = useState('')

  const validateEmail = (email: string) => {
    if (!email) {
      return 'Email is required'
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'Please enter a valid email address'
    }
    return ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const emailError = validateEmail(email)
    if (emailError) {
      setValidation(emailError)
      return
    }

    clearError()
    
    const { error } = await resetPassword(email)
    
    if (!error) {
      setIsSubmitted(true)
      // Redirect to verify email page with email and type
      router.push(`/verify-email?email=${encodeURIComponent(email)}&type=reset`)
    }
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    if (validation) {
      setValidation('')
    }
    clearError()
  }

  if (isSubmitted) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Check your email</h1>
          <p className="mt-2 text-gray-600">
            We've sent a password reset link to <strong>{email}</strong>
          </p>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600 mb-4">
            Didn't receive the email? Check your spam folder or{' '}
            <button
              onClick={() => setIsSubmitted(false)}
              className="text-indigo-600 hover:text-indigo-500 underline"
            >
              try again
            </button>
          </p>
          
          <Link
            href="/login"
            className="text-indigo-600 hover:text-indigo-500 font-medium"
          >
            ← Back to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Forgot your password?</h1>
        <p className="mt-2 text-gray-600">
          No worries! Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
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
              className={`w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                validation 
                  ? 'border-red-300 bg-red-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              placeholder="Enter your email address"
              value={email}
              onChange={handleEmailChange}
              disabled={isLoading}
            />
            {validation && (
              <p className="mt-1 text-sm text-red-600">{validation}</p>
            )}
            <p className="mt-2 text-xs text-gray-500">
              We'll send a password reset link to this email address.
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending reset link...
              </div>
            ) : (
              'Send reset link'
            )}
          </Button>
        </form>
      </div>

      {/* Footer */}
      <div className="text-center space-y-4">
        <p className="text-sm text-gray-600">
          Remember your password?{' '}
          <Link 
            href="/login" 
            className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
          >
            Back to sign in
          </Link>
        </p>
        
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <Link 
            href="/register" 
            className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
          >
            Sign up for free
          </Link>
        </p>
      </div>
    </div>
  )
}