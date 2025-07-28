import React, { useState, useEffect, useRef, memo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Mic, Play, Square, Download, RotateCcw } from 'lucide-react';
import { cn } from '../utils/cn';
import { CurrentSentence } from './CurrentSentence';
import { useGlobalKeyboardShortcuts } from '../hooks/useGlobalKeyboardShortcuts';

export const ShadowingMode: React.FC = memo(() => {
  const {
    subtitles,
    currentTime,
    isPlaying,
    currentSentenceIndex,
    shadowingMode,
    setCurrentTime,
    setCurrentSentenceIndex,
    setIsPlaying,
    setShadowingMode,
    stopAudio,
    practiceMode
  } = useAppStore();
  const [recordings, setRecordings] = useState<Record<number, Blob>>({});
  const [isRecording, setIsRecording] = useState(false);
  const [playingRecording, setPlayingRecording] = useState<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Initialize sentence index when component loads or when switching to shadowing mode
  useEffect(() => {
    if (subtitles.length > 0 && practiceMode === 'shadowing') {
      // Find the current subtitle based on time, or keep current index
      const timeBasedIndex = subtitles.findIndex(
        subtitle => currentTime >= subtitle.startTime && currentTime <= subtitle.endTime
      );
      // Only update if we found a valid time-based index and it's different
      if (timeBasedIndex !== -1 && timeBasedIndex !== currentSentenceIndex) {
        setCurrentSentenceIndex(timeBasedIndex);
      }
    }
  }, [subtitles, practiceMode, currentTime, currentSentenceIndex, setCurrentSentenceIndex]);

  // Auto-stop functionality for sentence mode (similar to dictation)
  useEffect(() => {
    if (practiceMode === 'shadowing' && shadowingMode === 'sentence' && isPlaying) {
      const currentSubtitle = subtitles[currentSentenceIndex];
      if (currentSubtitle && currentTime >= currentSubtitle.endTime - 0.1) {
        stopAudio();
      }
    }
  }, [currentTime, currentSentenceIndex, subtitles, isPlaying, practiceMode, shadowingMode, stopAudio]);

  // Use the shared sentence index
  const currentSubtitleIndex = currentSentenceIndex;

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
          [currentSentenceIndex]: audioBlob
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

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
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

  const downloadRecording = (index: number) => {
    const recording = recordings[index];
    if (recording) {
      const url = URL.createObjectURL(recording);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recording-sentence-${index + 1}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const currentSubtitle = subtitles[currentSubtitleIndex];
  const hasRecording = recordings[currentSentenceIndex];

  const handleNextSentence = () => {
    if (currentSentenceIndex < subtitles.length - 1) {
      const nextIndex = currentSentenceIndex + 1;
      const nextSubtitle = subtitles[nextIndex];
      setCurrentSentenceIndex(nextIndex);
      setCurrentTime(nextSubtitle.startTime);
      // Auto-play in sentence mode
      if (shadowingMode === 'sentence') {
        setIsPlaying(true);
      }
    }
  };

  const handlePreviousSentence = () => {
    if (currentSentenceIndex > 0) {
      const prevIndex = currentSentenceIndex - 1;
      const prevSubtitle = subtitles[prevIndex];
      setCurrentSentenceIndex(prevIndex);
      setCurrentTime(prevSubtitle.startTime);
      // Auto-play in sentence mode
      if (shadowingMode === 'sentence') {
        setIsPlaying(true);
      }
    }
  };

  // Use global keyboard shortcuts
  useGlobalKeyboardShortcuts({
    onNext: handleNextSentence,
    onToggleRecording: toggleRecording
  });

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
      <CurrentSentence
        showPlayingIndicator={true}
      />


      {/* Recording Controls */}
      <div className="mb-6">
        <div className="flex items-center justify-center gap-4 mb-4">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200",
              isRecording
                ? "bg-red-500 text-white hover:bg-red-600"
                : hasRecording
                ? "bg-amber-500 text-white hover:bg-amber-600"
                : "bg-primary-500 text-white hover:bg-primary-600"
            )}
          >
            {isRecording ? (
              <>
                <Square size={16} />
                Stop Recording
              </>
            ) : hasRecording ? (
              <>
                <RotateCcw size={16} />
                Try Again
              </>
            ) : (
              <>
                <Mic size={16} />
                Start Recording
              </>
            )}
          </button>
        </div>
        
        {isRecording && (
          <div className="flex items-center gap-2 text-red-600">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Recording...</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-end gap-6 mb-6">
        {/* Shadowing Mode Radio Buttons */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <input
              type="radio"
              id="sentence-mode"
              name="shadowingMode"
              checked={shadowingMode === 'sentence'}
              onChange={() => setShadowingMode('sentence')}
              className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 focus:ring-primary-500 focus:ring-2"
            />
            <label
              htmlFor="sentence-mode"
              className="text-sm font-medium text-gray-700 cursor-pointer"
              title="Audio will automatically stop after each sentence, similar to dictation mode"
            >
              Sentence
            </label>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="radio"
              id="full-mode"
              name="shadowingMode"
              checked={shadowingMode === 'full'}
              onChange={() => setShadowingMode('full')}
              className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 focus:ring-primary-500 focus:ring-2"
            />
            <label
              htmlFor="full-mode"
              className="text-sm font-medium text-gray-700 cursor-pointer"
              title="Audio will play continuously until manually stopped"
            >
              Full
            </label>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={handlePreviousSentence}
            disabled={currentSentenceIndex === 0}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200",
              currentSentenceIndex === 0
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            )}
          >
            Previous
          </button>
          
          <button
            onClick={handleNextSentence}
            disabled={currentSentenceIndex === subtitles.length - 1}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200",
              currentSentenceIndex === subtitles.length - 1
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-primary-500 text-white hover:bg-primary-600"
            )}
          >
            Next
          </button>
        </div>
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
                      title="Play recording"
                    >
                      <Play size={14} />
                    </button>
                    <button
                      onClick={() => downloadRecording(subtitleIndex)}
                      className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200"
                      title="Download recording"
                    >
                      <Download size={14} />
                    </button>
                    <button
                      onClick={() => deleteRecording(subtitleIndex)}
                      className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors duration-200"
                      title="Delete recording"
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