# Implementation Guide: Supabase Integration for English Practice App

## Overview
This guide provides a step-by-step implementation of Supabase authentication and storage integration for the English practice app. The implementation is divided into 4 phases with comprehensive testing and deployment checklists.

## Phase 1: Authentication Foundation

### Step 1: Install Dependencies
```bash
npm install @supabase/supabase-js
```

### Step 2: Environment Setup
Create `.env.local` in the root directory:
```bash
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Step 3: Supabase Client Setup
```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})
```

### Step 4: Authentication Store
```typescript
// src/store/useAuthStore.ts
import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { User, Session, AuthError } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  session: Session | null
  isLoading: boolean
  error: string | null
  
  signUp: (email: string, password: string, displayName?: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
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
          }
        }
      })
      
      if (error) throw error
      
      if (data.user && data.session) {
        set({ user: data.user, session: data.session })
      } else {
        set({ error: 'Please check your email to confirm your account' })
      }
    } catch (error: any) {
      set({ error: error.message || 'Sign up failed' })
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
```

### Step 5: Protected Route Component
```typescript
// src/components/ProtectedRoute.tsx
import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuthStore()
  const location = useLocation()
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  
  return <>{children}</>
}
```

### Step 6: Loading Component
```typescript
// src/components/LoadingSpinner.tsx
import React from 'react'

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  )
}
```

## Phase 2: Database Integration

### Step 1: Database Schema Creation
Run these SQL commands in your Supabase SQL editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create playlists table
CREATE TABLE playlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  visibility TEXT DEFAULT 'private' CHECK (visibility IN ('public', 'protected', 'private')),
  cover_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create audios table
CREATE TABLE audios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  duration INTEGER,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE audios ENABLE ROW LEVEL SECURITY;

-- RLS Policies for playlists
CREATE POLICY "Users can view own playlists"
ON playlists FOR SELECT
USING (owner_id = auth.uid());

CREATE POLICY "Users can insert own playlists"
ON playlists FOR INSERT
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update own playlists"
ON playlists FOR UPDATE
USING (owner_id = auth.uid());

CREATE POLICY "Users can delete own playlists"
ON playlists FOR DELETE
USING (owner_id = auth.uid());

-- RLS Policies for audios
CREATE POLICY "Users can view own audios"
ON audios FOR SELECT
USING (owner_id = auth.uid());

CREATE POLICY "Users can insert own audios"
ON audios FOR INSERT
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update own audios"
ON audios FOR UPDATE
USING (owner_id = auth.uid());

CREATE POLICY "Users can delete own audios"
ON audios FOR DELETE
USING (owner_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX idx_playlists_owner_id ON playlists(owner_id);
CREATE INDEX idx_audios_owner_id ON audios(owner_id);
CREATE INDEX idx_audios_playlist_id ON audios(playlist_id);
```

## Testing Checklist

### Authentication Tests
- [ ] User can register with valid email/password
- [ ] User cannot register with invalid email format
- [ ] User cannot register with weak password
- [ ] User can login with correct credentials
- [ ] User cannot login with wrong credentials
- [ ] User is redirected to login when accessing protected routes
- [ ] User session persists on page reload
- [ ] User can logout successfully
- [ ] Error messages are displayed correctly
- [ ] Loading states work properly

## Deployment Checklist

### Environment Variables
- [ ] Set REACT_APP_SUPABASE_URL in production
- [ ] Set REACT_APP_SUPABASE_ANON_KEY in production
- [ ] Verify environment variables are accessible
- [ ] Test environment variables in staging

### Supabase Setup
- [ ] Database schema is created
- [ ] RLS policies are enabled and tested
- [ ] Storage bucket is configured
- [ ] Storage policies are set correctly
- [ ] Database indexes are created for performance

### Security
- [ ] RLS policies are working correctly
- [ ] Users can only access their own data
- [ ] File uploads are secure
- [ ] Authentication tokens are handled properly
- [ ] No sensitive data in client-side code
