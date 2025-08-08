import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileUpload } from '../components/FileUpload';
import { useAppStore } from '../store/useAppStore';
import { ArrowLeft, Upload } from 'lucide-react';

const UploadAudioPage: React.FC = () => {
  const navigate = useNavigate();
  const { setAudioFile, setAudioUrl } = useAppStore();

  const handleAudioFileSelect = useCallback((file: File) => {
    setAudioFile(file);
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    
    // Navigate back to audio player page after successful upload
    navigate(-1);
  }, [setAudioFile, setAudioUrl, navigate]);

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
        <FileUpload onAudioFileSelect={handleAudioFileSelect} />
      </div>
    </div>
  );
};

export default UploadAudioPage;
