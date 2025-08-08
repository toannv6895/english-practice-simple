import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlaylistCard } from '../components/PlaylistCard';
import { usePlaylistStore } from '../store/usePlaylistStore';
import { Playlist } from '../types';
import { Music, Plus } from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { publicPlaylists, getPublicPlaylists, setPublicPlaylists } = usePlaylistStore();

  useEffect(() => {
    // Load public playlists
    const publicPlaylists = getPublicPlaylists();
    setPublicPlaylists(publicPlaylists);
  }, [getPublicPlaylists, setPublicPlaylists]);

  const handlePlaylistClick = (playlist: Playlist) => {
    navigate(`/playlist/${playlist.id}`);
  };

  const handleCreatePlaylist = () => {
    navigate('/playlist');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Discover Playlists</h1>
            <p className="text-gray-600 mt-2">
              Explore public playlists created by the community
            </p>
          </div>
          <button
            onClick={handleCreatePlaylist}
            className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Create Playlist</span>
          </button>
        </div>

        {/* Playlists Grid */}
        {publicPlaylists.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {publicPlaylists.map((playlist) => (
              <PlaylistCard
                key={playlist.id}
                playlist={playlist}
                onEdit={() => {}} // No edit on home page
                onDelete={() => {}} // No delete on home page
                onClick={handlePlaylistClick}
                isOwner={false}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Music size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Public Playlists</h3>
              <p className="text-gray-600 mb-6">
                Be the first to create a public playlist and share it with the community!
              </p>
              <button
                onClick={handleCreatePlaylist}
                className="flex items-center space-x-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors mx-auto"
              >
                <Plus className="w-5 h-5" />
                <span>Create Your First Playlist</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
