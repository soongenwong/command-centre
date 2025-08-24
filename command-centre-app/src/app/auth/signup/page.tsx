'use client'

import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Target } from 'lucide-react'
import Link from 'next/link'

export default function SignUp() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession()
      if (session) {
        router.push('/dashboard')
      }
    }
    checkSession()
  }, [router])

  const handleGoogleSignUp = async () => {
    setIsLoading(true)
    try {
      await signIn('google', { callbackUrl: '/dashboard' })
    } catch (error) {
      console.error('Sign up error:', error)
    } finally {
      setIsLoading(false)
    }
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
            <CardTitle className="text-2xl">Get Started</CardTitle>
            <CardDescription>
              Create your account and start tracking your goals today
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleGoogleSignUp}
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? 'Creating account...' : 'Sign up with Google'}
            </Button>
            
            <div className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/auth/signin" className="text-orange-600 hover:underline">
                Sign in
              </Link>
            </div>

            <div className="text-xs text-gray-500 text-center mt-4">
              By signing up, you agree to our{' '}
              <Link href="/terms" className="text-orange-600 hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-orange-600 hover:underline">
                Privacy Policy
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
