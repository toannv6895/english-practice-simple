import { AudioFile } from '../../domain/entities/AudioFile';
import { AudioRepository } from '../../domain/repositories/AudioRepository';
import { StorageManager } from '../../infrastructure/storage/StorageManager';
import { StorageProvider } from '../../infrastructure/storage/StorageStrategy';

export class AudioService {
  constructor(
    private audioRepository: AudioRepository,
    private storageManager: StorageManager
  ) {}

  async uploadAudio(
    file: File,
    userId: string,
    playlistId: string,
    metadata?: any
  ): Promise<AudioFile> {
    // Upload to storage
    const storageLocation = await this.storageManager.uploadAudio(
      file,
      userId,
      playlistId,
      metadata
    );

    // Create audio entity
    const audioData = {
      userId,
      playlistId,
      originalName: file.name,
      mimeType: file.type,
      fileSize: file.size,
      duration: metadata?.duration || 0,
      storageLocation,
      transcript: metadata?.transcript,
      metadata: {
        language: metadata?.language,
        difficulty: metadata?.difficulty,
        tags: metadata?.tags || [],
      },
    };

    // Save to repository
    return await this.audioRepository.save(audioData);
  }

  async getUserAudios(userId: string, limit?: number, offset?: number): Promise<AudioFile[]> {
    return await this.audioRepository.findByUserId(userId);
  }

  async getPlaylistAudios(playlistId: string): Promise<AudioFile[]> {
    return await this.audioRepository.findByPlaylistId(playlistId);
  }

  async getAudio(id: string): Promise<AudioFile | null> {
    return await this.audioRepository.findById(id);
  }

  async deleteAudio(id: string): Promise<void> {
    const audio = await this.audioRepository.findById(id);
    if (!audio) {
      throw new Error('Audio not found');
    }

    // Delete from storage
    await this.storageManager.delete(audio.storageLocation);

    // Delete from repository
    await this.audioRepository.delete(id);
  }

  async downloadAudio(id: string): Promise<Blob> {
    const audio = await this.audioRepository.findById(id);
    if (!audio) {
      throw new Error('Audio not found');
    }

    return await this.storageManager.download(audio.storageLocation);
  }

  async getAudioUrl(id: string, expiresIn: number = 3600): Promise<string> {
    const audio = await this.audioRepository.findById(id);
    if (!audio) {
      throw new Error('Audio not found');
    }

    return await this.storageManager.getSignedUrl(audio.storageLocation, expiresIn);
  }

  async migrateAudioStorage(
    audioId: string,
    targetProvider: StorageProvider
  ): Promise<AudioFile> {
    const audio = await this.audioRepository.findById(audioId);
    if (!audio) {
      throw new Error('Audio not found');
    }

    // Migrate storage
    const newLocation = await this.storageManager.migrateStorage(
      audio.storageLocation,
      targetProvider
    );

    // Update audio with new storage location
    return await this.audioRepository.update(audioId, {
      storageLocation: newLocation,
    });
  }
}