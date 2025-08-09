import { Recording } from '../entities/Recording';

export interface RecordingRepository {
  create(recording: Omit<Recording, 'id' | 'createdAt' | 'updatedAt'>): Promise<Recording>;
  findById(id: string): Promise<Recording | null>;
  findByUserId(userId: string): Promise<Recording[]>;
  findByAudioId(audioId: string): Promise<Recording[]>;
  findByType(type: 'shadow' | 'dictation' | 'listening'): Promise<Recording[]>;
  update(id: string, updates: Partial<Recording>): Promise<Recording>;
  delete(id: string): Promise<void>;
}