import { create } from 'zustand';
import { SubtitleEntry, PracticeMode } from '../types';

interface AppState {
  // Audio state
  audioFile: File | null;
  audioUrl: string;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  
  // Subtitle state
  subtitleFile: File | null;
  subtitles: SubtitleEntry[];
  
  // Practice mode state
  practiceMode: PracticeMode;
  
  // Actions
  setAudioFile: (file: File | null) => void;
  setAudioUrl: (url: string) => void;
  setIsPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setSubtitleFile: (file: File | null) => void;
  setSubtitles: (subtitles: SubtitleEntry[]) => void;
  setPracticeMode: (mode: PracticeMode) => void;
  
  // Computed values
  getCurrentSubtitleIndex: () => number;
  getCurrentSubtitle: () => SubtitleEntry | null;
  
  // Reset functions
  resetAudio: () => void;
  resetSubtitles: () => void;
  resetAll: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  audioFile: null,
  audioUrl: '',
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  subtitleFile: null,
  subtitles: [],
  practiceMode: 'listening',
  
  // Actions
  setAudioFile: (file) => set({ audioFile: file }),
  setAudioUrl: (url) => set({ audioUrl: url }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),
  setSubtitleFile: (file) => set({ subtitleFile: file }),
  setSubtitles: (subtitles) => set({ subtitles }),
  setPracticeMode: (mode) => set({ practiceMode: mode }),
  
  // Computed values
  getCurrentSubtitleIndex: () => {
    const { subtitles, currentTime } = get();
    return subtitles.findIndex(
      subtitle => currentTime >= subtitle.startTime && currentTime <= subtitle.endTime
    );
  },
  
  getCurrentSubtitle: () => {
    const { subtitles, getCurrentSubtitleIndex } = get();
    const index = getCurrentSubtitleIndex();
    return index !== -1 ? subtitles[index] : null;
  },
  
  // Reset functions
  resetAudio: () => set({
    audioFile: null,
    audioUrl: '',
    isPlaying: false,
    currentTime: 0,
    duration: 0,
  }),
  
  resetSubtitles: () => set({
    subtitleFile: null,
    subtitles: [],
  }),
  
  resetAll: () => set({
    audioFile: null,
    audioUrl: '',
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    subtitleFile: null,
    subtitles: [],
    practiceMode: 'listening',
  }),
}));