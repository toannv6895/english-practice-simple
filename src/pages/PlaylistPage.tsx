import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlaylistCard } from '../components/PlaylistCard';
import { CreatePlaylistModal } from '../components/CreatePlaylistModal';
import { EditPlaylistModal } from '../components/EditPlaylistModal';
import { usePlaylistStore } from '../store/usePlaylistStore';
import { Playlist, PlaylistVisibility } from '../types';
import { Music, Plus } from 'lucide-react';

export const PlaylistPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    playlists: userPlaylists,
    fetchUserPlaylists,
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    isLoading,
  } = usePlaylistStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);

  useEffect(() => {
    fetchUserPlaylists();
  }, [fetchUserPlaylists]);

  const handlePlaylistClick = (playlist: Playlist) => {
    navigate(`/playlist/${playlist.id}`);
  };

  const handleEditPlaylist = (playlist: Playlist) => {
    setEditingPlaylist(playlist);
    setShowEditModal(true);
  };

  const handleDeletePlaylist = (playlistId: string) => {
    if (window.confirm('Are you sure you want to delete this playlist? This action cannot be undone.')) {
      deletePlaylist(playlistId);
    }
  };

  const handleCreatePlaylist = (playlistData: {
    name: string;
    description?: string;
    visibility: PlaylistVisibility;
    cover_image?: string;
  }) => {
    createPlaylist(playlistData);
    setShowCreateModal(false);
  };

  const handleUpdatePlaylist = (playlistId: string, updates: Partial<Playlist>) => {
    updatePlaylist(playlistId, updates);
    setShowEditModal(false);
    setEditingPlaylist(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Playlists</h1>
            <p className="text-gray-600 mt-2">
              Manage your playlists and create new ones
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Create Playlist</span>
          </button>
        </div>

        {/* Playlists Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading playlists...</p>
          </div>
        ) : userPlaylists.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {userPlaylists.map((playlist: Playlist) => (
              <PlaylistCard
                key={playlist.id}
                playlist={playlist}
                onEdit={handleEditPlaylist}
                onDelete={handleDeletePlaylist}
                onClick={handlePlaylistClick}
                isOwner={true}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Music size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Playlists Yet</h3>
              <p className="text-gray-600 mb-6">
                Create your first playlist to start organizing your audio files for practice.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center space-x-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors mx-auto"
              >
                <Plus className="w-5 h-5" />
                <span>Create Your First Playlist</span>
              </button>
            </div>
          </div>
        )}

        {/* Create Playlist Modal */}
        <CreatePlaylistModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreatePlaylist}
        />

        {/* Edit Playlist Modal */}
        <EditPlaylistModal
          playlist={editingPlaylist}
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingPlaylist(null);
          }}
          onSave={handleUpdatePlaylist}
        />
      </div>
    </div>
  );
};
