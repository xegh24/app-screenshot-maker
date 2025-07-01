import Link from 'next/link'
import { LoginForm } from '@/components/auth/LoginForm'

export const metadata = {
  title: 'Sign In - App Screenshot Maker',
  description: 'Sign in to your account to access your designs and templates',
}

export default function LoginPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back</h1>
        <p className="mt-2 text-gray-600">
          Sign in to your account to continue creating amazing screenshots
        </p>
      </div>

      {/* Login Form */}
      <LoginForm />

      {/* Footer */}
      <div className="text-center space-y-4">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <Link 
            href="/register" 
            className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
          >
            Sign up for free
          </Link>
        </p>
        
        <div className="text-xs text-gray-500">
          By signing in, you agree to our{' '}
          <Link href="/terms" className="underline hover:text-gray-700">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="underline hover:text-gray-700">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  )
}