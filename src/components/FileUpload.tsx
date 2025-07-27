import React, { useRef, memo } from 'react';
import { Upload, FileAudio } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

interface FileUploadProps {
  onAudioFileSelect: (file: File) => void;
}

export const FileUpload: React.FC<FileUploadProps> = memo(({ onAudioFileSelect }) => {
  const { audioFile } = useAppStore();
  const audioInputRef = useRef<HTMLInputElement>(null);

  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      onAudioFileSelect(file);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 mb-6 border border-gray-100">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2 text-gray-800">Upload Audio File</h2>
        <p className="text-gray-600 mb-8">Select an audio file to begin practicing</p>
        
        <div className="max-w-md mx-auto">
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary-400 transition-colors duration-200">
            <FileAudio className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <p className="text-sm text-gray-600 mb-4">
              {audioFile ? audioFile.name : 'No audio file selected'}
            </p>
            <button
              onClick={() => audioInputRef.current?.click()}
              className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
            >
              <Upload className="inline w-5 h-5 mr-2" />
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

        {/* Instructions */}
        <div className="mt-8 p-4 bg-primary-50 rounded-lg max-w-md mx-auto">
          <h4 className="font-medium text-primary-800 mb-2">How it works:</h4>
          <ul className="text-sm text-primary-700 space-y-1">
            <li>• Upload an audio file (MP3, WAV, OGG, M4A)</li>
            <li>• If you have a transcript file (.srt or .vtt) with the same name in the same folder, it will be automatically detected</li>
            <li>• You can also import a transcript later using the toolbar</li>
          </ul>
        </div>
      </div>
    </div>
  );
});

FileUpload.displayName = 'FileUpload';