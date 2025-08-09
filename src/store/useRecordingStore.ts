import { create } from 'zustand';
import { RecordingService } from '../services/recordingService';
import {
  RecordingSession,
  DictationAttempt,
  ShadowingRecording,
  ListeningSession,
  UserPracticeStats,
  CreateRecordingSession,
  CreateDictationAttempt,
  CreateShadowingRecording,
  CreateListeningSession,
  UpdateRecordingSession
} from '../types/recording';
import { PracticeMode } from '../types';

interface RecordingStore {
  // Current session
  currentSession: RecordingSession | null;
  currentSessionId: string | null;
  
  // Session data
  dictationAttempts: DictationAttempt[];
  shadowingRecordings: ShadowingRecording[];
  listeningSessions: ListeningSession[];
  
  // Statistics
  userStats: UserPracticeStats | null;
  
  // Loading states
  isLoading: boolean;
  error: string | null;
  
  // Actions
  startSession: (audioId: string, practiceMode: PracticeMode, metadata?: Record<string, any>) => Promise<void>;
  endSession: (totalDuration?: number) => Promise<void>;
  
  // Dictation actions
  addDictationAttempt: (data: Omit<CreateDictationAttempt, 'session_id'>) => Promise<void>;
  loadDictationAttempts: (sessionId: string) => Promise<void>;
  
  // Shadowing actions
  addShadowingRecording: (data: Omit<CreateShadowingRecording, 'session_id'>) => Promise<void>;
  loadShadowingRecordings: (sessionId: string) => Promise<void>;
  
  // Listening actions
  addListeningSession: (data: Omit<CreateListeningSession, 'session_id'>) => Promise<void>;
  loadListeningSessions: (sessionId: string) => Promise<void>;
  
  // Statistics
  loadUserStats: () => Promise<void>;
  
  // Session management
  loadSession: (sessionId: string) => Promise<void>;
  loadUserSessions: (limit?: number) => Promise<RecordingSession[]>;
  loadAudioSessions: (audioId: string) => Promise<RecordingSession[]>;
  
  // Reset
  reset: () => void;
  clearError: () => void;
}

