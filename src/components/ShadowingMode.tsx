import React, { useState, useEffect, useRef, memo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Mic, Play, Square } from 'lucide-react';
import { cn } from '../utils/cn';

export const ShadowingMode: React.FC = memo(() => {
  const { subtitles, currentTime, isPlaying, setCurrentTime } = useAppStore();
  const [currentSubtitleIndex, setCurrentSubtitleIndex] = useState(0);
  const [recordings, setRecordings] = useState<Record<number, Blob>>({});
  const [isRecording, setIsRecording] = useState(false);
  const [playingRecording, setPlayingRecording] = useState<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const getCurrentSubtitleIndex = (): number => {
    return subtitles.findIndex(
      subtitle => currentTime >= subtitle.startTime && currentTime <= subtitle.endTime
    );
  };

  useEffect(() => {
    const newIndex = getCurrentSubtitleIndex();
    if (newIndex !== -1 && newIndex !== currentSubtitleIndex) {
      setCurrentSubtitleIndex(newIndex);
    }
  }, [currentTime, subtitles, currentSubtitleIndex]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setRecordings(prev => ({
          ...prev,
          [currentSubtitleIndex]: audioBlob
        }));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Error accessing microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const playRecording = (index: number) => {
    const recording = recordings[index];
    if (recording) {
      const audioUrl = URL.createObjectURL(recording);
      const audio = new Audio(audioUrl);
      setPlayingRecording(index);
      
      audio.onended = () => {
        setPlayingRecording(null);
        URL.revokeObjectURL(audioUrl);
      };
      
      audio.play().catch(console.error);
    }
  };

  const deleteRecording = (index: number) => {
    setRecordings(prev => {
      const newRecordings = { ...prev };
      delete newRecordings[index];
      return newRecordings;
    });
  };

  const currentSubtitle = subtitles[currentSubtitleIndex];
  const hasRecording = recordings[currentSubtitleIndex];

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

      {/* Recording Controls */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200",
              isRecording
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-primary-500 text-white hover:bg-primary-600"
            )}
          >
            {isRecording ? (
              <>
                <Square size={16} />
                Stop Recording
              </>
            ) : (
              <>
                <Mic size={16} />
                Start Recording
              </>
            )}
          </button>
          
          {hasRecording && (
            <button
              onClick={() => playRecording(currentSubtitleIndex)}
              disabled={playingRecording === currentSubtitleIndex}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors duration-200 disabled:opacity-50"
            >
              <Play size={16} />
              {playingRecording === currentSubtitleIndex ? 'Playing...' : 'Play Recording'}
            </button>
          )}
          
          {hasRecording && (
            <button
              onClick={() => deleteRecording(currentSubtitleIndex)}
              className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors duration-200"
            >
              Delete
            </button>
          )}
        </div>
        
        {isRecording && (
          <div className="flex items-center gap-2 text-red-600">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Recording...</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          onClick={() => {
            if (currentSubtitleIndex > 0) {
              const prevSubtitle = subtitles[currentSubtitleIndex - 1];
              setCurrentTime(prevSubtitle.startTime);
            }
          }}
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
          onClick={() => {
            if (currentSubtitleIndex < subtitles.length - 1) {
              const nextSubtitle = subtitles[currentSubtitleIndex + 1];
              setCurrentTime(nextSubtitle.startTime);
            }
          }}
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

      {/* Recordings List */}
      {Object.keys(recordings).length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-800 mb-3">Your Recordings</h3>
          <div className="space-y-2">
            {Object.entries(recordings).map(([index, recording]) => {
              const subtitleIndex = parseInt(index);
              const subtitle = subtitles[subtitleIndex];
              return (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">
                      Sentence {subtitleIndex + 1}
                    </p>
                    <p className="text-xs text-gray-600">{subtitle.text}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => playRecording(subtitleIndex)}
                      disabled={playingRecording === subtitleIndex}
                      className="p-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors duration-200 disabled:opacity-50"
                    >
                      <Play size={14} />
                    </button>
                    <button
                      onClick={() => deleteRecording(subtitleIndex)}
                      className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors duration-200"
                    >
                      <Square size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
});

ShadowingMode.displayName = 'ShadowingMode';

function formatTime(time: number): string {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}