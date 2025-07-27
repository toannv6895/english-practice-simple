import React, { useState, useCallback } from 'react';
import { AudioPlayer } from './components/AudioPlayer';
import { FileUpload } from './components/FileUpload';
import { ListeningMode } from './components/ListeningMode';
import { DictationMode } from './components/DictationMode';
import { ShadowingMode } from './components/ShadowingMode';
import { parseSRT, parseVTT, findSubtitleFile } from './utils/subtitleParser';
import { SubtitleEntry, PracticeMode } from './types';
import { Headphones, PenTool, Mic } from 'lucide-react';
import { cn } from './utils/cn';

function App() {
  const [audioFile, setAudioFile] = useState<File | undefined>(undefined);
  const [subtitleFile, setSubtitleFile] = useState<File | undefined>(undefined);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [subtitles, setSubtitles] = useState<SubtitleEntry[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [practiceMode, setPracticeMode] = useState<PracticeMode>('listening');

  const handleAudioFileSelect = useCallback((file: File) => {
    setAudioFile(file);
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    
    // Try to find matching subtitle file
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files) {
        const subtitleFile = findSubtitleFile(file.name, target.files);
        if (subtitleFile) {
          handleSubtitleFileSelect(subtitleFile);
        }
      }
    };
    input.click();
  }, []);

  const handleSubtitleFileSelect = useCallback(async (file: File) => {
    setSubtitleFile(file);
    
    try {
      const content = await file.text();
      let parsedSubtitles: SubtitleEntry[];
      
      if (file.name.endsWith('.srt')) {
        parsedSubtitles = parseSRT(content);
      } else if (file.name.endsWith('.vtt')) {
        parsedSubtitles = parseVTT(content);
      } else {
        throw new Error('Unsupported subtitle format');
      }
      
      setSubtitles(parsedSubtitles);
    } catch (error) {
      console.error('Error parsing subtitle file:', error);
      alert('Error parsing subtitle file. Please check the file format.');
    }
  }, []);

  const handleTimeUpdate = useCallback((time: number) => {
    setCurrentTime(time);
  }, []);

  const handleLoadedMetadata = useCallback((audioDuration: number) => {
    setDuration(audioDuration);
  }, []);

  const handlePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const handleSeekToTime = useCallback((time: number) => {
    setCurrentTime(time);
  }, []);

  const practiceModes: { mode: PracticeMode; label: string; icon: React.ReactNode }[] = [
    { mode: 'listening', label: 'Listening', icon: <Headphones size={20} /> },
    { mode: 'dictation', label: 'Dictation', icon: <PenTool size={20} /> },
    { mode: 'shadowing', label: 'Shadowing', icon: <Mic size={20} /> }
  ];

  const renderPracticeMode = () => {
    switch (practiceMode) {
      case 'listening':
        return (
          <ListeningMode
            subtitles={subtitles}
            currentTime={currentTime}
            onSeekToTime={handleSeekToTime}
          />
        );
      case 'dictation':
        return (
          <DictationMode
            subtitles={subtitles}
            currentTime={currentTime}
            onSeekToTime={handleSeekToTime}
            isPlaying={isPlaying}
          />
        );
      case 'shadowing':
        return (
          <ShadowingMode
            subtitles={subtitles}
            currentTime={currentTime}
            onSeekToTime={handleSeekToTime}
            isPlaying={isPlaying}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">English Practice</h1>
          <p className="text-gray-600">Improve your English listening, dictation, and shadowing skills</p>
        </header>

        {/* File Upload */}
        <FileUpload
          onAudioFileSelect={handleAudioFileSelect}
          onSubtitleFileSelect={handleSubtitleFileSelect}
          selectedAudioFile={audioFile}
          selectedSubtitleFile={subtitleFile}
        />

        {/* Audio Player */}
        {audioUrl && (
          <AudioPlayer
            audioUrl={audioUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            currentTime={currentTime}
            duration={duration}
          />
        )}

        {/* Practice Mode Tabs */}
        {audioUrl && subtitles.length > 0 && (
          <div className="mb-6">
            <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-lg">
              {practiceModes.map(({ mode, label, icon }) => (
                <button
                  key={mode}
                  onClick={() => setPracticeMode(mode)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex-1",
                    practiceMode === mode
                      ? "bg-primary-500 text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  )}
                >
                  {icon}
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Practice Mode Content */}
        {audioUrl && subtitles.length > 0 && renderPracticeMode()}

        {/* No Files Message */}
        {!audioUrl && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Headphones size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Get Started</h3>
              <p className="text-gray-600">
                Upload an audio file to begin practicing your English skills.
              </p>
            </div>
          </div>
        )}

        {/* No Subtitles Message */}
        {audioUrl && subtitles.length === 0 && (
          <div className="text-center py-8">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <PenTool size={24} className="text-yellow-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Subtitles Found</h3>
              <p className="text-gray-600">
                Upload a subtitle file (.srt or .vtt) to enable practice modes.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App; 