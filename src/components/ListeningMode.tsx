import React, { memo, useRef, useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { cn } from '../utils/cn';
import { Play, Settings } from 'lucide-react';

interface SpeedControlProps {
  subtitleIndex: number;
  currentSpeed?: number;
  onSpeedChange: (speed: number | undefined) => void;
}

const SpeedControl: React.FC<SpeedControlProps> = ({ subtitleIndex, currentSpeed, onSpeedChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const speeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
  
  const handleSpeedChange = (speed: number | undefined) => {
    onSpeedChange(speed);
    setIsOpen(false);
  };
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "p-1 rounded text-xs transition-colors",
          currentSpeed !== undefined
            ? "bg-primary-100 text-primary-700 hover:bg-primary-200"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        )}
        title={currentSpeed ? `Speed: ${currentSpeed}x` : "Set speed for this sentence"}
      >
        {currentSpeed ? `${currentSpeed}x` : <Settings size={12} />}
      </button>
      
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-10 min-w-[120px]">
          <div className="text-xs font-medium text-gray-700 mb-2">Sentence Speed</div>
          <div className="space-y-1">
            {speeds.map(speed => (
              <button
                key={speed}
                onClick={() => handleSpeedChange(speed)}
                className={cn(
                  "w-full text-left px-2 py-1 text-xs rounded hover:bg-gray-100",
                  currentSpeed === speed && "bg-primary-100 text-primary-700"
                )}
              >
                {speed}x
              </button>
            ))}
            {currentSpeed !== undefined && (
              <button
                onClick={() => handleSpeedChange(undefined)}
                className="w-full text-left px-2 py-1 text-xs rounded hover:bg-gray-100 text-gray-500"
              >
                Use default
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const ListeningMode: React.FC = memo(() => {
  const {
    subtitles,
    currentTime,
    currentSentenceIndex,
    playbackSpeed,
    setCurrentTime,
    setCurrentSentenceIndex,
    setSubtitleSpeed
  } = useAppStore();
  
  const containerRef = useRef<HTMLDivElement>(null);
  const sentenceRefs = useRef<(HTMLDivElement | null)[]>([]);

  const getCurrentSubtitleIndex = (): number => {
    return subtitles.findIndex(
      subtitle => currentTime >= subtitle.startTime && currentTime <= subtitle.endTime
    );
  };

  const currentIndex = getCurrentSubtitleIndex();

  // Auto scroll to current sentence
  useEffect(() => {
    if (currentIndex !== -1 && sentenceRefs.current[currentIndex]) {
      const element = sentenceRefs.current[currentIndex];
      const container = containerRef.current;
      
      if (element && container) {
        const containerRect = container.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        const containerTop = containerRect.top;
        const containerBottom = containerRect.bottom;
        const elementTop = elementRect.top;
        const elementBottom = elementRect.bottom;
        
        // Check if element is outside viewport
        if (elementTop < containerTop || elementBottom > containerBottom) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
          });
        }
      }
    }
  }, [currentIndex]);

  const handleSeekToTime = (time: number, index: number) => {
    setCurrentTime(time);
    setCurrentSentenceIndex(index);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div ref={containerRef} className="max-h-96 overflow-y-auto">
        {subtitles.map((subtitle, index) => {
          const isActive = index === currentIndex;
          const isPast = currentTime > subtitle.endTime;
          
          return (
            <div
              key={subtitle.id}
              ref={(el) => {
                sentenceRefs.current[index] = el;
              }}
              className={cn(
                "p-3 mb-2 rounded-lg cursor-pointer transition-all duration-200",
                isActive && "bg-primary-100 border-l-4 border-primary-500",
                isPast && !isActive && "bg-gray-50 text-gray-600",
                !isActive && !isPast && "hover:bg-gray-50"
              )}
              onClick={() => handleSeekToTime(subtitle.startTime, index)}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="text-sm text-gray-500">
                  {formatTime(subtitle.startTime)} - {formatTime(subtitle.endTime)}
                </span>
                <div className="flex items-center space-x-2">
                  {isActive && (
                    <span className="text-xs bg-primary-500 text-white px-2 py-1 rounded-full">
                      Playing
                    </span>
                  )}
                  <SpeedControl
                    subtitleIndex={index}
                    currentSpeed={subtitle.speed}
                    onSpeedChange={(speed) => setSubtitleSpeed(index, speed)}
                  />
                </div>
              </div>
              <p className={cn(
                "text-sm leading-relaxed",
                isActive && "font-medium text-gray-900",
                !isActive && "text-gray-700"
              )}>
                {subtitle.text}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
});

ListeningMode.displayName = 'ListeningMode';

function formatTime(time: number): string {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}