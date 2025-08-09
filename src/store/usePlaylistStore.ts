import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { Playlist, AudioFile, PlaylistVisibility } from '../types'

interface PlaylistState {
  playlists: Playlist[]
  currentPlaylist: Playlist | null
  audios: AudioFile[]
  isLoading: boolean
  error: string | null
  publicPlaylists: Playlist[]
  
  // Existing methods...
  
  // New Supabase methods
  fetchUserPlaylists: () => Promise<void>
  createPlaylistSupabase: (playlist: {
    name: string;
    description?: string;
    visibility: PlaylistVisibility;
    cover_image?: string;
  }) => Promise<void>
  updatePlaylistSupabase: (id: string, updates: Partial<Playlist>) => Promise<void>
  deletePlaylistSupabase: (id: string) => Promise<void>
  fetchAudiosByPlaylist: (playlistId: string) => Promise<void>
  clearError: () => void
  
  // Additional methods needed by components
  getUserPlaylists: () => Playlist[]
  createPlaylist: (playlist: {
    name: string;
    description?: string;
    visibility: PlaylistVisibility;
    cover_image?: string;
  }) => Promise<void>
  updatePlaylist: (id: string, updates: Partial<Playlist>) => Promise<void>
  deletePlaylist: (id: string) => Promise<void>
  getAudiosByPlaylistId: (playlistId: string) => AudioFile[]
  getPlaylistById: (id: string) => Playlist | null
  getPublicPlaylists: () => Promise<void>
  setPublicPlaylists: (playlists: Playlist[]) => void
}

