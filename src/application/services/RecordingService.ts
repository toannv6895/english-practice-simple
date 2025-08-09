import { Recording } from '../../domain/entities/Recording';
import { RecordingRepository } from '../../domain/repositories/RecordingRepository';
import { StorageManager } from '../../infrastructure/storage/StorageManager';

export class RecordingService {
  constructor(
    private recordingRepository: RecordingRepository,
    private storageManager: StorageManager
  ) {}

  async createRecording(
    userId: string,
    audioId: string,
    file: File,
    accuracyScore?: number,
    duration?: number
  ): Promise<Recording> {
    // Upload recording file
    const storageLocation = await this.storageManager.uploadAudio(
      file,
      userId,
      audioId,
      {
        type: 'recording',
        recordingType: 'shadow',
        accuracyScore,
        duration,
      }
    );

    // Create recording entity
    const recordingData = {
      userId,
      audioId,
      type: 'shadow' as const,
      storageLocation,
      accuracyScore,
      duration: duration || 0,
      metadata: {
        recordingType: 'shadow',
        accuracyScore,
        duration,
      },
    };

    // Save to repository
    return await this.recordingRepository.create(recordingData);
  }

  async getUserRecordings(userId: string): Promise<Recording[]> {
    return await this.recordingRepository.findByUserId(userId);
  }

  async getAudioRecordings(audioId: string): Promise<Recording[]> {
    return await this.recordingRepository.findByAudioId(audioId);
  }

  async getRecording(id: string): Promise<Recording | null> {
    return await this.recordingRepository.findById(id);
  }

  async deleteRecording(id: string): Promise<void> {
    const recording = await this.recordingRepository.findById(id);
    if (!recording) {
      throw new Error('Recording not found');
    }

    // Delete from storage
    await this.storageManager.delete(recording.storageLocation);

    // Delete from repository
    await this.recordingRepository.delete(id);
  }

  async downloadRecording(id: string): Promise<Blob> {
    const recording = await this.recordingRepository.findById(id);
    if (!recording) {
      throw new Error('Recording not found');
    }

    return await this.storageManager.download(recording.storageLocation);
  }

  async getRecordingUrl(id: string, expiresIn: number = 3600): Promise<string> {
    const recording = await this.recordingRepository.findById(id);
    if (!recording) {
      throw new Error('Recording not found');
    }

    return await this.storageManager.getSignedUrl(recording.storageLocation, expiresIn);
  }

  async updateRecordingAccuracy(
    id: string,
    accuracyScore: number
  ): Promise<Recording> {
    return await this.recordingRepository.update(id, { 
      accuracyScore,
      metadata: { accuracyScore }
    });
  }
}