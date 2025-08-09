import { supabase } from '../lib/supabase';
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

export class RecordingService {
  // Recording Sessions
  static async createSession(data: CreateRecordingSession): Promise<RecordingSession> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: session, error } = await supabase
      .from('recording_sessions')
      .insert({
        user_id: user.id,
        audio_id: data.audio_id,
        practice_mode: data.practice_mode,
        metadata: data.metadata || {}
      })
      .select()
      .single();

    if (error) throw error;
    return session;
  }

  static async updateSession(sessionId: string, data: UpdateRecordingSession): Promise<RecordingSession> {
    const { data: session, error } = await supabase
      .from('recording_sessions')
      .update(data)
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw error;
    return session;
  }

  static async getSession(sessionId: string): Promise<RecordingSession | null> {
    const { data: session, error } = await supabase
      .from('recording_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error) return null;
    return session;
  }

  static async getUserSessions(limit = 50): Promise<RecordingSession[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: sessions, error } = await supabase
      .from('recording_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return sessions || [];
  }

  static async getAudioSessions(audioId: string): Promise<RecordingSession[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: sessions, error } = await supabase
      .from('recording_sessions')
      .select('*')
      .eq('user_id', user.id)
      .eq('audio_id', audioId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return sessions || [];
  }

  // Dictation Attempts
  static async createDictationAttempt(data: CreateDictationAttempt): Promise<DictationAttempt> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: attempt, error } = await supabase
      .from('dictation_attempts')
      .insert({
        ...data,
        user_id: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return attempt;
  }

  static async getDictationAttempts(sessionId: string): Promise<DictationAttempt[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: attempts, error } = await supabase
      .from('dictation_attempts')
      .select('*')
      .eq('user_id', user.id)
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return attempts || [];
  }

  static async getAudioDictationAttempts(audioId: string): Promise<DictationAttempt[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: attempts, error } = await supabase
      .from('dictation_attempts')
      .select('*')
      .eq('user_id', user.id)
      .eq('audio_id', audioId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return attempts || [];
  }

  // Shadowing Recordings
  static async createShadowingRecording(data: CreateShadowingRecording): Promise<ShadowingRecording> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: recording, error } = await supabase
      .from('shadowing_recordings')
      .insert({
        ...data,
        user_id: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return recording;
  }

  static async getShadowingRecordings(sessionId: string): Promise<ShadowingRecording[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: recordings, error } = await supabase
      .from('shadowing_recordings')
      .select('*')
      .eq('user_id', user.id)
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return recordings || [];
  }

  static async getAudioShadowingRecordings(audioId: string): Promise<ShadowingRecording[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: recordings, error } = await supabase
      .from('shadowing_recordings')
      .select('*')
      .eq('user_id', user.id)
      .eq('audio_id', audioId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return recordings || [];
  }

  // Listening Sessions
  static async createListeningSession(data: CreateListeningSession): Promise<ListeningSession> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: session, error } = await supabase
      .from('listening_sessions')
      .insert({
        ...data,
        user_id: user.id,
        repetitions: data.repetitions || 1
      })
      .select()
      .single();

    if (error) throw error;
    return session;
  }

  static async getListeningSessions(sessionId: string): Promise<ListeningSession[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: sessions, error } = await supabase
      .from('listening_sessions')
      .select('*')
      .eq('user_id', user.id)
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return sessions || [];
  }

  // Statistics
  static async getUserPracticeStats(): Promise<UserPracticeStats> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: stats, error } = await supabase
      .rpc('get_user_practice_stats', { user_uuid: user.id });

    if (error) throw error;
    return stats;
  }

  // Bulk operations
  static async createDictationAttempts(attempts: CreateDictationAttempt[]): Promise<DictationAttempt[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const attemptsWithUser = attempts.map(attempt => ({
      ...attempt,
      user_id: user.id
    }));

    const { data: createdAttempts, error } = await supabase
      .from('dictation_attempts')
      .insert(attemptsWithUser)
      .select();

    if (error) throw error;
    return createdAttempts || [];
  }

  static async createListeningSessions(sessions: CreateListeningSession[]): Promise<ListeningSession[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const sessionsWithUser = sessions.map(session => ({
      ...session,
      user_id: user.id
    }));

    const { data: createdSessions, error } = await supabase
      .from('listening_sessions')
      .insert(sessionsWithUser)
      .select();

    if (error) throw error;
    return createdSessions || [];
  }
}