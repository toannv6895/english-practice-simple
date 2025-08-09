import { AudioFile } from '../entities/AudioFile';

export interface AudioRepository {
  save(audio: Omit<AudioFile, 'id' | 'createdAt' | 'updatedAt'>): Promise<AudioFile>;
  findById(id: string): Promise<AudioFile | null>;
  findByUserId(userId: string): Promise<AudioFile[]>;
  findByPlaylistId(playlistId: string): Promise<AudioFile[]>;
  update(id: string, updates: Partial<AudioFile>): Promise<AudioFile>;
  delete(id: string): Promise<void>;
}