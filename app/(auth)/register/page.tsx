import Link from 'next/link'
import { RegisterForm } from '@/components/auth/RegisterForm'

export const metadata = {
  title: 'Sign Up - App Screenshot Maker',
  description: 'Create your account to start making professional app screenshots',
}

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Create your account</h1>
        <p className="mt-2 text-gray-600">
          Join thousands of developers creating stunning app screenshots
        </p>
      </div>

      {/* Register Form */}
      <RegisterForm />

      {/* Footer */}
      <div className="text-center space-y-4">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link 
            href="/login" 
            className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
          >
            Sign in instead
          </Link>
        </p>
        
        <div className="text-xs text-gray-500">
          By creating an account, you agree to our{' '}
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