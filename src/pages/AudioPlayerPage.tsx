import React, { useCallback, memo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AudioPlayerComponent } from '../components/AudioPlayer';
import { Toolbar } from '../components/Toolbar';
import { ListeningMode } from '../components/ListeningMode';
import { DictationMode } from '../components/DictationMode';
import { ShadowingMode } from '../components/ShadowingMode';
import { TranscriptRegenerator } from '../components/TranscriptRegenerator';
import { parseSRT, parseVTT } from '../utils/subtitleParser';
import { useAppStore } from '../store/useAppStore';
import { usePlaylistStore } from '../store/usePlaylistStore';
import { SubtitleEntry } from '../types';
import { Headphones, PenTool, ArrowLeft, Upload } from 'lucide-react';

const AudioPlayerPage = memo(() => {
  const { playlistId, audioId } = useParams<{ playlistId: string; audioId: string }>();
  const navigate = useNavigate();
  const {
    audioUrl,
    subtitles,
    practiceMode,
    setAudioUrl,
    setSubtitles,
    setSubtitleFile,
    resetAll,
  } = useAppStore();
  
  const { getAudiosByPlaylistId, getPlaylistById } = usePlaylistStore();
  const [showRegenerator, setShowRegenerator] = useState(false);

  // Get current audio
  const audios = playlistId ? getAudiosByPlaylistId(playlistId) : [];
  const currentAudio = audios.find(audio => audio.id === audioId);
  const playlist = playlistId ? getPlaylistById(playlistId) : null;

  useEffect(() => {
    if (!currentAudio) {
      navigate('/');
      return;
    }

    // Set audio URL when component mounts
    setAudioUrl(currentAudio.url);
  }, [currentAudio, setAudioUrl, navigate]);

  useEffect(() => {
    // Reset audio state when leaving the page
    return () => {
      resetAll();
    };
  }, [resetAll]);

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

  if (!currentAudio || !playlist) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Audio not found</h2>
                      <button
              onClick={() => navigate('/')}
              className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
            >
              Go Home
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(`/playlist/${playlistId}`)}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{currentAudio.name}</h1>
              <p className="text-gray-600 mt-1">{playlist.name}</p>
            </div>
          </div>
        </div>

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
              <div className="w-24 h-24 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Headphones size={32} className="text-teal-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Get Started</h3>
              <p className="text-gray-600 mb-6">
                Upload an audio file to begin practicing your English skills.
              </p>
              <button
                onClick={() => navigate('/upload-audio')}
                className="flex items-center space-x-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors mx-auto"
              >
                <Upload className="w-5 h-5" />
                <span>Upload Audio File</span>
              </button>
            </div>
          </div>
        )}

        {/* No Subtitles Message */}
        {audioUrl && subtitles.length === 0 && (
          <div className="text-center py-8">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <PenTool size={24} className="text-teal-600" />
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

AudioPlayerPage.displayName = 'AudioPlayerPage';

export default AudioPlayerPage;
