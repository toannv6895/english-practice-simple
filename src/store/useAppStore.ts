import { create } from 'zustand';
import { SubtitleEntry, PracticeMode } from '../types';

type ShadowingModeType = 'sentence' | 'full';

interface AppState {
  // Audio state
  audioFile: File | null;
  audioUrl: string;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackSpeed: number;
  volume: number;
  isReplayEnabled: boolean;
  
  // Subtitle state
  subtitleFile: File | null;
  subtitles: SubtitleEntry[];
  
  // Practice mode state
  practiceMode: PracticeMode;
  shadowingMode: ShadowingModeType;
  
  // Shared sentence index for all modes
  currentSentenceIndex: number;
  
  // Actions
  setAudioFile: (file: File | null) => void;
  setAudioUrl: (url: string) => void;
  setIsPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setPlaybackSpeed: (speed: number) => void;
  setVolume: (volume: number) => void;
  setSubtitleFile: (file: File | null) => void;
  setSubtitles: (subtitles: SubtitleEntry[]) => void;
  setPracticeMode: (mode: PracticeMode) => void;
  setShadowingMode: (mode: ShadowingModeType) => void;
  setCurrentSentenceIndex: (index: number) => void;
  setIsReplayEnabled: (enabled: boolean) => void;
  
  // Computed values
  getCurrentSubtitleIndex: () => number;
  getCurrentSubtitle: () => SubtitleEntry | null;
  
  // Audio control functions
  playCurrentSubtitle: () => void;
  stopAudio: () => void;
  
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
  playbackSpeed: 1,
  volume: 1,
  isReplayEnabled: false,
  subtitleFile: null,
  subtitles: [],
  practiceMode: 'listening',
  shadowingMode: 'full',
  currentSentenceIndex: 0,
  
  // Actions
  setAudioFile: (file) => set({ audioFile: file }),
  setAudioUrl: (url) => set({ audioUrl: url }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),
  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),
  setVolume: (volume) => set({ volume }),
  setSubtitleFile: (file) => set({ subtitleFile: file }),
  setSubtitles: (subtitles) => set({ subtitles }),
  setPracticeMode: (mode) => set({ practiceMode: mode }),
  setShadowingMode: (mode) => set({ shadowingMode: mode }),
  setCurrentSentenceIndex: (index) => set({ currentSentenceIndex: index }),
  setIsReplayEnabled: (enabled) => set({ isReplayEnabled: enabled }),
  
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
  
  // Audio control functions
  playCurrentSubtitle: () => {
    const { getCurrentSubtitle } = get();
    const currentSubtitle = getCurrentSubtitle();
    if (currentSubtitle) {
      set({ currentTime: currentSubtitle.startTime, isPlaying: true });
    }
  },
  
  stopAudio: () => {
    set({ isPlaying: false });
  },
  
  // Reset functions
  resetAudio: () => set({
    audioFile: null,
    audioUrl: '',
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    playbackSpeed: 1,
    volume: 1,
    isReplayEnabled: false,
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
    playbackSpeed: 1,
    volume: 1,
    isReplayEnabled: false,
    subtitleFile: null,
    subtitles: [],
    practiceMode: 'listening',
    shadowingMode: 'full',
  }),
}));