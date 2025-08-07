import React, { memo, useRef, useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { cn } from '../utils/cn';
import { Play, Settings, Volume2, VolumeX } from 'lucide-react';

interface SpeedControlProps {
  subtitleIndex: number;
  currentSpeed?: number;
  onSpeedChange: (speed: number | undefined) => void;
}

const SpeedControl: React.FC<SpeedControlProps & {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}> = ({ subtitleIndex, currentSpeed, onSpeedChange, isOpen, onToggle, onClose }) => {
  const speeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
  const popupRef = useRef<HTMLDivElement>(null);
  
  const handleSpeedChange = (speed: number | undefined) => {
    onSpeedChange(speed);
    onClose();
  };
  
  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen, onClose]);
  
  return (
    <div className="relative" ref={popupRef}>
      <button
        onClick={onToggle}
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

const VolumeControl: React.FC<{
  subtitleIndex: number;
  currentVolume?: number;
  onVolumeChange: (volume: number | undefined) => void;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}> = ({ subtitleIndex, currentVolume, onVolumeChange, isOpen, onToggle, onClose }) => {
  const popupRef = useRef<HTMLDivElement>(null);

  const handleVolumeChange = (volume: number | undefined) => {
    onVolumeChange(volume);
    onClose();
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseFloat(e.target.value);
    onVolumeChange(volume);
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen, onClose]);

  return (
    <div className="relative" ref={popupRef}>
      <button
        onClick={onToggle}
        className={cn(
          "p-1 rounded text-xs transition-colors flex items-center gap-1",
          currentVolume !== undefined
            ? "bg-primary-100 text-primary-700 hover:bg-primary-200"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        )}
        title={currentVolume !== undefined ? `Volume: ${Math.round(currentVolume * 100)}%` : "Set volume for this sentence"}
      >
        {currentVolume !== undefined ? (
          <>
            {currentVolume === 0 ? <VolumeX size={12} /> : <Volume2 size={12} />}
            <span>{Math.round(currentVolume * 100)}%</span>
          </>
        ) : (
          <Volume2 size={12} />
        )}
      </button>
      
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10 min-w-[200px]">
          <div className="text-xs font-medium text-gray-700 mb-2">Sentence Volume</div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <VolumeX size={14} className="text-gray-500" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={currentVolume ?? 1}
                onChange={handleSliderChange}
                className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <Volume2 size={14} className="text-gray-500" />
            </div>
            
            <div className="text-center text-xs text-gray-600">
              {Math.round((currentVolume ?? 1) * 100)}%
            </div>
            
            {currentVolume !== undefined && (
              <button
                onClick={() => handleVolumeChange(undefined)}
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
    setSubtitleSpeed,
    setSubtitleVolume
  } = useAppStore();
  
  const containerRef = useRef<HTMLDivElement>(null);
  const sentenceRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  // State for managing popups - only one can be open at a time
  const [openPopup, setOpenPopup] = useState<{
    type: 'speed' | 'volume' | null;
    index: number | null;
  }>({ type: null, index: null });
  
  const handlePopupToggle = (type: 'speed' | 'volume', index: number) => {
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

  const getCurrentSubtitleIndex = (): number => {
    return subtitles.findIndex(
      subtitle => currentTime >= subtitle.startTime && currentTime <= subtitle.endTime
    );
  };

  const currentIndex = getCurrentSubtitleIndex();

  // Auto scroll to current sentence
  useEffect(() => {
    // Don't auto-scroll if any popup is open
    if (openPopup.type !== null) {
      return;
    }

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
  }, [currentIndex, openPopup.type]);

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
                    isOpen={openPopup.type === 'speed' && openPopup.index === index}
                    onToggle={() => handlePopupToggle('speed', index)}
                    onClose={handleClosePopup}
                  />
                  <VolumeControl
                    subtitleIndex={index}
                    currentVolume={subtitle.volume}
                    onVolumeChange={(volume) => setSubtitleVolume(index, volume)}
                    isOpen={openPopup.type === 'volume' && openPopup.index === index}
                    onToggle={() => handlePopupToggle('volume', index)}
                    onClose={handleClosePopup}
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