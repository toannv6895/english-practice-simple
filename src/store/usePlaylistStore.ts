import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { Playlist, AudioFile } from '../types'

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
  createPlaylistSupabase: (playlist: Omit<Playlist, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  updatePlaylistSupabase: (id: string, updates: Partial<Playlist>) => Promise<void>
  deletePlaylistSupabase: (id: string) => Promise<void>
  fetchAudiosByPlaylist: (playlistId: string) => Promise<void>
  clearError: () => void
  
  // Additional methods needed by components
  getUserPlaylists: () => Playlist[]
  createPlaylist: (playlist: Omit<Playlist, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
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
          ...playlist,
          audio_count: playlist.audios?.[0]?.count || 0
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
      
      const { data, error } = await supabase
        .from('playlists')
        .insert([{
          ...playlistData,
          owner_id: user.id
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
      
      const { data, error } = await supabase
        .from('playlists')
        .insert([{
          ...playlistData,
          owner_id: user.id
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
  updatePlaylist: async (id, updates) => {
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
  deletePlaylist: async (id) => {
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
  getAudiosByPlaylistId: (playlistId) => get().audios.filter(audio => audio.playlist_id === playlistId),
  getPlaylistById: (id) => get().playlists.find(p => p.id === id) || null,
  getPublicPlaylists: async () => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('playlists')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      set({ publicPlaylists: data || [] })
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch public playlists' })
    } finally {
      set({ isLoading: false })
    }
  },
  setPublicPlaylists: (playlists) => set({ publicPlaylists: playlists })
}))
