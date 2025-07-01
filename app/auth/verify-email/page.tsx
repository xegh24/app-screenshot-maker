'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  useEffect(() => {
    const token_hash = searchParams.get('token_hash')
    const type = searchParams.get('type')
    const next = searchParams.get('next') ?? '/'
    
    if (token_hash && type) {
      // Redirect to callback with the same parameters
      const callbackUrl = `/callback?token_hash=${token_hash}&type=${type}&next=${encodeURIComponent(next)}`
      router.push(callbackUrl)
    } else {
      // No token, redirect to login
      router.push('/login')
    }
  }, [router, searchParams])
  
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">Verifying your email...</p>
      </div>
    </div>
  )
}