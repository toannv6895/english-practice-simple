import { StorageLocation } from '../../infrastructure/storage/StorageStrategy';

export interface AudioFile {
  id: string;
  userId: string;
  playlistId?: string;
  originalName: string;
  mimeType?: string;
  fileSize: number;
  duration: number;
  storageLocation: StorageLocation;
  transcript?: string;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}