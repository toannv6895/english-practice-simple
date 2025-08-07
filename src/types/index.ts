export interface SubtitleEntry {
  id: number;
  startTime: number;
  endTime: number;
  text: string;
  speed?: number; // Optional speed override for this sentence
}

export interface AudioFile {
  name: string;
  url: string;
  duration: number;
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