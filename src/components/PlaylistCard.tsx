import React, { useState } from 'react';
import { Playlist } from '../types';
import { Edit, Trash2, Music, Users, Lock, Globe } from 'lucide-react';

interface PlaylistCardProps {
  playlist: Playlist;
  onEdit: (playlist: Playlist) => void;
  onDelete: (playlistId: string) => void;
  onClick: (playlist: Playlist) => void;
  isOwner?: boolean;
}

export const PlaylistCard: React.FC<PlaylistCardProps> = ({
  playlist,
  onEdit,
  onDelete,
  onClick,
  isOwner = false,
}) => {
  const [showActions, setShowActions] = useState(false);

  const getVisibilityIcon = () => {
    switch (playlist.visibility) {
      case 'public':
        return <Globe className="w-4 h-4 text-teal-600" />;
      case 'protected':
        return <Users className="w-4 h-4 text-teal-600" />;
      case 'private':
        return <Lock className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getVisibilityText = () => {
    switch (playlist.visibility) {
      case 'public':
        return 'Public';
      case 'protected':
        return 'Protected';
      case 'private':
        return 'Private';
      default:
        return '';
    }
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
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer relative group"
      onClick={() => onClick(playlist)}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Cover Image */}
      <div className="relative h-48 bg-gradient-to-br from-teal-500 to-teal-600 rounded-t-lg overflow-hidden">
        {playlist.coverImage ? (
          <img
            src={playlist.coverImage}
            alt={playlist.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Music className="w-16 h-16 text-white opacity-80" />
          </div>
        )}
        
        {/* Audio Count Badge */}
        <div className="absolute top-3 right-3 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-sm font-medium">
          {playlist.audioCount} audio{playlist.audioCount !== 1 ? 's' : ''}
        </div>
        
        {/* Visibility Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-sm">
          {getVisibilityIcon()}
          <span>{getVisibilityText()}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
          {playlist.name}
        </h3>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {playlist.description || 'No description available'}
        </p>
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Created {formatDate(playlist.createdAt)}</span>
          <span>Updated {formatDate(playlist.updatedAt)}</span>
        </div>
      </div>

      {/* Action Buttons */}
      {isOwner && showActions && (
        <div className="absolute top-2 right-2 flex gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(playlist);
            }}
            className="p-2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full shadow-md transition-all duration-200 hover:scale-105"
            title="Edit playlist"
          >
            <Edit className="w-4 h-4 text-teal-600" />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(playlist.id);
            }}
            className="p-2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full shadow-md transition-all duration-200 hover:scale-105"
            title="Delete playlist"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      )}
    </div>
  );
};
