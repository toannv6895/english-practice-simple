import React, { useState } from 'react';
import { AudioFile } from '../types';
import { Edit, Trash2, Play, Clock, Music } from 'lucide-react';

interface AudioItemProps {
  audio: AudioFile;
  onEdit: (audio: AudioFile) => void;
  onDelete: (audioId: string) => void;
  onClick: (audio: AudioFile) => void;
  isOwner?: boolean;
}

export const AudioItem: React.FC<AudioItemProps> = ({
  audio,
  onEdit,
  onDelete,
  onClick,
  isOwner = false,
}) => {
  const [showActions, setShowActions] = useState(false);

  const formatDuration = (seconds: number | undefined) => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div
      className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 cursor-pointer relative group"
      onClick={() => onClick(audio)}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="p-4">
        <div className="flex items-center space-x-4">
          {/* Audio Icon */}
          <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Music className="w-6 h-6 text-teal-600" />
          </div>

          {/* Audio Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium text-gray-900 truncate">
              {audio.name}
            </h3>
            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{formatDuration(audio.duration)}</span>
              </div>
              <span>•</span>
              <span>Added {formatDate(new Date(audio.created_at))}</span>
            </div>
          </div>

          {/* Play Button */}
          <div className="flex items-center space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClick(audio);
              }}
              className="p-2 bg-teal-600 text-white rounded-full hover:bg-teal-700 transition-colors"
              title="Play audio"
            >
              <Play className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {isOwner && showActions && (
        <div className="absolute top-2 right-2 flex gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(audio);
            }}
            className="p-2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full shadow-md transition-all duration-200 hover:scale-105"
            title="Edit audio"
          >
            <Edit className="w-4 h-4 text-teal-600" />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(audio.id);
            }}
            className="p-2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full shadow-md transition-all duration-200 hover:scale-105"
            title="Delete audio"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      )}
    </div>
  );
};
