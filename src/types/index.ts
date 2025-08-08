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
  duration: number;
  playlistId: string;
  createdAt: Date;
  updatedAt: Date;
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
  description: string;
  visibility: PlaylistVisibility;
  ownerId: string;
  coverImage?: string;
  audioCount: number;
  createdAt: Date;
  updatedAt: Date;
  invitedUsers?: string[]; // For protected playlists
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
} 