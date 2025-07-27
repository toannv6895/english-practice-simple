import React, { useState, useEffect, memo, useCallback, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import { cn } from '../utils/cn';
import { compareTexts } from '../utils/textComparison';

export const DictationMode: React.FC = memo(() => {
  const { 
    subtitles, 
    currentTime, 
    isPlaying, 
    currentDictationIndex,
    setCurrentTime, 
    setIsPlaying,
    setCurrentDictationIndex,
    practiceMode
  } = useAppStore();
  
  const [userInput, setUserInput] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);

  // Use the tracked dictation index instead of calculating from time
  const currentSubtitleIndex = currentDictationIndex;

  // Initialize dictation index when component loads
  useEffect(() => {
    if (subtitles.length > 0 && practiceMode === 'dictation') {
      // Find the current subtitle based on time, or default to 0
      const timeBasedIndex = subtitles.findIndex(
        subtitle => currentTime >= subtitle.startTime && currentTime <= subtitle.endTime
      );
      const initialIndex = timeBasedIndex !== -1 ? timeBasedIndex : 0;
      setCurrentDictationIndex(initialIndex);
    }
  }, [subtitles, practiceMode, setCurrentDictationIndex]);

  // Auto-stop functionality when sentence ends
  useEffect(() => {
    if (practiceMode === 'dictation' && isPlaying) {
      const currentSubtitle = subtitles[currentSubtitleIndex];
      if (currentSubtitle && currentTime >= currentSubtitle.endTime) {
        setIsPlaying(false);
      }
    }
  }, [currentTime, currentSubtitleIndex, subtitles, isPlaying, practiceMode, setIsPlaying]);

  // Reset input when changing sentences and auto-focus
  useEffect(() => {
    setUserInput('');
    setShowAnswer(false);
    // Auto-focus input when changing sentences
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentSubtitleIndex]);

  // Add ref for input focus
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const currentSubtitle = subtitles[currentSubtitleIndex];
  const { isCorrect, matchedWords } = currentSubtitle
    ? compareTexts(userInput, currentSubtitle.text)
    : { isCorrect: false, matchedWords: [] };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (practiceMode !== 'dictation') return;
      
      if (e.key === 'Tab') {
        e.preventDefault();
        handleReplay();
      } else if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        // Only proceed to next sentence if current sentence is completed or answer is shown
        if (isCorrect || showAnswer) {
          handleNextSentence();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [practiceMode, currentSubtitleIndex, subtitles, isCorrect, showAnswer]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserInput(e.target.value);
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  const handleNextSentence = () => {
    // Only allow next if current sentence is completed or answer is shown
    if (!isCorrect && !showAnswer) {
      return;
    }
    
    if (currentSubtitleIndex < subtitles.length - 1) {
      const nextIndex = currentSubtitleIndex + 1;
      const nextSubtitle = subtitles[nextIndex];
      
      setCurrentDictationIndex(nextIndex);
      setCurrentTime(nextSubtitle.startTime);
      setIsPlaying(true); // Auto-play the next sentence
    }
  };

  const handlePreviousSentence = () => {
    if (currentSubtitleIndex > 0) {
      const prevIndex = currentSubtitleIndex - 1;
      const prevSubtitle = subtitles[prevIndex];
      
      setCurrentDictationIndex(prevIndex);
      setCurrentTime(prevSubtitle.startTime);
      setIsPlaying(true); // Auto-play the previous sentence
    }
  };

  const handleReplay = useCallback(() => {
    if (currentSubtitle) {
      setCurrentTime(currentSubtitle.startTime);
      setIsPlaying(true);
    }
  }, [currentSubtitle, setCurrentTime, setIsPlaying]);

  // Create blurred text with gradual reveal
  const renderBlurredText = () => {
    if (!currentSubtitle) return null;

    if (showAnswer) {
      return (
        <p className="text-lg font-medium text-gray-800">
          {currentSubtitle.text}
        </p>
      );
    }

    const words = currentSubtitle.text.split(' ');

    return (
      <p className="text-lg font-medium text-gray-800">
        {words.map((word, index) => {
          // Only reveal word if it matches correctly at its position
          const isRevealed = matchedWords[index] === true;
          return (
            <span
              key={index}
              className={cn(
                "transition-all duration-300",
                isRevealed ? "blur-none" : "blur-sm select-none"
              )}
            >
              {word}
              {index < words.length - 1 ? ' ' : ''}
            </span>
          );
        })}
      </p>
    );
  };

  if (!currentSubtitle) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <p className="text-gray-600">No subtitle available for current time.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Current Sentence Display - Reduced margins, removed Playing indicator */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-500">
            Sentence {currentSubtitleIndex + 1} of {subtitles.length}
          </span>
          <span className="text-sm text-gray-500">
            {formatTime(currentSubtitle.startTime)} - {formatTime(currentSubtitle.endTime)}
          </span>
        </div>
        
        <div className="mb-2">
          {renderBlurredText()}
        </div>
      </div>

      {/* User Input - Removed label */}
      <div className="mb-6">
        <textarea
          ref={inputRef}
          value={userInput}
          onChange={handleInputChange}
          placeholder="Start typing when you hear the sentence..."
          className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
        />
        <div className="mt-2 text-sm text-gray-500">
          <span className="font-medium">Shortcuts:</span> Tab to replay • Enter to next
          {!isCorrect && !showAnswer && (
            <span className="ml-2 text-amber-600">• Complete the sentence to proceed</span>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        <button
          onClick={handlePreviousSentence}
          disabled={currentSubtitleIndex === 0}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200",
            currentSubtitleIndex === 0
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          )}
        >
          Previous
        </button>
        
        <button
          onClick={handleReplay}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors duration-200"
        >
          Replay
        </button>
        
        <button
          onClick={handleShowAnswer}
          className="px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm font-medium hover:bg-yellow-600 transition-colors duration-200"
        >
          Show Answer
        </button>
        
        <button
          onClick={handleNextSentence}
          disabled={currentSubtitleIndex === subtitles.length - 1 || (!isCorrect && !showAnswer)}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200",
            currentSubtitleIndex === subtitles.length - 1 || (!isCorrect && !showAnswer)
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-primary-500 text-white hover:bg-primary-600"
          )}
        >
          Next
        </button>
      </div>
    </div>
  );
});

DictationMode.displayName = 'DictationMode';

function formatTime(time: number): string {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}