import { create } from 'zustand';
import { Playlist, AudioFile } from '../types';

interface PlaylistState {
  // Playlists
  playlists: Playlist[];
  currentPlaylist: Playlist | null;
  publicPlaylists: Playlist[];
  
  // Audios
  audios: AudioFile[];
  currentAudio: AudioFile | null;
  
  // UI State
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setPlaylists: (playlists: Playlist[]) => void;
  setPublicPlaylists: (playlists: Playlist[]) => void;
  setCurrentPlaylist: (playlist: Playlist | null) => void;
  setAudios: (audios: AudioFile[]) => void;
  setCurrentAudio: (audio: AudioFile | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Playlist actions
  createPlaylist: (playlist: Omit<Playlist, 'id' | 'createdAt' | 'updatedAt' | 'audioCount'>) => void;
  updatePlaylist: (id: string, updates: Partial<Playlist>) => void;
  deletePlaylist: (id: string) => void;
  
  // Audio actions
  addAudio: (audio: Omit<AudioFile, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateAudio: (id: string, updates: Partial<AudioFile>) => void;
  deleteAudio: (id: string) => void;
  
  // Computed
  getPlaylistById: (id: string) => Playlist | null;
  getAudiosByPlaylistId: (playlistId: string) => AudioFile[];
  getPublicPlaylists: () => Playlist[];
  getUserPlaylists: (userId: string) => Playlist[];
}

// Sample data
const samplePlaylists: Playlist[] = [
  {
    id: '1',
    name: 'English Conversations',
    description: 'Practice everyday English conversations with native speakers',
    visibility: 'public',
    ownerId: 'current-user-id',
    coverImage: undefined,
    audioCount: 3,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: '2',
    name: 'Business English',
    description: 'Professional English for workplace communication',
    visibility: 'protected',
    ownerId: 'current-user-id',
    coverImage: undefined,
    audioCount: 2,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-18'),
  },
  {
    id: '3',
    name: 'Academic Listening',
    description: 'University lectures and academic discussions',
    visibility: 'private',
    ownerId: 'current-user-id',
    coverImage: undefined,
    audioCount: 1,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-12'),
  },
];

const sampleAudios: AudioFile[] = [
  {
    id: '1',
    name: 'Daily Conversation - Greetings',
    url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', // Placeholder URL
    duration: 120,
    playlistId: '1',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    name: 'Business Meeting - Introductions',
    url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', // Placeholder URL
    duration: 180,
    playlistId: '1',
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-16'),
  },
  {
    id: '3',
    name: 'Phone Call Practice',
    url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', // Placeholder URL
    duration: 150,
    playlistId: '1',
    createdAt: new Date('2024-01-17'),
    updatedAt: new Date('2024-01-17'),
  },
  {
    id: '4',
    name: 'Job Interview Questions',
    url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', // Placeholder URL
    duration: 200,
    playlistId: '2',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
  },
  {
    id: '5',
    name: 'Presentation Skills',
    url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', // Placeholder URL
    duration: 160,
    playlistId: '2',
    createdAt: new Date('2024-01-11'),
    updatedAt: new Date('2024-01-11'),
  },
  {
    id: '6',
    name: 'University Lecture - Economics',
    url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', // Placeholder URL
    duration: 300,
    playlistId: '3',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05'),
  },
];

export const usePlaylistStore = create<PlaylistState>((set, get) => ({
  // Initial state
  playlists: samplePlaylists,
  currentPlaylist: null,
  publicPlaylists: samplePlaylists.filter(p => p.visibility === 'public'),
  audios: sampleAudios,
  currentAudio: null,
  isLoading: false,
  error: null,
  
  // Actions
  setPlaylists: (playlists) => set({ playlists }),
  setPublicPlaylists: (playlists) => set({ publicPlaylists: playlists }),
  setCurrentPlaylist: (playlist) => set({ currentPlaylist: playlist }),
  setAudios: (audios) => set({ audios }),
  setCurrentAudio: (audio) => set({ currentAudio: audio }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  
  // Playlist actions
  createPlaylist: (playlistData) => {
    const newPlaylist: Playlist = {
      ...playlistData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
      audioCount: 0,
    };
    
    set((state) => ({
      playlists: [...state.playlists, newPlaylist],
      currentPlaylist: newPlaylist,
    }));
  },
  
  updatePlaylist: (id, updates) => {
    set((state) => ({
      playlists: state.playlists.map((playlist) =>
        playlist.id === id
          ? { ...playlist, ...updates, updatedAt: new Date() }
          : playlist
      ),
      currentPlaylist: state.currentPlaylist?.id === id
        ? { ...state.currentPlaylist, ...updates, updatedAt: new Date() }
        : state.currentPlaylist,
    }));
  },
  
  deletePlaylist: (id) => {
    set((state) => ({
      playlists: state.playlists.filter((playlist) => playlist.id !== id),
      currentPlaylist: state.currentPlaylist?.id === id ? null : state.currentPlaylist,
      audios: state.audios.filter((audio) => audio.playlistId !== id),
    }));
  },
  
  // Audio actions
  addAudio: (audioData) => {
    const newAudio: AudioFile = {
      ...audioData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    set((state) => ({
      audios: [...state.audios, newAudio],
      playlists: state.playlists.map((playlist) =>
        playlist.id === audioData.playlistId
          ? { ...playlist, audioCount: playlist.audioCount + 1, updatedAt: new Date() }
          : playlist
      ),
    }));
  },
  
  updateAudio: (id, updates) => {
    set((state) => ({
      audios: state.audios.map((audio) =>
        audio.id === id
          ? { ...audio, ...updates, updatedAt: new Date() }
          : audio
      ),
      currentAudio: state.currentAudio?.id === id
        ? { ...state.currentAudio, ...updates, updatedAt: new Date() }
        : state.currentAudio,
    }));
  },
  
  deleteAudio: (id) => {
    set((state) => {
      const audioToDelete = state.audios.find((audio) => audio.id === id);
      return {
        audios: state.audios.filter((audio) => audio.id !== id),
        playlists: state.playlists.map((playlist) =>
          playlist.id === audioToDelete?.playlistId
            ? { ...playlist, audioCount: Math.max(0, playlist.audioCount - 1), updatedAt: new Date() }
            : playlist
        ),
        currentAudio: state.currentAudio?.id === id ? null : state.currentAudio,
      };
    });
  },
  
  // Computed
  getPlaylistById: (id) => {
    const { playlists } = get();
    return playlists.find((playlist) => playlist.id === id) || null;
  },
  
  getAudiosByPlaylistId: (playlistId) => {
    const { audios } = get();
    return audios.filter((audio) => audio.playlistId === playlistId);
  },
  
  getPublicPlaylists: () => {
    const { playlists } = get();
    return playlists.filter((playlist) => playlist.visibility === 'public');
  },
  
  getUserPlaylists: (userId) => {
    const { playlists } = get();
    return playlists.filter((playlist) => playlist.ownerId === userId);
  },
}));
