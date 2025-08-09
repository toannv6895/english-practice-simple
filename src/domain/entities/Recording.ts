import { StorageLocation } from '../../infrastructure/storage/StorageStrategy';

export interface Recording {
  id: string;
  userId: string;
  audioId: string;
  type: 'shadow' | 'dictation' | 'listening';
  storageLocation: StorageLocation;
  accuracyScore?: number;
  duration: number;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}