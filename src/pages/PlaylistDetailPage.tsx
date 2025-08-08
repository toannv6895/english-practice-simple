import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AudioItem } from '../components/AudioItem';
import { EditAudioModal } from '../components/EditAudioModal';
import { usePlaylistStore } from '../store/usePlaylistStore';
import { AudioFile } from '../types';
import { ArrowLeft, Upload, Music, Plus } from 'lucide-react';

export const PlaylistDetailPage: React.FC = () => {
  const { playlistId } = useParams<{ playlistId: string }>();
  const navigate = useNavigate();
  const {
    getPlaylistById,
    getAudiosByPlaylistId,
    addAudio,
    updateAudio,
    deleteAudio,
  } = usePlaylistStore();

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAudio, setEditingAudio] = useState<AudioFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const playlist = playlistId ? getPlaylistById(playlistId) : null;
  const audios = playlistId ? getAudiosByPlaylistId(playlistId) : [];
  const currentUserId = 'current-user-id'; // This should come from auth context
  const isOwner = playlist?.ownerId === currentUserId;

  useEffect(() => {
    if (!playlist && playlistId) {
      // Playlist not found, redirect to home
      navigate('/');
    }
  }, [playlist, playlistId, navigate]);

  const handleAudioFileSelect = async (file: File) => {
    if (!playlistId) return;

    // Create a mock duration (in a real app, you'd get this from the audio file)
    const duration = Math.random() * 300 + 60; // Random duration between 1-6 minutes

    const newAudio: Omit<AudioFile, 'id' | 'createdAt' | 'updatedAt'> = {
      name: file.name.replace(/\.[^/.]+$/, ''), // Remove file extension
      url: URL.createObjectURL(file),
      duration,
      playlistId,
    };

    addAudio(newAudio);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      handleAudioFileSelect(file);
    }
    // Reset the input so the same file can be selected again
    e.target.value = '';
  };

  const handleAudioClick = (audio: AudioFile) => {
    navigate(`/playlist/${playlistId}/audio/${audio.id}`);
  };

  const handleEditAudio = (audio: AudioFile) => {
    setEditingAudio(audio);
    setShowEditModal(true);
  };

  const handleDeleteAudio = (audioId: string) => {
    deleteAudio(audioId);
  };

  const handleUpdateAudio = (audioId: string, updates: Partial<AudioFile>) => {
    updateAudio(audioId, updates);
  };

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
          {isOwner && audios.length > 0 && (
            <button
              onClick={handleUploadClick}
              className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              <Upload className="w-5 h-5" />
              <span>Upload Audio</span>
            </button>
          )}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleFileChange}
          className="hidden"
        />

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
                <button
                  onClick={handleUploadClick}
                  className="flex items-center space-x-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors mx-auto"
                >
                  <Plus className="w-5 h-5" />
                  <span>Upload First Audio</span>
                </button>
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
