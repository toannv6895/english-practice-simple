import React, { useRef, useCallback, memo, useEffect } from 'react';
import { Play, Pause, Volume2, SkipBack, SkipForward, Rewind, FastForward } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { cn } from '../utils/cn';

interface AudioPlayerProps {
  className?: string;
}

export const AudioPlayerComponent: React.FC<AudioPlayerProps> = memo(({ className }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const {
    audioUrl,
    isPlaying,
    currentTime,
    duration,
    playbackSpeed,
    volume,
    practiceMode,
    subtitles,
    setIsPlaying,
    setCurrentTime,
    setDuration,
    setPlaybackSpeed,
    setVolume,
    stopAudio,
  } = useAppStore();

  // Handle play/pause
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(console.error);
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Handle playback speed changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // Handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Handle seeking
  useEffect(() => {
    if (audioRef.current && Math.abs(audioRef.current.currentTime - currentTime) > 1) {
      audioRef.current.currentTime = currentTime;
    }
  }, [currentTime]);

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      const newTime = audioRef.current.currentTime;
      setCurrentTime(newTime);
      
      // Auto-stop in dictation mode when current subtitle ends
      if (practiceMode === 'dictation' && isPlaying) {
        const currentSubtitleIndex = subtitles.findIndex(
          subtitle => newTime >= subtitle.startTime && newTime <= subtitle.endTime
        );
        
        if (currentSubtitleIndex !== -1) {
          const currentSubtitle = subtitles[currentSubtitleIndex];
          if (newTime >= currentSubtitle.endTime - 0.1) { // Add small buffer to prevent premature stopping
            stopAudio();
          }
        }
      }
    }
  }, [setCurrentTime, practiceMode, isPlaying, subtitles, stopAudio]);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  }, [setDuration]);

  const handlePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying, setIsPlaying]);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = parseFloat(e.target.value);
    setCurrentTime(seekTime);
  }, [setCurrentTime]);

  const handleSkipBackward = useCallback(() => {
    const newTime = Math.max(0, currentTime - 10);
    setCurrentTime(newTime);
  }, [currentTime, setCurrentTime]);

  const handleSkipForward = useCallback(() => {
    const newTime = Math.min(duration, currentTime + 10);
    setCurrentTime(newTime);
  }, [currentTime, duration, setCurrentTime]);

  const handleBack5s = useCallback(() => {
    const newTime = Math.max(0, currentTime - 5);
    setCurrentTime(newTime);
  }, [currentTime, setCurrentTime]);

  const handleForward5s = useCallback(() => {
    const newTime = Math.min(duration, currentTime + 5);
    setCurrentTime(newTime);
  }, [currentTime, duration, setCurrentTime]);

  const handleSpeedChange = useCallback((speed: number) => {
    setPlaybackSpeed(speed);
  }, [setPlaybackSpeed]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  }, [setVolume]);

  const formatTime = useCallback((time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  if (!audioUrl) return null;

  return (
    <div className={cn("bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100", className)}>
      {/* Hidden HTML5 Audio Element */}
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        preload="metadata"
        style={{ display: 'none' }}
      />

      {/* Custom Audio Controls */}
      <div className="flex flex-col space-y-4">
        {/* Main Controls */}
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={handleSkipBackward}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
            title="Skip backward 10s"
          >
            <SkipBack size={18} className="text-gray-700" />
          </button>
          
          <button
            onClick={handleBack5s}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
            title="Back 5s"
          >
            <Rewind size={18} className="text-gray-700" />
          </button>
          
          <button
            onClick={handlePlayPause}
            className="p-3 rounded-full bg-primary-500 hover:bg-primary-600 text-white transition-colors duration-200 shadow-md"
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>
          
          <button
            onClick={handleForward5s}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
            title="Forward 5s"
          >
            <FastForward size={18} className="text-gray-700" />
          </button>
          
          <button
            onClick={handleSkipForward}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
            title="Skip forward 10s"
          >
            <SkipForward size={18} className="text-gray-700" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-500 font-medium min-w-[40px]">
            {formatTime(currentTime)}
          </span>
          
          <div className="flex-1 relative">
            <input
              type="range"
              min={0}
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #14b8a6 0%, #14b8a6 ${(currentTime / (duration || 1)) * 100}%, #e5e7eb ${(currentTime / (duration || 1)) * 100}%, #e5e7eb 100%)`
              }}
            />
          </div>
          
          <span className="text-sm text-gray-500 font-medium min-w-[40px]">
            {formatTime(duration)}
          </span>
        </div>

        {/* Volume and Speed Controls */}
        <div className="flex items-center justify-between space-x-4">
          {/* Volume Control */}
          <div className="flex items-center space-x-2">
            <Volume2 size={16} className="text-gray-500" />
            <input
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={volume}
              className="w-20 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              onChange={handleVolumeChange}
              style={{
                background: `linear-gradient(to right, #14b8a6 0%, #14b8a6 ${volume * 100}%, #e5e7eb ${volume * 100}%, #e5e7eb 100%)`
              }}
            />
          </div>

          {/* Speed Control */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 font-medium">Speed:</span>
            <div className="flex space-x-1">
              {[0.25, 0.5, 0.75, 1].map((speed) => (
                <button
                  key={speed}
                  onClick={() => handleSpeedChange(speed)}
                  className={cn(
                    "px-2 py-1 text-xs rounded transition-colors duration-200",
                    playbackSpeed === speed
                      ? "bg-primary-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

AudioPlayerComponent.displayName = 'AudioPlayerComponent';