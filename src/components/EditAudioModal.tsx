import React, { useState } from 'react';
import { AudioFile } from '../types';
import { X, Music } from 'lucide-react';

interface EditAudioModalProps {
  audio: AudioFile | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (audioId: string, updates: Partial<AudioFile>) => void;
}

export const EditAudioModal: React.FC<EditAudioModalProps> = ({
  audio,
  isOpen,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(audio?.name || '');

  React.useEffect(() => {
    if (audio) {
      setName(audio.name);
    }
  }, [audio]);

  const handleSave = () => {
    if (!audio || !name.trim()) return;

    onSave(audio.id, { name: name.trim() });
    onClose();
  };

  const handleClose = () => {
    setName(audio?.name || '');
    onClose();
  };

  if (!isOpen || !audio) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Edit Audio</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Audio Info */}
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
              <Music className="w-6 h-6 text-teal-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{audio.name}</h3>
              <p className="text-sm text-gray-500">
                Duration: {Math.floor(audio.duration / 60)}:{Math.floor(audio.duration % 60).toString().padStart(2, '0')}
              </p>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Audio Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Enter audio name"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
