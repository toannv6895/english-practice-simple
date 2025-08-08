import React, { memo } from 'react';
import { Headphones, PenTool, Mic, Upload, RefreshCw } from 'lucide-react';
import { PracticeMode } from '../types';
import { useAppStore } from '../store/useAppStore';
import { cn } from '../utils/cn';

interface ToolbarProps {
  onImportTranscript: () => void;
  onRegenerateTranscript?: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = memo(({ onImportTranscript, onRegenerateTranscript }) => {
  const { practiceMode, subtitles, setPracticeMode } = useAppStore();
  const hasSubtitles = subtitles.length > 0;
  const practiceModes: { mode: PracticeMode; label: string; icon: React.ReactNode }[] = [
    { mode: 'listening', label: 'Listening', icon: <Headphones size={20} /> },
    { mode: 'dictation', label: 'Dictation', icon: <PenTool size={20} /> },
    { mode: 'shadowing', label: 'Shadowing', icon: <Mic size={20} /> }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 mb-6 border border-gray-100">
      <div className="flex items-center justify-between">
        {/* Practice Mode Buttons */}
        <div className="flex space-x-1 flex-1">
          {practiceModes.map(({ mode, label, icon }) => (
            <button
              key={mode}
              onClick={() => setPracticeMode(mode)}
              disabled={!hasSubtitles}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex-1",
                practiceMode === mode
                  ? "bg-teal-600 text-white shadow-sm"
                  : hasSubtitles
                    ? "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    : "text-gray-400 cursor-not-allowed"
              )}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>

        {/* Transcript Actions */}
        <div className="ml-4 flex space-x-2">
          {onRegenerateTranscript && hasSubtitles && (
            <button
              onClick={onRegenerateTranscript}
              className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-md text-sm font-medium transition-all duration-200 shadow-sm"
              title="Regenerate transcript with optimized formatting"
            >
              <RefreshCw size={16} />
              Regenerate
            </button>
          )}
          <button
            onClick={onImportTranscript}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md text-sm font-medium transition-all duration-200 shadow-sm"
          >
            <Upload size={16} />
            Import Transcript
          </button>
        </div>
      </div>
    </div>
  );
});

Toolbar.displayName = 'Toolbar';