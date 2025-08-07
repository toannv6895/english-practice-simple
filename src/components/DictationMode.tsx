import React, { useState, useEffect, memo, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import { cn } from '../utils/cn';
import { compareTexts } from '../utils/textComparison';
import { CurrentSentence } from './CurrentSentence';
import { useGlobalKeyboardShortcuts } from '../hooks/useGlobalKeyboardShortcuts';
import { VolumeControl } from './VolumeControl';

export const DictationMode: React.FC = memo(() => {
  const {
    subtitles,
    currentTime,
    isPlaying,
    currentSentenceIndex,
    setCurrentTime,
    setIsPlaying,
    setCurrentSentenceIndex,
    practiceMode,
    setSubtitleVolume
  } = useAppStore();
  
  const [userInput, setUserInput] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  
  // State for managing popups - only one can be open at a time
  const [openPopup, setOpenPopup] = useState<{
    type: 'volume' | null;
    index: number | null;
  }>({ type: null, index: null });
  
  const handlePopupToggle = (type: 'volume', index: number) => {
    setOpenPopup(prev => {
      if (prev.type === type && prev.index === index) {
        return { type: null, index: null }; // Close if clicking the same button
      }
      return { type, index }; // Open new popup and close others
    });
  };
  
  const handleClosePopup = () => {
    setOpenPopup({ type: null, index: null });
  };

  // Use the tracked sentence index instead of calculating from time
  const currentSubtitleIndex = currentSentenceIndex;

  // Initialize dictation index when component loads
  useEffect(() => {
    if (subtitles.length > 0 && practiceMode === 'dictation') {
      // Find the current subtitle based on time, or default to 0
      const timeBasedIndex = subtitles.findIndex(
        subtitle => currentTime >= subtitle.startTime && currentTime <= subtitle.endTime
      );
      const initialIndex = timeBasedIndex !== -1 ? timeBasedIndex : 0;
      setCurrentSentenceIndex(initialIndex);
    }
  }, [subtitles, practiceMode, setCurrentSentenceIndex]);

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
      
      setCurrentSentenceIndex(nextIndex);
      setCurrentTime(nextSubtitle.startTime);
      setIsPlaying(true); // Auto-play the next sentence
    }
  };

  // Use global keyboard shortcuts (after function definitions)
  useGlobalKeyboardShortcuts({
    canProceedNext: isCorrect || showAnswer,
    onNext: handleNextSentence
  });

  const handlePreviousSentence = () => {
    if (currentSubtitleIndex > 0) {
      const prevIndex = currentSubtitleIndex - 1;
      const prevSubtitle = subtitles[prevIndex];
      
      setCurrentSentenceIndex(prevIndex);
      setCurrentTime(prevSubtitle.startTime);
      setIsPlaying(true); // Auto-play the previous sentence
    }
  };

  const handleReplay = () => {
    if (currentSubtitle) {
      setCurrentTime(currentSubtitle.startTime);
      setIsPlaying(true);
    }
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
      {/* Current Sentence Display using shared component */}
      <div className="mb-4">
        <CurrentSentence
          showBlurred={true}
          matchedWords={matchedWords}
          showAnswer={showAnswer}
        />
        <div className="mt-2 flex justify-end">
          <VolumeControl
            subtitleIndex={currentSubtitleIndex}
            currentVolume={currentSubtitle?.volume}
            onVolumeChange={(volume) => setSubtitleVolume(currentSubtitleIndex, volume)}
            isOpen={openPopup.type === 'volume' && openPopup.index === currentSubtitleIndex}
            onToggle={() => handlePopupToggle('volume', currentSubtitleIndex)}
            onClose={handleClosePopup}
          />
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