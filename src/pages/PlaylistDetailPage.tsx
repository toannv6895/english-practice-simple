import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AudioItem } from '../components/AudioItem';
import { EditAudioModal } from '../components/EditAudioModal';
import { usePlaylistStore } from '../store/usePlaylistStore';
import { useAuthStore } from '../store/useAuthStore';
import { FileUpload } from '../components/FileUpload';
import { AudioFile } from '../types';
import { ArrowLeft, Music, Plus } from 'lucide-react';

export const PlaylistDetailPage: React.FC = () => {
  const { playlistId } = useParams<{ playlistId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    playlists,
    audios,
    isLoading,
    error,
    fetchUserPlaylists,
    fetchAudiosByPlaylist,
    clearError
  } = usePlaylistStore();

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAudio, setEditingAudio] = useState<AudioFile | null>(null);

  const playlist = playlistId ? playlists.find(p => p.id === playlistId) : null;
  const isOwner = playlist?.owner_id === user?.id;

  useEffect(() => {
    if (user) {
      fetchUserPlaylists();
    }
  }, [user, fetchUserPlaylists]);

  useEffect(() => {
    if (playlistId) {
      fetchAudiosByPlaylist(playlistId);
    }
  }, [playlistId, fetchAudiosByPlaylist]);

  useEffect(() => {
    if (!playlist && playlistId && !isLoading) {
      // Playlist not found, redirect to home
      navigate('/playlist');
    }
  }, [playlist, playlistId, navigate, isLoading]);

  const handleAudioClick = (audio: AudioFile) => {
    navigate(`/playlist/${playlistId}/audio/${audio.id}`);
  };

  const handleEditAudio = (audio: AudioFile) => {
    setEditingAudio(audio);
    setShowEditModal(true);
  };

  const handleDeleteAudio = (audioId: string) => {
    // TODO: Implement delete audio functionality
    console.log('Delete audio:', audioId);
  };

  const handleUpdateAudio = (audioId: string, updates: Partial<AudioFile>) => {
    // TODO: Implement update audio functionality
    console.log('Update audio:', audioId, updates);
  };

  const handleUploadComplete = () => {
    // Refresh the audio list after upload
    if (playlistId) {
      fetchAudiosByPlaylist(playlistId);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Playlist not found</h2>
          <button
            onClick={() => navigate('/playlist')}
            className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            Go Back
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
              onClick={() => navigate('/playlist')}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{playlist.name}</h1>
              <p className="text-gray-600 mt-1">{playlist.description}</p>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
            <button
              onClick={clearError}
              className="mt-2 text-sm text-red-500 hover:text-red-700"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Upload Section for Owner */}
        {isOwner && (
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Audio Files</h3>
            <FileUpload 
              playlistId={playlistId!} 
              onUploadComplete={handleUploadComplete}
            />
          </div>
        )}

        {/* Audio List */}
        {audios.length > 0 ? (
          <div className="space-y-4">
            {audios.map((audio) => (
              <AudioItem
                key={audio.id}
                audio={audio}
                onEdit={handleEditAudio}
                onDelete={handleDeleteAudio}
                onClick={handleAudioClick}
                isOwner={isOwner}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Music size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Audio Files</h3>
              <p className="text-gray-600 mb-6">
                {isOwner
                  ? 'Upload your first audio file to start practicing.'
                  : 'This playlist is empty.'}
              </p>
              {isOwner && (
                <div className="max-w-md mx-auto">
                  <FileUpload 
                    playlistId={playlistId!} 
                    onUploadComplete={handleUploadComplete}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Edit Audio Modal */}
        <EditAudioModal
          audio={editingAudio}
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingAudio(null);
          }}
          onSave={handleUpdateAudio}
        />
      </div>
    </div>
  );
};
