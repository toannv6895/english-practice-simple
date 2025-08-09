import { StorageManager } from '../storage/StorageManager';
import { S3StorageAdapter } from '../storage/adapters/S3StorageAdapter';
import { LocalStorageAdapter } from '../storage/adapters/LocalStorageAdapter';
import { SupabaseAudioRepository } from '../repositories/SupabaseAudioRepository';
import { SupabasePlaylistRepository } from '../repositories/SupabasePlaylistRepository';
import { SupabaseRecordingRepository } from '../repositories/SupabaseRecordingRepository';
import { StorageMigrationService } from '../../application/services/StorageMigrationService';
import { MigrationService } from '../../application/services/MigrationService';
import { AudioService } from '../../application/services/AudioService';
import { PlaylistService } from '../../application/services/PlaylistService';
import { RecordingService } from '../../application/services/RecordingService';

export class ServiceFactory {
  private static instance: ServiceFactory;
  private storageManager: StorageManager;
  private audioRepository: SupabaseAudioRepository;
  private playlistRepository: SupabasePlaylistRepository;
  private recordingRepository: SupabaseRecordingRepository;
  private audioService: AudioService;
  private playlistService: PlaylistService;
  private recordingService: RecordingService;
  private storageMigrationService: StorageMigrationService;
  private migrationService: MigrationService;

  private constructor() {
    // Initialize storage adapters
    const s3Adapter = new S3StorageAdapter();
    const localAdapter = new LocalStorageAdapter();
    
    // Initialize storage manager
    this.storageManager = new StorageManager();
    this.storageManager.registerAdapter('s3', s3Adapter);
    this.storageManager.registerAdapter('local', localAdapter);
    
    // Initialize repositories
    this.audioRepository = new SupabaseAudioRepository();
    this.playlistRepository = new SupabasePlaylistRepository();
    this.recordingRepository = new SupabaseRecordingRepository();
    
    // Initialize services
    this.audioService = new AudioService(this.audioRepository, this.storageManager);
    this.playlistService = new PlaylistService(this.playlistRepository, this.storageManager);
    this.recordingService = new RecordingService(this.recordingRepository, this.storageManager);
    
    // Initialize migration services
    this.storageMigrationService = new StorageMigrationService(
      this.storageManager,
      this.audioRepository,
      this.playlistRepository,
      this.recordingRepository
    );
    
    this.migrationService = new MigrationService(
      this.audioService,
      this.playlistService,
      this.recordingService,
      this.storageManager
    );
  }

  public static getInstance(): ServiceFactory {
    if (!ServiceFactory.instance) {
      ServiceFactory.instance = new ServiceFactory();
    }
    return ServiceFactory.instance;
  }

  public getStorageManager(): StorageManager {
    return this.storageManager;
  }

  public getAudioRepository(): SupabaseAudioRepository {
    return this.audioRepository;
  }

  public getPlaylistRepository(): SupabasePlaylistRepository {
    return this.playlistRepository;
  }

  public getRecordingRepository(): SupabaseRecordingRepository {
    return this.recordingRepository;
  }

  public getAudioService(): AudioService {
    return this.audioService;
  }

  public getPlaylistService(): PlaylistService {
    return this.playlistService;
  }

  public getRecordingService(): RecordingService {
    return this.recordingService;
  }

  public getStorageMigrationService(): StorageMigrationService {
    return this.storageMigrationService;
  }

  public getMigrationService(): MigrationService {
    return this.migrationService;
  }
}