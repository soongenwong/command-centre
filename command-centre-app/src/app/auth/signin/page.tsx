'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Target } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/components/providers/auth-provider'

export default function SignIn() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  const handleGoogleSignIn = async () => {
    if (typeof window === 'undefined') return
    
    setIsLoading(true)
    try {
      const { supabase } = await import('@/lib/supabaseClient')
      if (!supabase) {
        alert('Authentication service not configured. Please check your environment variables.')
        return
      }
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      })
      if (error) {
        console.error('Sign in error:', error)
        alert('Error signing in: ' + error.message)
      }
    } catch (error) {
      console.error('Sign in error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <Target className="h-12 w-12 text-orange-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 text-2xl font-bold text-gray-900">
            <Target className="h-8 w-8 text-orange-600" />
            <span>Command Centre</span>
          </Link>
        </div>

        <Card className="border-orange-100">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to your account to continue tracking your goals
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? 'Signing in...' : 'Continue with Google'}
            </Button>
            
            <div className="text-center text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <Link href="/auth/signup" className="text-orange-600 hover:underline">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <Link href="/" className="text-sm text-gray-600 hover:text-orange-600">
            ← Back to homepage
          </Link>
        </div>
      </div>
    </div>
  )
}
