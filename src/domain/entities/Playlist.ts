import { StorageLocation } from '../../infrastructure/storage/StorageStrategy';

export interface Playlist {
  id: string;
  userId: string;
  name: string;
  description?: string;
  imageLocation?: StorageLocation;
  audioIds: string[];
  createdAt: Date;
  updatedAt: Date;
}