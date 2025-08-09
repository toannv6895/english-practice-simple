import React, { useEffect } from 'react';
import { useRecordingStore } from '../store/useRecordingStore';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';

export const RecordingIntegration: React.FC = () => {
  const { user } = useAuthStore();
  const { 
    audioFile, 
    subtitles, 
    practiceMode, 
    currentSentenceIndex,
    isPlaying 
  } = useAppStore();
  
  const {
    currentSession,
    startSession,
    endSession,
    addDictationAttempt,
    addShadowingRecording,
    addListeningSession
  } = useRecordingStore();

  // Auto-start session when audio is loaded
  useEffect(() => {
    if (user && audioFile && !currentSession) {
      const startRecordingSession = async () => {
        try {
          // In real app, you would get the actual audio ID from your audio store
          const audioId = `audio_${Date.now()}`;
          await startSession(audioId, practiceMode, {
            filename: audioFile.name,
            subtitleCount: subtitles.length
          });
        } catch (error) {
          console.error('Failed to start recording session:', error);
        }
      };

      startRecordingSession();
    }
  }, [user, audioFile, practiceMode, currentSession, startSession, subtitles.length]);

  // Auto-end session when audio is closed
  useEffect(() => {
    if (!audioFile && currentSession) {
      const endRecordingSession = async () => {
        try {
          await endSession();
        } catch (error) {
          console.error('Failed to end recording session:', error);
        }
      };

      endRecordingSession();
    }
  }, [audioFile, currentSession, endSession]);

  // Record dictation attempt
  const recordDictationAttempt = async (
    sentenceIndex: number,
    originalText: string,
    userInput: string,
    isCorrect: boolean,
    accuracyScore?: number,
    timeTaken?: number
  ) => {
    if (!currentSession) return;

    try {
      await addDictationAttempt({
        audio_id: currentSession.audio_id,
        sentence_index: sentenceIndex,
        original_text: originalText,
        user_input: userInput,
        is_correct: isCorrect,
        accuracy_score: accuracyScore,
        time_taken: timeTaken
      });
    } catch (error) {
      console.error('Failed to record dictation attempt:', error);
    }
  };

  // Record shadowing recording
  const recordShadowingRecording = async (
    sentenceIndex: number,
    originalText: string,
    audioUrl: string,
    audioDuration: number,
    scores: {
      pronunciation: number;
      fluency: number;
      completeness: number;
      overall: number;
    },
    feedback?: Record<string, any>
  ) => {
    if (!currentSession) return;

    try {
      await addShadowingRecording({
        audio_id: currentSession.audio_id,
        sentence_index: sentenceIndex,
        original_text: originalText,
        audio_url: audioUrl,
        audio_duration: audioDuration,
        pronunciation_score: scores.pronunciation,
        fluency_score: scores.fluency,
        completeness_score: scores.completeness,
        overall_score: scores.overall,
        feedback
      });
    } catch (error) {
      console.error('Failed to record shadowing recording:', error);
    }
  };

  // Record listening session
  const recordListeningSession = async (
    sentenceIndex: number,
    originalText: string,
    timeListened: number,
    repetitions: number = 1
  ) => {
    if (!currentSession) return;

    try {
      await addListeningSession({
        audio_id: currentSession.audio_id,
        sentence_index: sentenceIndex,
        original_text: originalText,
        time_listened: timeListened,
        repetitions
      });
    } catch (error) {
      console.error('Failed to record listening session:', error);
    }
  };

  // Expose recording functions globally for components to use
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).recordingAPI = {
        recordDictationAttempt,
        recordShadowingRecording,
        recordListeningSession,
        getCurrentSession: () => currentSession
      };
    }

    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).recordingAPI;
      }
    };
  }, [currentSession, recordDictationAttempt, recordShadowingRecording, recordListeningSession]);

  return null; // This component doesn't render anything
};

// Hook to use recording functions
export const useRecordingIntegration = () => {
  const {
    recordDictationAttempt,
    recordShadowingRecording,
    recordListeningSession,
    getCurrentSession
  } = (window as any).recordingAPI || {};

  return {
    recordDictationAttempt,
    recordShadowingRecording,
    recordListeningSession,
    getCurrentSession
  };
};