export const useRecordingStore = create<RecordingStore>((set, get) => ({
  // Initial state
  currentSession: null,
  currentSessionId: null,
  dictationAttempts: [],
  shadowingRecordings: [],
  listeningSessions: [],
  userStats: null,
  isLoading: false,
  error: null,

  // Session management
  startSession: async (audioId: string, practiceMode: PracticeMode, metadata?: Record<string, any>) => {
    set({ isLoading: true, error: null });
    try {
      const session = await RecordingService.createSession({
        audio_id: audioId,
        practice_mode: practiceMode,
        metadata
      });
      
      set({
        currentSession: session,
        currentSessionId: session.id,
        dictationAttempts: [],
        shadowingRecordings: [],
        listeningSessions: [],
        isLoading: false
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to start session',
        isLoading: false 
      });
      throw error;
    }
  },

  endSession: async (totalDuration?: number) => {
    const { currentSession, currentSessionId } = get();
    if (!currentSession || !currentSessionId) return;

    set({ isLoading: true, error: null });
    try {
      const updatedSession = await RecordingService.updateSession(currentSessionId, {
        session_end: new Date().toISOString(),
        total_duration: totalDuration,
        completed: true
      });

      set({
        currentSession: updatedSession,
        isLoading: false
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to end session',
        isLoading: false 
      });
      throw error;
    }
  },

  // Dictation actions
  addDictationAttempt: async (data: Omit<CreateDictationAttempt, 'session_id'>) => {
    const { currentSessionId } = get();
    if (!currentSessionId) throw new Error('No active session');

    set({ isLoading: true, error: null });
    try {
      const attempt = await RecordingService.createDictationAttempt({
        ...data,
        session_id: currentSessionId
      });

      set(state => ({
        dictationAttempts: [...state.dictationAttempts, attempt],
        isLoading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to save dictation attempt',
        isLoading: false 
      });
      throw error;
    }
  },

  loadDictationAttempts: async (sessionId: string) => {
    set({ isLoading: true, error: null });
    try {
      const attempts = await RecordingService.getDictationAttempts(sessionId);
      set({ dictationAttempts: attempts, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load dictation attempts',
        isLoading: false 
      });
      throw error;
    }
  },

  // Shadowing actions
  addShadowingRecording: async (data: Omit<CreateShadowingRecording, 'session_id'>) => {
    const { currentSessionId } = get();
    if (!currentSessionId) throw new Error('No active session');

    set({ isLoading: true, error: null });
    try {
      const recording = await RecordingService.createShadowingRecording({
        ...data,
        session_id: currentSessionId
      });

      set(state => ({
        shadowingRecordings: [...state.shadowingRecordings, recording],
        isLoading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to save shadowing recording',
        isLoading: false 
      });
      throw error;
    }
  },

  loadShadowingRecordings: async (sessionId: string) => {
    set({ isLoading: true, error: null });
    try {
      const recordings = await RecordingService.getShadowingRecordings(sessionId);
      set({ shadowingRecordings: recordings, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load shadowing recordings',
        isLoading: false 
      });
      throw error;
    }
  },

  // Listening actions
  addListeningSession: async (data: Omit<CreateListeningSession, 'session_id'>) => {
    const { currentSessionId } = get();
    if (!currentSessionId) throw new Error('No active session');

    set({ isLoading: true, error: null });
    try {
      const session = await RecordingService.createListeningSession({
        ...data,
        session_id: currentSessionId
      });

      set(state => ({
        listeningSessions: [...state.listeningSessions, session],
        isLoading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to save listening session',
        isLoading: false 
      });
      throw error;
    }
  },

  loadListeningSessions: async (sessionId: string) => {
    set({ isLoading: true, error: null });
    try {
      const sessions = await RecordingService.getListeningSessions(sessionId);
      set({ listeningSessions: sessions, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load listening sessions',
        isLoading: false 
      });
      throw error;
    }
  },

  // Statistics
  loadUserStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const stats = await RecordingService.getUserPracticeStats();
      set({ userStats: stats, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load user stats',
        isLoading: false 
      });
      throw error;
    }
  },

  // Session management
  loadSession: async (sessionId: string) => {
    set({ isLoading: true, error: null });
    try {
      const session = await RecordingService.getSession(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      set({
        currentSession: session,
        currentSessionId: session.id,
        isLoading: false
      });

      // Load related data based on practice mode
      if (session.practice_mode === 'dictation') {
        await get().loadDictationAttempts(sessionId);
      } else if (session.practice_mode === 'shadowing') {
        await get().loadShadowingRecordings(sessionId);
      } else if (session.practice_mode === 'listening') {
        await get().loadListeningSessions(sessionId);
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load session',
        isLoading: false 
      });
      throw error;
    }
  },

  loadUserSessions: async (limit = 50) => {
    set({ isLoading: true, error: null });
    try {
      const sessions = await RecordingService.getUserSessions(limit);
      set({ isLoading: false });
      return sessions;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load user sessions',
        isLoading: false 
      });
      throw error;
    }
  },

  loadAudioSessions: async (audioId: string) => {
    set({ isLoading: true, error: null });
    try {
      const sessions = await RecordingService.getAudioSessions(audioId);
      set({ isLoading: false });
      return sessions;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load audio sessions',
        isLoading: false 
      });
      throw error;
    }
  },

  // Reset
  reset: () => set({
    currentSession: null,
    currentSessionId: null,
    dictationAttempts: [],
    shadowingRecordings: [],
    listeningSessions: [],
    userStats: null,
    isLoading: false,
    error: null
  }),

  clearError: () => set({ error: null })
}));