export const usePlaylistStore = create<PlaylistState>((set, get) => ({
  playlists: [],
  currentPlaylist: null,
  audios: [],
  isLoading: false,
  error: null,
  publicPlaylists: [],
  
  fetchUserPlaylists: async () => {
    set({ isLoading: true, error: null })
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')
      
      const { data, error } = await supabase
        .from('playlists')
        .select(`
          *,
          audios(count)
        `)
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      set({
        playlists: data?.map((playlist: any) => ({
          id: playlist.id,
          name: playlist.name,
          description: playlist.description,
          visibility: playlist.visibility,
          owner_id: playlist.owner_id,
          cover_image: playlist.cover_image,
          coverImage: playlist.cover_image,
          audio_count: playlist.audios?.[0]?.count || 0,
          audioCount: playlist.audios?.[0]?.count || 0,
          created_at: playlist.created_at,
          createdAt: playlist.created_at,
          updated_at: playlist.updated_at,
          updatedAt: playlist.updated_at,
          storage_key: playlist.storage_key,
          storage_url: playlist.storage_url,
          storage_provider: playlist.storage_provider,
          audio_ids: playlist.audio_ids || []
        })) || []
      })
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch playlists' })
    } finally {
      set({ isLoading: false })
    }
  },
  
  createPlaylistSupabase: async (playlistData) => {
    set({ isLoading: true, error: null })
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')
      
      let coverImageUrl = null
      let storageKey = null
      let storageProvider = null
      
      // Handle cover image upload if provided
      if (playlistData.cover_image && playlistData.cover_image.startsWith('data:')) {
        try {
          // Convert base64 to blob
          const response = await fetch(playlistData.cover_image)
          const blob = await response.blob()
          
          // Generate unique filename
          const fileName = `playlist-cover-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`
          const filePath = `${user.id}/playlists/${fileName}`
          
          // Upload to Supabase storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('audio-files')
            .upload(filePath, blob, {
              contentType: 'image/jpeg',
              upsert: false
            })
          
          if (uploadError) {
            console.error('Error uploading cover image:', uploadError)
          } else {
            // Get public URL
            const { data: { publicUrl } } = supabase.storage
              .from('audio-files')
              .getPublicUrl(filePath)
            
            coverImageUrl = publicUrl
            storageKey = filePath
            storageProvider = 'supabase'
          }
        } catch (uploadError) {
          console.error('Error processing cover image:', uploadError)
        }
      }
      
      const { data, error } = await supabase
        .from('playlists')
        .insert([{
          name: playlistData.name,
          description: playlistData.description,
          visibility: playlistData.visibility,
          owner_id: user.id,
          cover_image: coverImageUrl,
          storage_key: storageKey,
          storage_provider: storageProvider,
          storage_url: coverImageUrl,
          audio_count: 0
        }])
        .select()
        .single()
      
      if (error) throw error
      
      set(state => ({
        playlists: [data, ...state.playlists]
      }))
    } catch (error: any) {
      set({ error: error.message || 'Failed to create playlist' })
    } finally {
      set({ isLoading: false })
    }
  },
  
  updatePlaylistSupabase: async (id, updates) => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('playlists')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      
      set(state => ({
        playlists: state.playlists.map(p => 
          p.id === id ? { ...p, ...data } : p
        )
      }))
    } catch (error: any) {
      set({ error: error.message || 'Failed to update playlist' })
    } finally {
      set({ isLoading: false })
    }
  },
  
  deletePlaylistSupabase: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const { error } = await supabase
        .from('playlists')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      set(state => ({
        playlists: state.playlists.filter(p => p.id !== id)
      }))
    } catch (error: any) {
      set({ error: error.message || 'Failed to delete playlist' })
    } finally {
      set({ isLoading: false })
    }
  },
  
  fetchAudiosByPlaylist: async (playlistId) => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('audios')
        .select('*')
        .eq('playlist_id', playlistId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      set({ audios: data || [] })
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch audios' })
    } finally {
      set({ isLoading: false })
    }
  },
  
  clearError: () => set({ error: null }),
  
  // Additional methods needed by components
  getUserPlaylists: () => get().playlists,
  createPlaylist: async (playlistData) => {
    set({ isLoading: true, error: null })
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')
      
      console.log('Creating playlist with data:', playlistData)
      
      let coverImageUrl = null
      let storageKey = null
      let storageProvider = null
      
      // Handle cover image upload if provided
      if (playlistData.cover_image && playlistData.cover_image.startsWith('data:')) {
        try {
          // Convert base64 to blob
          const response = await fetch(playlistData.cover_image)
          const blob = await response.blob()
          
          // Generate unique filename
          const fileName = `playlist-cover-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`
          const filePath = `${user.id}/playlists/${fileName}`
          
          console.log('Uploading cover image to:', filePath)
          
          // Upload to Supabase storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('audio-files')
            .upload(filePath, blob, {
              contentType: 'image/jpeg',
              upsert: false
            })
          
          if (uploadError) {
            console.error('Error uploading cover image:', uploadError)
          } else {
            // Get public URL
            const { data: { publicUrl } } = supabase.storage
              .from('audio-files')
              .getPublicUrl(filePath)
            
            coverImageUrl = publicUrl
            storageKey = filePath
            storageProvider = 'supabase'
            console.log('Cover image uploaded successfully:', publicUrl)
          }
        } catch (uploadError) {
          console.error('Error processing cover image:', uploadError)
        }
      }
      
      const insertData = {
        name: playlistData.name,
        description: playlistData.description,
        visibility: playlistData.visibility,
        owner_id: user.id,
        cover_image: coverImageUrl,
        storage_key: storageKey,
        storage_provider: storageProvider,
        storage_url: coverImageUrl,
        audio_count: 0
      }
      
      console.log('Inserting playlist data:', insertData)
      
      const { data, error } = await supabase
        .from('playlists')
        .insert([insertData])
        .select()
        .single()
      
      if (error) {
        console.error('Supabase insert error:', error)
        throw error
      }
      
      console.log('Playlist created successfully:', data)
      
      set(state => ({
        playlists: [data, ...state.playlists]
      }))
    } catch (error: any) {
      console.error('Error creating playlist:', error)
      set({ error: error.message || 'Failed to create playlist' })
    } finally {
      set({ isLoading: false })
    }
  },
  updatePlaylist: async (id, updates) => {
    set({ isLoading: true, error: null })
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Handle cover image update if provided
      let coverImageUrl = undefined
      let storageKey = undefined
      let storageProvider = undefined

      if (updates.cover_image && updates.cover_image.startsWith('data:')) {
        try {
          // Convert base64 to blob
          const response = await fetch(updates.cover_image)
          const blob = await response.blob()
          
          // Generate unique filename
          const fileName = `playlist-cover-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`
          const filePath = `${user.id}/playlists/${fileName}`
          
          // Upload to Supabase storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('audio-files')
            .upload(filePath, blob, {
              contentType: 'image/jpeg',
              upsert: false
            })
          
          if (uploadError) {
            console.error('Error uploading cover image:', uploadError)
          } else {
            // Get public URL
            const { data: { publicUrl } } = supabase.storage
              .from('audio-files')
              .getPublicUrl(filePath)
            
            coverImageUrl = publicUrl
            storageKey = filePath
            storageProvider = 'supabase'
          }
        } catch (uploadError) {
          console.error('Error processing cover image:', uploadError)
        }
      }

      const updateData: any = {
        name: updates.name,
        description: updates.description,
        visibility: updates.visibility,
        updated_at: new Date().toISOString()
      }

      if (coverImageUrl !== undefined) {
        updateData.cover_image = coverImageUrl
        updateData.storage_key = storageKey
        updateData.storage_provider = storageProvider
        updateData.storage_url = coverImageUrl
      }

      const { data, error } = await supabase
        .from('playlists')
        .update(updateData)
        .eq('id', id)
        .eq('owner_id', user.id)
        .select()
        .single()
      
      if (error) throw error
      
      set(state => ({
        playlists: state.playlists.map(p => p.id === id ? {
          ...p,
          ...data,
          coverImage: data.cover_image,
          audioCount: data.audio_ids?.length || 0,
          audio_count: data.audio_ids?.length || 0,
          createdAt: data.created_at,
          updatedAt: data.updated_at
        } : p)
      }))
    } catch (error: any) {
      set({ error: error.message || 'Failed to update playlist' })
    } finally {
      set({ isLoading: false })
    }
  },
  deletePlaylist: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // First, get the playlist to check storage key for cover image
      const { data: playlist } = await supabase
        .from('playlists')
        .select('storage_key')
        .eq('id', id)
        .eq('owner_id', user.id)
        .single()

      if (playlist?.storage_key) {
        // Delete cover image from storage
        await supabase.storage
          .from('audio-files')
          .remove([playlist.storage_key])
      }

      // Delete the playlist
      const { error } = await supabase
        .from('playlists')
        .delete()
        .eq('id', id)
        .eq('owner_id', user.id)
      
      if (error) throw error
      
      set(state => ({
        playlists: state.playlists.filter(p => p.id !== id)
      }))
    } catch (error: any) {
      set({ error: error.message || 'Failed to delete playlist' })
    } finally {
      set({ isLoading: false })
    }
  },
  getAudiosByPlaylistId: (playlistId) => get().audios.filter(audio => audio.playlist_id === playlistId),
  getPlaylistById: (id) => get().playlists.find(p => p.id === id) || null,
  getPublicPlaylists: async () => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('playlists')
        .select('*')
        .eq('visibility', 'public')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      set({
        publicPlaylists: (data || []).map((playlist: any) => ({
          id: playlist.id,
          name: playlist.name,
          description: playlist.description,
          visibility: playlist.visibility,
          owner_id: playlist.owner_id,
          cover_image: playlist.cover_image,
          coverImage: playlist.cover_image,
          audio_count: 0,
          audioCount: 0,
          created_at: playlist.created_at,
          createdAt: playlist.created_at,
          updated_at: playlist.updated_at,
          updatedAt: playlist.updated_at,
          storage_key: playlist.storage_key,
          storage_url: playlist.storage_url,
          storage_provider: playlist.storage_provider,
          audio_ids: playlist.audio_ids || []
        }))
      })
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch public playlists' })
    } finally {
      set({ isLoading: false })
    }
  },
  setPublicPlaylists: (playlists) => set({ publicPlaylists: playlists })
}))
