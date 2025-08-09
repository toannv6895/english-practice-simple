import { Playlist } from '../../domain/entities/Playlist';
import { PlaylistRepository } from '../../domain/repositories/PlaylistRepository';
import { StorageManager } from '../../infrastructure/storage/StorageManager';

export class PlaylistService {
  constructor(
    private playlistRepository: PlaylistRepository,
    private storageManager: StorageManager
  ) {}

  async createPlaylist(
    userId: string,
    name: string,
    description?: string
  ): Promise<Playlist> {
    const playlist: Playlist = {
      id: crypto.randomUUID(),
      userId,
      name,
      description,
      audioIds: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return await this.playlistRepository.save(playlist);
  }

  async getUserPlaylists(userId: string): Promise<Playlist[]> {
    return await this.playlistRepository.findByUserId(userId);
  }

  async getPlaylist(id: string): Promise<Playlist | null> {
    return await this.playlistRepository.findById(id);
  }

  async updatePlaylist(
    id: string,
    updates: Partial<Pick<Playlist, 'name' | 'description'>>
  ): Promise<Playlist> {
    return await this.playlistRepository.update(id, updates);
  }

  async deletePlaylist(id: string): Promise<void> {
    const playlist = await this.playlistRepository.findById(id);
    if (!playlist) {
      throw new Error('Playlist not found');
    }

    // Delete playlist image if exists
    if (playlist.imageLocation) {
      await this.storageManager.delete(playlist.imageLocation);
    }

    await this.playlistRepository.delete(id);
  }

  async uploadPlaylistImage(
    playlistId: string,
    file: File,
    userId: string
  ): Promise<Playlist> {
    const playlist = await this.playlistRepository.findById(playlistId);
    if (!playlist) {
      throw new Error('Playlist not found');
    }

    // Delete old image if exists
    if (playlist.imageLocation) {
      await this.storageManager.delete(playlist.imageLocation);
    }

    // Upload new image
    const imageLocation = await this.storageManager.uploadAudio(
      file,
      userId,
      playlistId,
      { type: 'playlist-image' }
    );

    // Update playlist with new image
    return await this.playlistRepository.update(playlistId, {
      imageLocation,
    });
  }

  async addAudioToPlaylist(playlistId: string, audioId: string): Promise<void> {
    await this.playlistRepository.addAudio(playlistId, audioId);
  }

  async removeAudioFromPlaylist(playlistId: string, audioId: string): Promise<void> {
    await this.playlistRepository.removeAudio(playlistId, audioId);
  }
}