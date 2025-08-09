import { PracticeMode } from './index';

export interface RecordingSession {
  id: string;
  user_id: string;
  audio_id: string;
  practice_mode: PracticeMode;
  session_start: string;
  session_end?: string;
  total_duration?: number;
  completed: boolean;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface DictationAttempt {
  id: string;
  session_id: string;
  user_id: string;
  audio_id: string;
  sentence_index: number;
  original_text: string;
  user_input: string;
  is_correct: boolean;
  accuracy_score?: number;
  time_taken?: number;
  created_at: string;
}

export interface ShadowingRecording {
  id: string;
  session_id: string;
  user_id: string;
  audio_id: string;
  sentence_index: number;
  original_text: string;
  audio_url?: string;
  audio_duration?: number;
  pronunciation_score?: number;
  fluency_score?: number;
  completeness_score?: number;
  overall_score?: number;
  feedback?: Record<string, any>;
  created_at: string;
}

export interface ListeningSession {
  id: string;
  session_id: string;
  user_id: string;
  audio_id: string;
  sentence_index: number;
  original_text: string;
  time_listened?: number;
  repetitions: number;
  created_at: string;
}

export interface UserPracticeStats {
  total_sessions: number;
  total_duration: number;
  avg_dictation_accuracy?: number;
  avg_shadowing_score?: number;
  last_session: string;
}

export interface CreateRecordingSession {
  audio_id: string;
  practice_mode: PracticeMode;
  metadata?: Record<string, any>;
}

export interface UpdateRecordingSession {
  session_end?: string;
  total_duration?: number;
  completed?: boolean;
  metadata?: Record<string, any>;
}

export interface CreateDictationAttempt {
  session_id: string;
  audio_id: string;
  sentence_index: number;
  original_text: string;
  user_input: string;
  is_correct: boolean;
  accuracy_score?: number;
  time_taken?: number;
}

export interface CreateShadowingRecording {
  session_id: string;
  audio_id: string;
  sentence_index: number;
  original_text: string;
  audio_url?: string;
  audio_duration?: number;
  pronunciation_score?: number;
  fluency_score?: number;
  completeness_score?: number;
  overall_score?: number;
  feedback?: Record<string, any>;
}

export interface CreateListeningSession {
  session_id: string;
  audio_id: string;
  sentence_index: number;
  original_text: string;
  time_listened?: number;
  repetitions?: number;
}