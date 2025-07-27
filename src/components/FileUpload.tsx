import React, { useRef } from 'react';
import { Upload, FileAudio, FileText } from 'lucide-react';
import { cn } from '../utils/cn';

interface FileUploadProps {
  onAudioFileSelect: (file: File) => void;
  onSubtitleFileSelect: (file: File) => void;
  selectedAudioFile?: File;
  selectedSubtitleFile?: File;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onAudioFileSelect,
  onSubtitleFileSelect,
  selectedAudioFile,
  selectedSubtitleFile
}) => {
  const audioInputRef = useRef<HTMLInputElement>(null);
  const subtitleInputRef = useRef<HTMLInputElement>(null);

  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      onAudioFileSelect(file);
    }
  };

  const handleSubtitleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.name.endsWith('.srt') || file.name.endsWith('.vtt'))) {
      onSubtitleFileSelect(file);
    }
  };

  const handleFolderSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    let audioFile: File | null = null;
    let subtitleFile: File | null = null;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (file.type.startsWith('audio/')) {
        audioFile = file;
      } else if (file.name.endsWith('.srt') || file.name.endsWith('.vtt')) {
        subtitleFile = file;
      }
    }

    if (audioFile) {
      onAudioFileSelect(audioFile);
    }

    if (subtitleFile) {
      onSubtitleFileSelect(subtitleFile);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Upload Files</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Audio File Upload */}
        <div>
          <h3 className="text-lg font-medium text-gray-700 mb-3">Audio File</h3>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors duration-200">
            <FileAudio className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-sm text-gray-600 mb-2">
              {selectedAudioFile ? selectedAudioFile.name : 'No audio file selected'}
            </p>
            <button
              onClick={() => audioInputRef.current?.click()}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-200"
            >
              Select Audio File
            </button>
            <input
              ref={audioInputRef}
              type="file"
              accept="audio/*"
              onChange={handleAudioFileChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Subtitle File Upload */}
        <div>
          <h3 className="text-lg font-medium text-gray-700 mb-3">Subtitle File (Optional)</h3>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors duration-200">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-sm text-gray-600 mb-2">
              {selectedSubtitleFile ? selectedSubtitleFile.name : 'No subtitle file selected'}
            </p>
            <button
              onClick={() => subtitleInputRef.current?.click()}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-200"
            >
              Select Subtitle File
            </button>
            <input
              ref={subtitleInputRef}
              type="file"
              accept=".srt,.vtt"
              onChange={handleSubtitleFileChange}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Folder Upload */}
      <div className="mt-6">
        <h3 className="text-lg font-medium text-gray-700 mb-3">Or Upload Folder</h3>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors duration-200">
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-sm text-gray-600 mb-2">
            Select a folder containing audio and subtitle files
          </p>
          <button
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.webkitdirectory = true;
              input.multiple = true;
              input.onchange = (e) => {
                const target = e.target as HTMLInputElement;
                if (target.files) {
                  handleFolderSelect({ target } as React.ChangeEvent<HTMLInputElement>);
                }
              };
              input.click();
            }}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-200"
          >
            Select Folder
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-800 mb-2">Instructions:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Upload an MP3 audio file to get started</li>
          <li>• If you have a subtitle file (.srt or .vtt) with the same name as your audio file, it will be automatically detected</li>
          <li>• You can also manually select a subtitle file from a different location</li>
          <li>• Supported audio formats: MP3, WAV, OGG, M4A</li>
          <li>• Supported subtitle formats: SRT, VTT</li>
        </ul>
      </div>
    </div>
  );
}; 