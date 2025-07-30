import React, { useCallback, memo, useState } from 'react';
import { AudioPlayerComponent } from './components/AudioPlayer';
import { FileUpload } from './components/FileUpload';
import { Toolbar } from './components/Toolbar';
import { ListeningMode } from './components/ListeningMode';
import { DictationMode } from './components/DictationMode';
import { ShadowingMode } from './components/ShadowingMode';
import { TranscriptRegenerator } from './components/TranscriptRegenerator';
import { parseSRT, parseVTT, createAutoDetectInput } from './utils/subtitleParser';
import { useAppStore } from './store/useAppStore';
import { SubtitleEntry } from './types';
import { Headphones, PenTool } from 'lucide-react';

const App = memo(() => {
  const {
    audioUrl,
    subtitles,
    practiceMode,
    setAudioFile,
    setAudioUrl,
    setSubtitles,
    setSubtitleFile,
    setCurrentTime,
  } = useAppStore();
  const [showRegenerator, setShowRegenerator] = useState(false);

  const handleSubtitleFileSelect = useCallback(async (file: File) => {
    setSubtitleFile(file);
    
    try {
      const content = await file.text();
      let parsedSubtitles;
      
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
  }, [setSubtitleFile, setSubtitles]);

  const handleAudioFileSelect = useCallback(async (file: File) => {
    setAudioFile(file);
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    
    // Try to auto-detect subtitle file with same name
    createAutoDetectInput(file.name, handleSubtitleFileSelect);
  }, [setAudioFile, setAudioUrl, handleSubtitleFileSelect]);

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

  const handleRegenerateTranscript = useCallback((regeneratedSubtitles: SubtitleEntry[]) => {
    setSubtitles(regeneratedSubtitles);
    setShowRegenerator(false);
  }, [setSubtitles]);

  const handleOpenRegenerator = useCallback(() => {
    setShowRegenerator(true);
  }, []);


  const renderPracticeMode = useCallback(() => {
    switch (practiceMode) {
      case 'listening':
        return <ListeningMode />;
      case 'dictation':
        return <DictationMode />;
      case 'shadowing':
        return <ShadowingMode />;
      default:
        return null;
    }
  }, [practiceMode]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* File Upload - Only show when no audio is uploaded */}
        {!audioUrl && (
          <FileUpload
            onAudioFileSelect={handleAudioFileSelect}
          />
        )}

        {/* Audio Player - Show when audio is uploaded */}
        {audioUrl && <AudioPlayerComponent />}

        {/* Toolbar - Show when audio is uploaded */}
        {audioUrl && (
          <Toolbar
            onImportTranscript={handleImportTranscript}
            onRegenerateTranscript={subtitles.length > 0 ? handleOpenRegenerator : undefined}
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

        {/* Transcript Regenerator Modal */}
        {showRegenerator && (
          <TranscriptRegenerator
            originalSubtitles={subtitles}
            onRegenerate={handleRegenerateTranscript}
            onCancel={() => setShowRegenerator(false)}
          />
        )}
      </div>
    </div>
  );
});

App.displayName = 'App';

export default App;