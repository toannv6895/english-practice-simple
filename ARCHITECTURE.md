# Brownfield Architecture: Supabase Integration for English Practice App

## Executive Summary

This document outlines the brownfield architecture for integrating Supabase authentication and user data storage into the existing English practice application. The approach focuses on minimal disruption to the current codebase while adding robust user management and data persistence capabilities.

## Current State Analysis

### Existing Architecture
- **Frontend**: React 18 with TypeScript, Zustand for state management
- **Routing**: React Router DOM v7
- **UI**: Tailwind CSS with custom components
- **Data**: Currently using in-memory sample data with Zustand stores
- **Audio**: Local file handling with placeholder URLs

### Current Data Flow
```
User Action → Zustand Store → In-Memory Data → UI Update
```

## Target Architecture

### High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React App     │    │   Supabase      │    │   Supabase      │
│   (Frontend)    │◄──►│   Auth          │    │   Database      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Zustand       │    │   Row Level     │    │   Storage       │
│   Stores        │    │   Security      │    │   (Audio Files) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Integration Strategy

### 1. Authentication Layer Integration

#### 1.1 Supabase Client Setup
```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

#### 1.2 Authentication Store
```typescript
// src/store/useAuthStore.ts
interface AuthState {
  user: User | null
  session: Session | null
  isLoading: boolean
  error: string | null
  
  // Actions
  signUp: (email: string, password: string, displayName?: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<void>
}
```

#### 1.3 Authentication Context Provider
```typescript
// src/contexts/AuthContext.tsx
interface AuthContextType {
  user: User | null
  session: Session | null
  isLoading: boolean
  signUp: (email: string, password: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}
```

### 2. Database Schema Design

#### 2.1 Supabase Tables

**users (extends Supabase Auth)**
```sql
-- Extends Supabase Auth users table
ALTER TABLE auth.users ADD COLUMN display_name TEXT;
ALTER TABLE auth.users ADD COLUMN avatar_url TEXT;
```

**playlists**
```sql
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

-- RLS Policies
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;

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
```

**audios**
```sql
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

-- RLS Policies
ALTER TABLE audios ENABLE ROW LEVEL SECURITY;

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
```

### 3. Store Integration Strategy

#### 3.1 Enhanced Playlist Store
```typescript
// src/store/usePlaylistStore.ts (Enhanced)
interface PlaylistState {
  // Existing properties...
  
  // New Supabase integration
  fetchUserPlaylists: () => Promise<void>
  createPlaylistSupabase: (playlist: Omit<Playlist, 'id' | 'createdAt' | 'updatedAt' | 'audioCount'>) => Promise<void>
  updatePlaylistSupabase: (id: string, updates: Partial<Playlist>) => Promise<void>
  deletePlaylistSupabase: (id: string) => Promise<void>
  
  // Audio with Supabase
  fetchAudiosByPlaylist: (playlistId: string) => Promise<void>
  uploadAudioToSupabase: (file: File, playlistId: string) => Promise<void>
  deleteAudioFromSupabase: (id: string) => Promise<void>
}
```

#### 3.2 Data Migration Strategy
```typescript
// src/utils/dataMigration.ts
export const migrateLocalDataToSupabase = async (userId: string) => {
  // Migrate existing sample data to Supabase for new users
  const samplePlaylists = getSamplePlaylists()
  
  for (const playlist of samplePlaylists) {
    await createPlaylistInSupabase({
      ...playlist,
      ownerId: userId
    })
  }
}
```

### 4. Component Integration

#### 4.1 Authentication Components
```typescript
// src/components/auth/LoginForm.tsx
// src/components/auth/RegisterForm.tsx
// src/components/auth/UserProfile.tsx
// src/components/auth/ProtectedRoute.tsx
```

#### 4.2 Enhanced Navigation
```typescript
// src/components/Navigation.tsx (Enhanced)
interface NavigationProps {
  user: User | null
  onSignOut: () => void
}
```

### 5. Routing Strategy

#### 5.1 Protected Routes
```typescript
// src/components/ProtectedRoute.tsx
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth()
  
  if (isLoading) return <LoadingSpinner />
  if (!user) return <Navigate to="/login" replace />
  
