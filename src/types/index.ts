export interface SubtitleEntry {
  id: number;
  startTime: number;
  endTime: number;
  text: string;
  speed?: number; // Optional speed override for this sentence
  volume?: number; // Optional volume override for this sentence (0-1)
}

export interface AudioFile {
  id: string;
  name: string;
  url: string;
  duration?: number;
  file_size?: number;
  playlist_id: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export type PracticeMode = 'listening' | 'dictation' | 'shadowing';

export interface DictationEntry {
  id: number;
  originalText: string;
  userInput: string;
  isCorrect: boolean;
}

export interface ShadowingEntry {
  id: number;
  originalText: string;
  audioBlob?: Blob;
  audioUrl?: string;
}

export type PlaylistVisibility = 'public' | 'protected' | 'private';

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  visibility: PlaylistVisibility;
  owner_id: string;
  cover_image?: string;
  coverImage?: string; // Add both versions for compatibility
  audio_count?: number;
  audioCount?: number; // Add both versions for compatibility
  created_at: string;
  createdAt?: string; // Add both versions for compatibility
  updated_at: string;
  updatedAt?: string; // Add both versions for compatibility
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
} 