import React, { useState, useEffect, memo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { cn } from '../utils/cn';

export const DictationMode: React.FC = memo(() => {
  const { subtitles, currentTime, isPlaying, setCurrentTime } = useAppStore();
  const [userInput, setUserInput] = useState('');
  const [currentSubtitleIndex, setCurrentSubtitleIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const getCurrentSubtitleIndex = (): number => {
    return subtitles.findIndex(
      subtitle => currentTime >= subtitle.startTime && currentTime <= subtitle.endTime
    );
  };

  useEffect(() => {
    const newIndex = getCurrentSubtitleIndex();
    if (newIndex !== -1 && newIndex !== currentSubtitleIndex) {
      setCurrentSubtitleIndex(newIndex);
      setUserInput('');
      setShowAnswer(false);
    }
  }, [currentTime, subtitles, currentSubtitleIndex]);

  const currentSubtitle = subtitles[currentSubtitleIndex];
  const isCorrect = userInput.toLowerCase().trim() === currentSubtitle?.text.toLowerCase().trim();

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserInput(e.target.value);
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  const handleNextSentence = () => {
    if (currentSubtitleIndex < subtitles.length - 1) {
      const nextSubtitle = subtitles[currentSubtitleIndex + 1];
      setCurrentTime(nextSubtitle.startTime);
    }
  };

  const handlePreviousSentence = () => {
    if (currentSubtitleIndex > 0) {
      const prevSubtitle = subtitles[currentSubtitleIndex - 1];
      setCurrentTime(prevSubtitle.startTime);
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
      {/* Current Sentence Display */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-500">
            Sentence {currentSubtitleIndex + 1} of {subtitles.length}
          </span>
          <span className="text-sm text-gray-500">
            {formatTime(currentSubtitle.startTime)} - {formatTime(currentSubtitle.endTime)}
          </span>
        </div>
        
        {isPlaying && (
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-primary-600">Playing...</span>
          </div>
        )}
        
        <p className="text-lg font-medium text-gray-800 mb-4">
          {currentSubtitle.text}
        </p>
      </div>

      {/* User Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Type what you hear:
        </label>
        <textarea
          value={userInput}
          onChange={handleInputChange}
          placeholder="Start typing when you hear the sentence..."
          className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          disabled={isPlaying}
        />
      </div>

      {/* Feedback */}
      {userInput && !isPlaying && (
        <div className="mb-6">
          {isCorrect ? (
            <div className="p-3 bg-green-100 border border-green-300 rounded-lg">
              <p className="text-green-800 font-medium">✓ Correct!</p>
            </div>
          ) : (
            <div className="p-3 bg-red-100 border border-red-300 rounded-lg">
              <p className="text-red-800 font-medium">✗ Incorrect</p>
              {showAnswer && (
                <p className="text-red-700 mt-2">
                  <strong>Correct answer:</strong> {currentSubtitle.text}
                </p>
              )}
            </div>
          )}
        </div>
      )}

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
          onClick={handleShowAnswer}
          className="px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm font-medium hover:bg-yellow-600 transition-colors duration-200"
        >
          Show Answer
        </button>
        
        <button
          onClick={handleNextSentence}
          disabled={currentSubtitleIndex === subtitles.length - 1}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200",
            currentSubtitleIndex === subtitles.length - 1
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