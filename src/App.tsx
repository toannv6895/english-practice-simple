import React, { useState, useCallback } from 'react';
import { AudioPlayerComponent } from './components/AudioPlayer';
import { FileUpload } from './components/FileUpload';
import { Toolbar } from './components/Toolbar';
import { ListeningMode } from './components/ListeningMode';
import { DictationMode } from './components/DictationMode';
import { ShadowingMode } from './components/ShadowingMode';
import { parseSRT, parseVTT, findSubtitleFile } from './utils/subtitleParser';
import { SubtitleEntry, PracticeMode } from './types';
import { Headphones, PenTool } from 'lucide-react';
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

  const handleAudioFileSelect = useCallback(async (file: File) => {
    setAudioFile(file);
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    
    // Try to auto-detect subtitle file from the same folder
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = true;
      input.accept = '.srt,.vtt';
      
      input.onchange = (e) => {
        const target = e.target as HTMLInputElement;
        if (target.files) {
          const subtitleFile = findSubtitleFile(file.name, target.files);
          if (subtitleFile) {
            handleSubtitleFileSelect(subtitleFile);
          }
        }
      };
      
      // Auto-trigger file selection for transcript detection
      input.click();
    } catch (error) {
      console.error('Error auto-detecting subtitle file:', error);
    }
  }, [handleSubtitleFileSelect]);

  const handleImportTranscript = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.srt,.vtt';
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        handleSubtitleFileSelect(target.files[0]);
      }
    };
    input.click();
  }, [handleSubtitleFileSelect]);

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

        {/* File Upload - Only show when no audio is uploaded */}
        {!audioUrl && (
          <FileUpload
            onAudioFileSelect={handleAudioFileSelect}
            selectedAudioFile={audioFile}
          />
        )}

        {/* Audio Player - Show when audio is uploaded */}
        {audioUrl && (
          <AudioPlayerComponent
            audioUrl={audioUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            currentTime={currentTime}
            duration={duration}
          />
        )}

        {/* Toolbar - Show when audio is uploaded */}
        {audioUrl && (
          <Toolbar
            practiceMode={practiceMode}
            onPracticeModeChange={setPracticeMode}
            onImportTranscript={handleImportTranscript}
            hasSubtitles={subtitles.length > 0}
          />
        )}

        {/* Practice Mode Content - Show when audio and subtitles are available */}
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Transcript Found</h3>
              <p className="text-gray-600">
                Use the "Import Transcript" button in the toolbar to add a subtitle file (.srt or .vtt) to enable practice modes.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App; 