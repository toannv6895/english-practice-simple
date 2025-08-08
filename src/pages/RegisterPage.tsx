import React, { useState, useEffect } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { useNavigate, Link } from 'react-router-dom'
import { SocialLoginButtons } from '../components/SocialLoginButtons'

export const RegisterPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [isSuccess, setIsSuccess] = useState(false)
  const { signUp, error, isLoading, clearError } = useAuthStore()
  const navigate = useNavigate()
  
  useEffect(() => {
    clearError()
  }, [clearError])
  
  const validateForm = () => {
    const errors: string[] = []
    
    if (!email) errors.push('Email is required')
    if (!password) errors.push('Password is required')
    if (password.length < 6) errors.push('Password must be at least 6 characters')
    if (password !== confirmPassword) errors.push('Passwords do not match')
    if (!displayName.trim()) errors.push('Display name is required')
    
    setValidationErrors(errors)
    return errors.length === 0
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    const result = await signUp(email, password, displayName)
    
    // Check if signup was successful
    if (result.success) {
      setIsSuccess(true)
      // Redirect to login page after a short delay
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: result.needsConfirmation 
              ? 'Registration successful! Please check your email to confirm your account, then sign in.'
              : 'Registration successful! Please sign in with your new account.'
          }
        })
      }, 2000)
    }
  }
  
  // Show success message if registration was successful
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Registration Successful!
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Please check your email to confirm your account, then sign in.
            </p>
            <div className="mt-4">
              <Link
                to="/login"
                className="font-medium text-teal-600 hover:text-teal-500"
              >
                Go to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              to="/login"
              className="font-medium text-teal-600 hover:text-teal-500"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="displayName" className="sr-only">
                Display Name
              </label>
              <input
                id="displayName"
                name="displayName"
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm"
                placeholder="Display Name"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm"
                placeholder="Confirm Password"
              />
            </div>
          </div>
          
          {(error || validationErrors.length > 0) && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {error && <div>{error}</div>}
              {validationErrors.map((err, index) => (
                <div key={index}>{err}</div>
              ))}
            </div>
          )}
          
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating account...
                </div>
              ) : (
                'Create account'
              )}
            </button>
          </div>
        </form>

        <SocialLoginButtons mode="register" />
      </div>
    </div>
  )
}