  return <>{children}</>
}
```

#### 5.2 Updated App Routing
```typescript
// src/App.tsx (Enhanced)
const App = () => {
  const { user, isLoading } = useAuth()
  
  if (isLoading) return <LoadingSpinner />
  
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation user={user} />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } />
          <Route path="/playlist" element={
            <ProtectedRoute>
              <PlaylistPage />
            </ProtectedRoute>
          } />
          {/* Other protected routes... */}
        </Routes>
      </div>
    </Router>
  )
}
```

### 6. File Upload Integration

#### 6.1 Supabase Storage Setup
```typescript
// src/utils/storage.ts
export const uploadAudioFile = async (
  file: File, 
  userId: string, 
  playlistId: string
): Promise<string> => {
  const fileName = `${Date.now()}-${file.name}`
  const filePath = `${userId}/${playlistId}/${fileName}`
  
  const { data, error } = await supabase.storage
    .from('audios')
    .upload(filePath, file)
    
  if (error) throw error
  
  const { data: { publicUrl } } = supabase.storage
    .from('audios')
    .getPublicUrl(filePath)
    
  return publicUrl
}
```

#### 6.2 Enhanced File Upload Component
```typescript
// src/components/FileUpload.tsx (Enhanced)
const FileUpload = () => {
  const { user } = useAuth()
  const { uploadAudioToSupabase } = usePlaylistStore()
  
  const handleFileUpload = async (file: File, playlistId: string) => {
    try {
      await uploadAudioToSupabase(file, playlistId)
    } catch (error) {
      console.error('Upload failed:', error)
    }
  }
}
```

### 7. Error Handling Strategy

#### 7.1 Global Error Boundary
```typescript
// src/components/ErrorBoundary.tsx
class ErrorBoundary extends React.Component {
  // Implementation for catching and handling errors
}
```

#### 7.2 Supabase Error Handling
```typescript
// src/utils/errorHandling.ts
export const handleSupabaseError = (error: any): string => {
  if (error.code === 'PGRST116') {
    return 'You are not authorized to perform this action'
  }
  if (error.code === '23505') {
    return 'This item already exists'
  }
  return error.message || 'An unexpected error occurred'
}
```

### 8. Performance Optimization

#### 8.1 Data Caching Strategy
```typescript
// src/hooks/useCachedData.ts
export const useCachedData = <T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl: number = 5 * 60 * 1000 // 5 minutes
) => {
  // Implementation with localStorage caching
}
```

#### 8.2 Optimistic Updates
```typescript
// Enhanced store with optimistic updates
const createPlaylistOptimistic = (playlist: Playlist) => {
  // Update UI immediately
  set(state => ({ playlists: [...state.playlists, playlist] }))
  
  // Sync with Supabase
  createPlaylistSupabase(playlist).catch(error => {
    // Rollback on error
    set(state => ({ 
      playlists: state.playlists.filter(p => p.id !== playlist.id) 
    }))
  })
}
```

### 9. Migration Plan

#### Phase 1: Authentication Foundation (Week 1)
- [ ] Install Supabase dependencies
- [ ] Set up Supabase project and environment variables
- [ ] Create authentication store and context
- [ ] Implement login/register forms
- [ ] Add protected route wrapper

#### Phase 2: Database Integration (Week 2)
- [ ] Create database schema
- [ ] Set up RLS policies
- [ ] Implement data migration utilities
- [ ] Update playlist store with Supabase integration
- [ ] Add error handling

#### Phase 3: File Storage (Week 3)
- [ ] Set up Supabase Storage bucket
- [ ] Implement file upload functionality
- [ ] Update audio management with cloud storage
- [ ] Add file deletion with storage cleanup

#### Phase 4: UI/UX Enhancement (Week 4)
- [ ] Update navigation with user profile
- [ ] Add loading states and error messages
- [ ] Implement data caching
- [ ] Add optimistic updates
- [ ] Performance testing and optimization

### 10. Testing Strategy

#### 10.1 Unit Tests
```typescript
// src/__tests__/stores/usePlaylistStore.test.ts
describe('usePlaylistStore with Supabase', () => {
  test('should fetch user playlists from Supabase', async () => {
    // Test implementation
  })
})
```

#### 10.2 Integration Tests
```typescript
// src/__tests__/integration/auth.test.ts
describe('Authentication Flow', () => {
  test('should sign up user and create initial data', async () => {
    // Test implementation
  })
})
```

### 11. Security Considerations

#### 11.1 Row Level Security
- All tables have RLS enabled
- Policies ensure users only access their own data
- Automatic cleanup on user deletion

#### 11.2 File Security
- Storage bucket configured with proper permissions
- File paths include user ID for isolation
- Automatic cleanup of orphaned files

#### 11.3 Environment Variables
```bash
# .env.local
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 12. Monitoring and Analytics

#### 12.1 Error Tracking
```typescript
// src/utils/analytics.ts
export const trackError = (error: Error, context: string) => {
  // Send to error tracking service
}
```

#### 12.2 Usage Analytics
```typescript
// Track user actions for analytics
export const trackUserAction = (action: string, data?: any) => {
  // Send to analytics service
}
```

## Conclusion

This brownfield architecture provides a comprehensive plan for integrating Supabase authentication and user data storage into the existing English practice application. The approach minimizes disruption to the current codebase while adding robust user management capabilities.

The phased implementation ensures that each component can be developed and tested independently, reducing risk and allowing for iterative improvements based on user feedback.

Key benefits of this architecture:
- **Minimal disruption**: Existing functionality remains intact during migration
- **Scalable**: Built on Supabase's scalable infrastructure
- **Secure**: Comprehensive security with RLS and proper authentication
- **Maintainable**: Clear separation of concerns and well-defined interfaces
- **User-friendly**: Smooth migration path for existing users
