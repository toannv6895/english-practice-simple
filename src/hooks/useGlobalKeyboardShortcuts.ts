import { useEffect, useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';

interface UseGlobalKeyboardShortcutsProps {
  // For dictation mode - only allow next if correct or answer shown
  canProceedNext?: boolean;
  // Custom handlers
  onReplay?: () => void;
  onNext?: () => void;
  // For shadowing mode - space key to start/stop recording
  onToggleRecording?: () => void;
}

export const useGlobalKeyboardShortcuts = ({
  canProceedNext = true,
  onReplay,
  onNext,
  onToggleRecording
}: UseGlobalKeyboardShortcutsProps = {}) => {
  const {
    practiceMode,
    subtitles,
    currentSentenceIndex,
    setCurrentTime,
    setIsPlaying,
    setCurrentSentenceIndex
  } = useAppStore();

  // Default replay handler
  const defaultReplay = useCallback(() => {
    const currentSubtitle = subtitles[currentSentenceIndex];
    if (currentSubtitle) {
      setCurrentTime(currentSubtitle.startTime);
      setIsPlaying(true);
    }
  }, [subtitles, currentSentenceIndex, setCurrentTime, setIsPlaying]);

  // Default next handler
  const defaultNext = useCallback(() => {
    if (currentSentenceIndex < subtitles.length - 1) {
      const nextIndex = currentSentenceIndex + 1;
      const nextSubtitle = subtitles[nextIndex];
      
      setCurrentSentenceIndex(nextIndex);
      setCurrentTime(nextSubtitle.startTime);
      setIsPlaying(true); // Auto-play the next sentence
    }
  }, [currentSentenceIndex, subtitles, setCurrentSentenceIndex, setCurrentTime, setIsPlaying]);

  // Keyboard event handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts for dictation and shadowing modes
      if (practiceMode !== 'dictation' && practiceMode !== 'shadowing') {
        return;
      }

      // Tab key - Replay current sentence (global for all modes)
      if (e.key === 'Tab') {
        e.preventDefault();
        if (onReplay) {
          onReplay();
        } else {
          defaultReplay();
        }
      }
      
      // Enter key - Next sentence (for dictation and shadowing modes only)
      else if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        
        // For dictation mode, check if we can proceed
        if (practiceMode === 'dictation' && !canProceedNext) {
          return;
        }
        
        if (onNext) {
          onNext();
        } else {
          defaultNext();
        }
      }
      
      // Space key - Toggle recording (for shadowing mode only)
      else if (e.key === ' ' && practiceMode === 'shadowing') {
        e.preventDefault();
        if (onToggleRecording) {
          onToggleRecording();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [
    practiceMode,
    canProceedNext,
    onReplay,
    onNext,
    onToggleRecording,
    defaultReplay,
    defaultNext
  ]);

  return {
    replay: onReplay || defaultReplay,
    next: onNext || defaultNext
  };
};