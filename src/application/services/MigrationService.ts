import { AudioService } from './AudioService';
import { PlaylistService } from './PlaylistService';
import { RecordingService } from './RecordingService';
import { StorageManager } from '../../infrastructure/storage/StorageManager';
import { StorageProvider } from '../../infrastructure/storage/StorageStrategy';
import { AudioFile } from '../../domain/entities/AudioFile';
import { Playlist } from '../../domain/entities/Playlist';
import { Recording } from '../../domain/entities/Recording';

export interface MigrationProgress {
  totalFiles: number;
  migratedFiles: number;
  failedFiles: number;
  currentFile?: string;
  errors: string[];
}

export class MigrationService {
  constructor(
    private audioService: AudioService,
    private playlistService: PlaylistService,
    private recordingService: RecordingService,
    private storageManager: StorageManager
  ) {}

  async migrateFromLocalStorage(
    userId: string,
    targetProvider: StorageProvider = StorageProvider.S3,
    onProgress?: (progress: MigrationProgress) => void
  ): Promise<MigrationProgress> {
    const progress: MigrationProgress = {
      totalFiles: 0,
      migratedFiles: 0,
      failedFiles: 0,
      errors: [],
    };

    try {
      // Get local storage data
      const localData = await this.getLocalStorageData(userId);
      
      progress.totalFiles = 
        localData.audios.length + 
        localData.playlists.length + 
        localData.recordings.length;

      // Migrate audios
      for (const audio of localData.audios) {
        try {
          progress.currentFile = audio.originalName;
          onProgress?.(progress);

          const migratedAudio = await this.migrateAudio(audio, targetProvider);
          progress.migratedFiles++;
          onProgress?.(progress);
        } catch (error) {
          progress.failedFiles++;
          progress.errors.push(`Audio ${audio.originalName}: ${error instanceof Error ? error.message : String(error)}`);
          onProgress?.(progress);
        }
      }

      // Migrate playlists
      for (const playlist of localData.playlists) {
        try {
          progress.currentFile = playlist.name;
          onProgress?.(progress);

          const migratedPlaylist = await this.migratePlaylist(playlist, targetProvider);
          progress.migratedFiles++;
          onProgress?.(progress);
        } catch (error) {
          progress.failedFiles++;
          progress.errors.push(`Playlist ${playlist.name}: ${error instanceof Error ? error.message : String(error)}`);
          onProgress?.(progress);
        }
      }

      // Migrate recordings
      for (const recording of localData.recordings) {
        try {
          progress.currentFile = `Recording ${recording.id}`;
          onProgress?.(progress);

          const migratedRecording = await this.migrateRecording(recording, targetProvider);
          progress.migratedFiles++;
          onProgress?.(progress);
        } catch (error) {
          progress.failedFiles++;
          progress.errors.push(`Recording ${recording.id}: ${error instanceof Error ? error.message : String(error)}`);
          onProgress?.(progress);
        }
      }

      // Clean up local storage
      await this.cleanupLocalStorage(userId);

      return progress;
    } catch (error) {
      progress.errors.push(`Migration failed: ${error instanceof Error ? error.message : String(error)}`);
      return progress;
    }
  }

  private async getLocalStorageData(userId: string) {
    // This would read from the old local storage structure
    const localStorage = window.localStorage;
    
    const audios = JSON.parse(localStorage.getItem('audios') || '[]');
    const playlists = JSON.parse(localStorage.getItem('playlists') || '[]');
    const recordings = JSON.parse(localStorage.getItem('recordings') || '[]');

    return {
      audios: audios.filter((a: any) => a.userId === userId),
      playlists: playlists.filter((p: any) => p.userId === userId),
      recordings: recordings.filter((r: any) => r.userId === userId),
    };
  }

  private async migrateAudio(audio: any, targetProvider: StorageProvider) {
    // Create file from audio data
    const file = new File([audio.audioData], audio.originalName || 'audio.mp3', {
      type: audio.mimeType || 'audio/mpeg',
    });

    // Upload using audio service
    return await this.audioService.uploadAudio(
      file,
      audio.userId,
      audio.playlistId,
      {
        transcript: audio.transcript,
        language: audio.language,
        difficulty: audio.difficulty,
        tags: audio.tags || [],
        duration: audio.duration || 0
      }
    );
  }

  private async migratePlaylist(playlist: any, targetProvider: StorageProvider) {
    return await this.playlistService.createPlaylist(
      playlist.userId,
      playlist.name,
      playlist.description
    );
  }

  private async migrateRecording(recording: any, targetProvider: StorageProvider) {
    // Create file from recording data
    const file = new File([recording.audioData], `${recording.id}.wav`, {
      type: 'audio/wav',
    });

    // Create recording using recording service
    return await this.recordingService.createRecording(
      recording.userId,
      recording.audioId,
      file,
      recording.accuracyScore,
      recording.duration
    );
  }

  private async cleanupLocalStorage(userId: string) {
    // Remove migrated data from local storage
    const localStorage = window.localStorage;
    
    const audios = JSON.parse(localStorage.getItem('audios') || '[]');
    const playlists = JSON.parse(localStorage.getItem('playlists') || '[]');
    const recordings = JSON.parse(localStorage.getItem('recordings') || '[]');

    const filteredAudios = audios.filter((a: any) => a.userId !== userId);
    const filteredPlaylists = playlists.filter((p: any) => p.userId !== userId);
    const filteredRecordings = recordings.filter((r: any) => r.userId !== userId);

    localStorage.setItem('audios', JSON.stringify(filteredAudios));
    localStorage.setItem('playlists', JSON.stringify(filteredPlaylists));
    localStorage.setItem('recordings', JSON.stringify(filteredRecordings));
  }

  async rollbackMigration(userId: string): Promise<void> {
    // This would restore data from backup
    // Implementation depends on backup strategy
    throw new Error('Rollback not implemented yet');
  }
}