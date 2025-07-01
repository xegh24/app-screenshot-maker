'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/auth'
import { Button } from '@/components/ui/Button'

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signUp, resetPassword, isLoading, error, clearError } = useAuthStore()
  
  const [isResending, setIsResending] = useState(false)
  const [resendMessage, setResendMessage] = useState('')
  
  const email = searchParams.get('email') || ''
  const type = searchParams.get('type') || 'signup' // 'signup' or 'reset'

  const handleResendEmail = async () => {
    if (!email) {
      setResendMessage('Please provide your email address to resend verification.')
      return
    }

    clearError()
    setIsResending(true)
    setResendMessage('')

    try {
      if (type === 'reset') {
        const { error } = await resetPassword(email)
        if (error) {
          setResendMessage(`Error: ${error.message}`)
        } else {
          setResendMessage('Password reset email sent! Please check your inbox.')
        }
      } else {
        // For signup, we need to call signUp again to resend verification
        const { error } = await signUp(email, 'temp-password') // This will just resend verification
        if (error && !error.message.includes('already registered')) {
          setResendMessage(`Error: ${error.message}`)
        } else {
          setResendMessage('Verification email sent! Please check your inbox.')
        }
      }
    } catch (err) {
      setResendMessage('Failed to resend email. Please try again.')
    } finally {
      setIsResending(false)
    }
  }

  const getTitle = () => {
    switch (type) {
      case 'reset':
        return 'Check your email for password reset'
      default:
        return 'Check your email to verify your account'
    }
  }

  const getDescription = () => {
    switch (type) {
      case 'reset':
        return `We've sent a password reset link to ${email || 'your email address'}. Click the link in the email to reset your password.`
      default:
        return `We've sent a verification link to ${email || 'your email address'}. Click the link in the email to verify your account and get started.`
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-6">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
          {/* Icon */}
          <div className="mb-6">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {getTitle()}
          </h1>

          {/* Description */}
          <p className="text-gray-600 mb-6 leading-relaxed">
            {getDescription()}
          </p>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Resend Message */}
          {resendMessage && (
            <div className={`border rounded-lg p-4 mb-6 ${
              resendMessage.startsWith('Error') 
                ? 'bg-red-50 border-red-200' 
                : 'bg-green-50 border-green-200'
            }`}>
              <p className={`text-sm ${
                resendMessage.startsWith('Error') 
                  ? 'text-red-800' 
                  : 'text-green-800'
              }`}>
                {resendMessage}
              </p>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-medium text-gray-900 mb-2">What to do next:</h3>
            <ol className="text-sm text-gray-600 space-y-1">
              <li>1. Check your email inbox</li>
              <li>2. Look for an email from App Screenshot Maker</li>
              <li>3. Click the verification link in the email</li>
              <li>4. {type === 'reset' ? 'Create your new password' : 'Sign in to your account'}</li>
            </ol>
          </div>

          {/* Resend Button */}
          <Button
            onClick={handleResendEmail}
            disabled={isResending || isLoading}
            variant="outline"
            className="w-full mb-4"
          >
            {isResending ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </div>
            ) : (
              `Resend ${type === 'reset' ? 'password reset' : 'verification'} email`
            )}
          </Button>

          {/* Footer Links */}
          <div className="space-y-2 text-sm">
            <p className="text-gray-600">
              Didn't receive the email? Check your spam folder or{' '}
              <button
                onClick={handleResendEmail}
                className="text-indigo-600 hover:text-indigo-500 underline"
                disabled={isResending || isLoading}
              >
                try again
              </button>
            </p>
            
            <div className="pt-4 border-t border-gray-200">
              <Link
                href={type === 'reset' ? '/login' : '/register'}
                className="text-indigo-600 hover:text-indigo-500 font-medium"
              >
                ← Back to {type === 'reset' ? 'sign in' : 'sign up'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}