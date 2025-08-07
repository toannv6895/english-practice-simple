import React, { useEffect, useRef, memo } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { cn } from '../utils/cn';

interface VolumeControlProps {
  subtitleIndex: number;
  currentVolume?: number;
  onVolumeChange: (volume: number | undefined) => void;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export const VolumeControl: React.FC<VolumeControlProps> = memo(({
  subtitleIndex,
  currentVolume,
  onVolumeChange,
  isOpen,
  onToggle,
  onClose
}) => {
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
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
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
        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10 min-w-[200px]" onClick={(e) => e.stopPropagation()}>
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
                onClick={(e) => e.stopPropagation()}
                className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <Volume2 size={14} className="text-gray-500" />
            </div>
            
            <div className="text-center text-xs text-gray-600">
              {Math.round((currentVolume ?? 1) * 100)}%
            </div>
            
            {currentVolume !== undefined && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleVolumeChange(undefined);
                }}
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
});

VolumeControl.displayName = 'VolumeControl';