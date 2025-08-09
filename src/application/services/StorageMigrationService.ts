import { StorageManager } from '../../infrastructure/storage/StorageManager';
import { AudioRepository } from '../../domain/repositories/AudioRepository';
import { PlaylistRepository } from '../../domain/repositories/PlaylistRepository';
import { RecordingRepository } from '../../domain/repositories/RecordingRepository';
import { AudioFile } from '../../domain/entities/AudioFile';
import { Playlist } from '../../domain/entities/Playlist';
import { Recording } from '../../domain/entities/Recording';

export interface MigrationResult {
  totalFiles: number;
  migratedFiles: number;
  failedFiles: number;
  errors: string[];
}

export class StorageMigrationService {
  constructor(
    private storageManager: StorageManager,
    private audioRepository: AudioRepository,
    private playlistRepository: PlaylistRepository,
    private recordingRepository: RecordingRepository
  ) {}

  async migrateUserData(
    userId: string,
    options: {
      from: string;
      to: string;
      batchSize?: number;
    }
  ): Promise<MigrationResult> {
    const result: MigrationResult = {
      totalFiles: 0,
      migratedFiles: 0,
      failedFiles: 0,
      errors: [],
    };

    try {
      // Get all user data
      const [audios, playlists, recordings] = await Promise.all([
        this.audioRepository.findByUserId(userId),
        this.playlistRepository.findByUserId(userId),
        this.recordingRepository.findByUserId(userId),
      ]);

      const allFiles = [...audios, ...playlists, ...recordings];
      result.totalFiles = allFiles.length;

      // Process in batches
      const batchSize = options.batchSize || 10;
      for (let i = 0; i < allFiles.length; i += batchSize) {
        const batch = allFiles.slice(i, i + batchSize);
        await this.processBatch(batch, options, result);
      }

      return result;
    } catch (error) {
      result.errors.push(`Migration failed: ${error instanceof Error ? error.message : String(error)}`);
      return result;
    }
  }

  private async processBatch(
    items: (AudioFile | Playlist | Recording)[],
    options: { from: string; to: string },
    result: MigrationResult
  ) {
    await Promise.all(
      items.map(async (item) => {
        try {
          if ('storageLocation' in item && item.storageLocation) {
            // Migrate storage location
            const newLocation = await this.storageManager.migrateStorage(
              item.storageLocation,
              options.to as any
            );

            // Update item with new storage location
            item.storageLocation = newLocation;

            // Save updated item
            if ('originalName' in item) {
              await this.audioRepository.update(item.id, item as AudioFile);
            } else if ('name' in item && 'audioIds' in item) {
              await this.playlistRepository.update(item.id, item as Playlist);
            } else {
              await this.recordingRepository.update(item.id, item as Recording);
            }

            result.migratedFiles++;
          }
        } catch (error) {
          result.failedFiles++;
          result.errors.push(`Failed to migrate ${item.id}: ${error instanceof Error ? error.message : String(error)}`);
        }
      })
    );
  }

  async rollback(userId: string, backupData: any): Promise<boolean> {
    try {
      // Restore from backup
      await this.restoreFromBackup(userId, backupData);
      return true;
    } catch (error) {
      console.error('Rollback failed:', error);
      return false;
    }
  }

  private async restoreFromBackup(userId: string, backupData: any) {
    // Implementation for restoring from backup
    console.log('Restoring backup for user:', userId);
  }

  async createBackup(userId: string): Promise<any> {
    // Create backup of all user data
    const [audios, playlists, recordings] = await Promise.all([
      this.audioRepository.findByUserId(userId),
      this.playlistRepository.findByUserId(userId),
      this.recordingRepository.findByUserId(userId),
    ]);

    return {
      audios,
      playlists,
      recordings,
      timestamp: new Date().toISOString(),
    };
  }
}