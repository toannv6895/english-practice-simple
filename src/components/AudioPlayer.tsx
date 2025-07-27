import React, { useRef, useEffect, useState } from 'react';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import { cn } from '../utils/cn';
import './AudioPlayer.css';

interface AudioPlayerProps {
  audioUrl: string;
  onTimeUpdate: (currentTime: number) => void;
  onLoadedMetadata: (duration: number) => void;
  isPlaying: boolean;
  onPlayPause: () => void;
  currentTime: number;
  duration: number;
}

export const AudioPlayerComponent: React.FC<AudioPlayerProps> = ({
  audioUrl,
  onTimeUpdate,
  onLoadedMetadata,
  isPlaying,
  onPlayPause,
  currentTime,
  duration
}) => {
  const playerRef = useRef<any>(null);

  useEffect(() => {
    if (playerRef.current) {
      const audio = playerRef.current.audio.current;
      if (audio) {
        audio.currentTime = currentTime;
      }
    }
  }, [currentTime]);

  const handleListen = (e: any) => {
    onTimeUpdate(e.target.currentTime);
  };

  const handleLoadedMetadata = (e: any) => {
    onLoadedMetadata(e.target.duration);
  };

  const handlePlay = () => {
    if (!isPlaying) {
      onPlayPause();
    }
  };

  const handlePause = () => {
    if (isPlaying) {
      onPlayPause();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
      <AudioPlayer
        ref={playerRef}
        src={audioUrl}
        onListen={handleListen}
        onLoadedMetaData={handleLoadedMetadata}
        onPlay={handlePlay}
        onPause={handlePause}
        showJumpControls={false}
        showFilledProgress={true}
        showFilledVolume={true}
        style={{
          backgroundColor: 'transparent',
          boxShadow: 'none',
          borderRadius: '0',
        }}
        className="custom-audio-player"
      />
    </div>
  );
}; 