import { create } from 'zustand'
import { supabase, SocialProvider } from '../lib/supabase'
import { User, Session, AuthError } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  session: Session | null
  isLoading: boolean
  error: string | null
  
  signUp: (email: string, password: string, displayName?: string) => Promise<{ success: boolean; needsConfirmation?: boolean; error?: string }>
  signIn: (email: string, password: string) => Promise<void>
  signInWithSocial: (provider: SocialProvider) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<void>
  initializeAuth: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isLoading: true,
  error: null,
  
  signUp: async (email, password, displayName) => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { 
            display_name: displayName,
            full_name: displayName 
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (error) throw error
      
      // Check if user was created but needs email confirmation
      if (data.user && !data.session) {
        // User created but needs email confirmation
        return { success: true, needsConfirmation: true }
      } else if (data.user && data.session) {
        // User created and automatically signed in
        set({ user: data.user, session: data.session })
        return { success: true, needsConfirmation: false }
      } else {
        // Something went wrong
        throw new Error('Failed to create account')
      }
    } catch (error: any) {
      set({ error: error.message || 'Sign up failed' })
      return { success: false, error: error.message }
    } finally {
      set({ isLoading: false })
    }
  },
  
  signIn: async (email, password) => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      
      set({ user: data.user, session: data.session })
    } catch (error: any) {
      set({ error: error.message || 'Sign in failed' })
    } finally {
      set({ isLoading: false })
    }
  },

  signInWithSocial: async (provider) => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (error) throw error
      
      // For OAuth, the user will be redirected to the provider
      // The session will be handled in the callback
    } catch (error: any) {
      set({ error: error.message || `${provider} sign in failed` })
      set({ isLoading: false })
    }
  },
  
  signOut: async () => {
    set({ isLoading: true })
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      set({ user: null, session: null })
    } catch (error: any) {
      set({ error: error.message || 'Sign out failed' })
    } finally {
      set({ isLoading: false })
    }
  },
  
  updateProfile: async (updates) => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase.auth.updateUser(updates)
      if (error) throw error
      
      set({ user: data.user })
    } catch (error: any) {
      set({ error: error.message || 'Profile update failed' })
    } finally {
      set({ isLoading: false })
    }
  },
  
  initializeAuth: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      set({ session, user: session?.user ?? null, isLoading: false })
      
      supabase.auth.onAuthStateChange((event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        set({ session, user: session?.user ?? null })
      })
    } catch (error: any) {
      console.error('Auth initialization error:', error)
      set({ isLoading: false })
    }
  },
  
  clearError: () => set({ error: null })
}))
