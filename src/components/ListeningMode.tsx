import React, { memo, useRef, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { cn } from '../utils/cn';

export const ListeningMode: React.FC = memo(() => {
  const {
    subtitles,
    currentTime,
    currentSentenceIndex,
    setCurrentTime,
    setCurrentSentenceIndex
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
                {isActive && (
                  <span className="text-xs bg-primary-500 text-white px-2 py-1 rounded-full">
                    Playing
                  </span>
                )}
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