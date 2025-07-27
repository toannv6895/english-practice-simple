import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { cn } from '../utils/cn';

interface CurrentSentenceProps {
  // For dictation mode - blurred text with gradual reveal
  showBlurred?: boolean;
  matchedWords?: boolean[];
  showAnswer?: boolean;
  // For shadowing mode - show playing indicator
  showPlayingIndicator?: boolean;
}

export const CurrentSentence: React.FC<CurrentSentenceProps> = ({
  showBlurred = false,
  matchedWords = [],
  showAnswer = false,
  showPlayingIndicator = false,
}) => {
  const { 
    subtitles, 
    currentSentenceIndex,
    isPlaying
  } = useAppStore();

  const currentSubtitle = subtitles[currentSentenceIndex];

  if (!currentSubtitle) {
    return (
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-gray-600">No subtitle available for current time.</p>
      </div>
    );
  }

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Render blurred text with gradual reveal for dictation mode
  const renderBlurredText = () => {
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

  // Render normal text for shadowing mode
  const renderNormalText = () => {
    return (
      <p className="text-lg font-medium text-gray-800 mb-4">
        {currentSubtitle.text}
      </p>
    );
  };

  return (
    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-500">
          Sentence {currentSentenceIndex + 1} of {subtitles.length}
        </span>
        <span className="text-sm text-gray-500">
          {formatTime(currentSubtitle.startTime)} - {formatTime(currentSubtitle.endTime)}
        </span>
      </div>
      
      <div className="mb-2">
        {showBlurred ? renderBlurredText() : renderNormalText()}
      </div>
    </div>
  );
};