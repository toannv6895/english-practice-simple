import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { LoadingSpinner } from '../components/LoadingSpinner'

export const AuthCallbackPage = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          setError(error.message)
          setTimeout(() => {
            navigate('/login', { 
              state: { message: 'Authentication failed. Please try again.' }
            })
          }, 3000)
          return
        }

        if (data.session) {
          // Successful authentication
          navigate('/', { replace: true })
        } else {
          // No session found
          setError('Authentication failed')
          setTimeout(() => {
            navigate('/login', { 
              state: { message: 'Authentication failed. Please try again.' }
            })
          }, 3000)
        }
      } catch (err: any) {
        setError(err.message || 'Authentication failed')
        setTimeout(() => {
          navigate('/login', { 
            state: { message: 'Authentication failed. Please try again.' }
          })
        }, 3000)
      } finally {
        setIsLoading(false)
      }
    }

    handleAuthCallback()
  }, [navigate])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Completing authentication...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Authentication Failed
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {error}
          </p>
          <p className="mt-4 text-center text-sm text-gray-500">
            Redirecting to login page...
          </p>
        </div>
      </div>
    )
  }

  return null
}
