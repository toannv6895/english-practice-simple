import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileUpload } from '../components/FileUpload';

import { ArrowLeft } from 'lucide-react';

const UploadAudioPage: React.FC = () => {
  const navigate = useNavigate();
  // Removed unused imports

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 text-gray-600 hover:text-teal-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Upload Audio File</h1>
              <p className="text-gray-600 mt-1">Select an audio file to begin practicing</p>
            </div>
          </div>
        </div>

        {/* Upload Component */}
        <FileUpload 
          playlistId="default-playlist" 
          onUploadComplete={() => navigate(-1)} 
        />
      </div>
    </div>
  );
};

export default UploadAudioPage;

