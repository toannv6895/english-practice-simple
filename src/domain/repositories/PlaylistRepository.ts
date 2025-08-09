import { Playlist } from '../entities/Playlist';

export interface PlaylistRepository {
  save(playlist: Omit<Playlist, 'id' | 'createdAt' | 'updatedAt'>): Promise<Playlist>;
  findById(id: string): Promise<Playlist | null>;
  findByUserId(userId: string): Promise<Playlist[]>;
  update(id: string, updates: Partial<Playlist>): Promise<Playlist>;
  delete(id: string): Promise<void>;
  addAudio(playlistId: string, audioId: string): Promise<void>;
  removeAudio(playlistId: string, audioId: string): Promise<void>;
}