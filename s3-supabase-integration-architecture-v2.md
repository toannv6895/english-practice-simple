# S3 & Supabase Integration Architecture v2.0
## English Practice Application - Modular Cloud Storage Architecture

**Document Version:** 2.0  
**Created:** 2025-08-08  
**Author:** Product Manager  
**Status:** Final Architecture Design  

---

## 1. Executive Summary

### Problem với Architecture hiện tại
- **Code duplication:** Có 3 cách tiếp cận storage khác nhau (Supabase Storage, S3 trực tiếp, Local storage)
- **Không có abstraction layer:** Business logic phụ thuộc trực tiếp vào implementation
- **Khó mở rộng:** Thêm storage provider mới cần sửa nhiều file
- **Không có caching strategy:** Performance không tối ưu
- **Error handling không nhất quán:** Mỗi service xử lý lỗi khác nhau

### Solution Architecture mới
- **Clean Architecture** với clear separation of concerns
- **Strategy pattern** cho multiple storage providers
- **Repository pattern** cho data access
- **Event-driven** cho real-time sync
- **Caching layer** cho performance optimization

---

## 2. Clean Architecture Overview

### 2.1 Layer Structure
```
┌─────────────────────────────────────────┐
│              UI Layer                   │
│  Components, Hooks, Pages              │
├─────────────────────────────────────────┤
│           Application Layer             │
│   Use Cases, Services, Controllers     │
├─────────────────────────────────────────┤
│         Domain/Business Layer           │
│    Entities, Repositories, Events      │
├─────────────────────────────────────────┤
│         Infrastructure Layer            │
│  S3, Supabase, Local Storage Adapters  │
└─────────────────────────────────────────┘
```

### 2.2 Core Principles
- **Dependency Inversion:** Business logic không phụ thuộc vào infrastructure
- **Single Responsibility:** Mỗi class/component có một nhiệm vụ rõ ràng
- **Open/Closed Principle:** Mở rộng được mà không cần sửa code hiện có
- **Interface Segregation:** Interfaces nhỏ và cụ thể

---

## 3. Domain Layer (Core Business Logic)

### 3.1 Entities
```typescript
// Core entities - không phụ thuộc vào storage implementation
export interface AudioFile {
  id: string;
  userId: string;
  playlistId: string;
  originalName: string;
  mimeType: string;
  size: number;
  duration?: number;
  storageLocation: StorageLocation;
  metadata: AudioMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export interface Recording {
  id: string;
  userId: string;
  audioId: string;
  type: RecordingType;
  storageLocation: StorageLocation;
  metadata: RecordingMetadata;
  createdAt: Date;
}

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

export interface StorageLocation {
  provider: StorageProvider;
  key: string;
  url?: string;
  expiresAt?: Date;
}

export enum StorageProvider {
  S3 = 's3',
  SUPABASE = 'supabase',
  LOCAL = 'local'
}

export enum RecordingType {
  SHADOWING = 'shadowing',
  DICTATION = 'dictation',
  LISTENING = 'listening'
}
```

### 3.2 Repository Interfaces
```typescript
// Repository interfaces - contracts cho infrastructure layer
export interface AudioRepository {
  save(audio: AudioFile): Promise<AudioFile>;
  findById(id: string): Promise<AudioFile | null>;
  findByUserId(userId: string): Promise<AudioFile[]>;
  findByPlaylistId(playlistId: string): Promise<AudioFile[]>;
  delete(id: string): Promise<void>;
  update(id: string, updates: Partial<AudioFile>): Promise<AudioFile>;
}

export interface RecordingRepository {
  save(recording: Recording): Promise<Recording>;
  findById(id: string): Promise<Recording | null>;
  findByUserId(userId: string): Promise<Recording[]>;
  findByAudioId(audioId: string): Promise<Recording[]>;
  findByType(type: RecordingType): Promise<Recording[]>;
  delete(id: string): Promise<void>;
}

export interface PlaylistRepository {
  save(playlist: Playlist): Promise<Playlist>;
  findById(id: string): Promise<Playlist | null>;
  findByUserId(userId: string): Promise<Playlist[]>;
  delete(id: string): Promise<void>;
  addAudio(playlistId: string, audioId: string): Promise<void>;
  removeAudio(playlistId: string, audioId: string): Promise<void>;
}
```

### 3.3 Storage Strategy Interface
```typescript
export interface StorageStrategy {
  upload(params: UploadParams): Promise<StorageResult>;
  download(key: string): Promise<Blob>;
  delete(key: string): Promise<void>;
  getSignedUrl(key: string, expiresIn?: number): Promise<string>;
  exists(key: string): Promise<boolean>;
}

export interface UploadParams {
  file: File;
  key: string;
  metadata?: Record<string, string>;
  options?: UploadOptions;
}

export interface StorageResult {
  key: string;
  url: string;
  size: number;
  metadata?: Record<string, string>;
}

export interface UploadOptions {
  cacheControl?: string;
  contentType?: string;
  public?: boolean;
}
```

---

## 4. Application Layer (Use Cases)

### 4.1 Use Case Classes
```typescript
export class UploadAudioUseCase {
  constructor(
    private audioRepo: AudioRepository,
    private storageStrategy: StorageStrategy,
    private eventBus: EventBus
  ) {}

  async execute(params: UploadAudioParams): Promise<AudioFile> {
    // 1. Validate file
    this.validateFile(params.file);
    
    // 2. Generate unique key
    const key = this.generateKey(params);
    
    // 3. Upload to storage
    const storageResult = await this.storageStrategy.upload({
      file: params.file,
      key,
      metadata: {
        userId: params.userId,
        playlistId: params.playlistId,
        originalName: params.file.name
      }
    });
    
    // 4. Create audio entity
    const audio = AudioFile.create({
      userId: params.userId,
      playlistId: params.playlistId,
      originalName: params.file.name,
      mimeType: params.file.type,
      size: params.file.size,
      storageLocation: {
        provider: this.storageStrategy.provider,
        key: storageResult.key,
        url: storageResult.url
      }
    });
    
    // 5. Save to repository
    const savedAudio = await this.audioRepo.save(audio);
    
    // 6. Emit event
    this.eventBus.emit('audio.uploaded', { audio: savedAudio });
    
    return savedAudio;
  }
}

export class MigrateStorageUseCase {
  constructor(
    private sourceStrategy: StorageStrategy,
    private targetStrategy: StorageStrategy,
    private audioRepo: AudioRepository,
    private recordingRepo: RecordingRepository,
    private playlistRepo: PlaylistRepository
  ) {}

  async execute(userId: string): Promise<MigrationResult> {
    // Batch migration với progress tracking
    const audios = await this.audioRepo.findByUserId(userId);
    const recordings = await this.recordingRepo.findByUserId(userId);
    
    const result: MigrationResult = {
      totalFiles: audios.length + recordings.length,
      migratedFiles: 0,
      failedFiles: 0,
      errors: []
    };
    
    // Migrate in batches
    const batchSize = 5;
    for (let i = 0; i < audios.length; i += batchSize) {
      const batch = audios.slice(i, i + batchSize);
      await this.migrateBatch(batch, result);
    }
    
    return result;
  }
}
```

### 4.2 Service Layer
```typescript
export class StorageService {
  constructor(
    private strategies: Map<StorageProvider, StorageStrategy>,
    private cache: CacheService,
    private config: StorageConfig
  ) {}

  async upload(
    provider: StorageProvider,
    params: UploadParams
  ): Promise<StorageResult> {
    const strategy = this.strategies.get(provider);
    if (!strategy) {
      throw new Error(`Storage provider ${provider} not found`);
    }
    
    // Check cache trước
    const cacheKey = this.generateCacheKey(params.key);
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }
    
    // Upload và cache kết quả
    const result = await strategy.upload(params);
    await this.cache.set(cacheKey, result, this.config.cacheTTL);
    
    return result;
  }

  async getOptimalProvider(file: File): Promise<StorageProvider> {
    // Logic chọn provider dựa trên file type, size, user preference
    if (file.size > 10 * 1024 * 1024) { // > 10MB
      return StorageProvider.S3;
    }
    return this.config.defaultProvider;
  }
}
```

---

## 5. Infrastructure Layer (Storage Adapters)

### 5.1 S3 Storage Adapter
```typescript
export class S3StorageAdapter implements StorageStrategy {
  readonly provider = StorageProvider.S3;
  
  constructor(
    private s3Client: AWS.S3,
    private bucketName: string,
    private cloudFrontDomain?: string
  ) {}

  async upload(params: UploadParams): Promise<StorageResult> {
    const uploadParams = {
      Bucket: this.bucketName,
      Key: params.key,
      Body: params.file,
      ContentType: params.options?.contentType || params.file.type,
      ACL: params.options?.public ? 'public-read' : 'private',
      Metadata: params.metadata,
      CacheControl: params.options?.cacheControl || '3600'
    };

    const result = await this.s3Client.upload(uploadParams).promise();
    
    return {
      key: params.key,
      url: this.cloudFrontDomain 
        ? `https://${this.cloudFrontDomain}/${params.key}`
        : result.Location!,
      size: params.file.size,
      metadata: params.metadata
    };
  }

  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    const params = {
      Bucket: this.bucketName,
      Key: key,
      Expires: expiresIn
    };
    
    return this.s3Client.getSignedUrlPromise('getObject', params);
  }
}
```

### 5.2 Supabase Storage Adapter
```typescript
export class SupabaseStorageAdapter implements StorageStrategy {
  readonly provider = StorageProvider.SUPABASE;
  
  constructor(private supabaseClient: SupabaseClient) {}

  async upload(params: UploadParams): Promise<StorageResult> {
    const { data, error } = await this.supabaseClient.storage
      .from('files')
      .upload(params.key, params.file, {
        cacheControl: params.options?.cacheControl || '3600',
        upsert: false
      });

    if (error) throw error;

    const { data: { publicUrl } } = this.supabaseClient.storage
      .from('files')
      .getPublicUrl(params.key);

    return {
      key: params.key,
      url: publicUrl,
      size: params.file.size,
      metadata: params.metadata
    };
  }
}
```

### 5.3 Local Storage Adapter (Fallback)
```typescript
export class LocalStorageAdapter implements StorageStrategy {
  readonly provider = StorageProvider.LOCAL;
  
  async upload(params: UploadParams): Promise<StorageResult> {
    // Store in IndexedDB với metadata
    const fileData = await params.file.arrayBuffer();
    
    await this.db.files.put({
      key: params.key,
      data: fileData,
      metadata: params.metadata,
      createdAt: new Date()
    });
    
    // Tạo object URL cho local access
    const blob = new Blob([fileData], { type: params.file.type });
    const url = URL.createObjectURL(blob);
    
    return {
      key: params.key,
      url,
      size: params.file.size,
      metadata: params.metadata
    };
  }
}
```

---

## 6. Repository Implementations

### 6.1 Supabase Repository
```typescript
export class SupabaseAudioRepository implements AudioRepository {
  constructor(private supabase: SupabaseClient) {}

  async save(audio: AudioFile): Promise<AudioFile> {
    const { data, error } = await this.supabase
      .from('audios')
      .insert({
        id: audio.id,
        user_id: audio.userId,
        playlist_id: audio.playlistId,
        original_name: audio.originalName,
        mime_type: audio.mimeType,
        file_size: audio.size,
        duration: audio.duration,
        storage_provider: audio.storageLocation.provider,
        storage_key: audio.storageLocation.key,
        storage_url: audio.storageLocation.url,
        metadata: audio.metadata,
        created_at: audio.createdAt,
        updated_at: audio.updatedAt
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapToEntity(data);
  }

  async findByUserId(userId: string): Promise<AudioFile[]> {
    const { data, error } = await this.supabase
      .from('audios')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(this.mapToEntity);
  }

  private mapToEntity(data: any): AudioFile {
    return {
      id: data.id,
      userId: data.user_id,
      playlistId: data.playlist_id,
      originalName: data.original_name,
      mimeType: data.mime_type,
      size: data.file_size,
      duration: data.duration,
      storageLocation: {
        provider: data.storage_provider,
        key: data.storage_key,
        url: data.storage_url
      },
      metadata: data.metadata || {},
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }
}
```

---

## 7. Event System & Real-time Sync

### 7.1 Event Definitions
```typescript
export interface DomainEvents {
  'audio.uploaded': { audio: AudioFile };
  'audio.deleted': { audioId: string; userId: string };
  'recording.created': { recording: Recording };
  'playlist.updated': { playlist: Playlist };
  'storage.migrated': { userId: string; result: MigrationResult };
}

export class EventBus {
  private listeners = new Map<string, Function[]>();

  on<T extends keyof DomainEvents>(
    event: T,
    handler: (data: DomainEvents[T]) => void
  ): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(handler);
  }

  emit<T extends keyof DomainEvents>(
    event: T,
    data: DomainEvents[T]
  ): void {
    const handlers = this.listeners.get(event) || [];
    handlers.forEach(handler => handler(data));
  }
}
```

### 7.2 Real-time Sync với Supabase
```typescript
export class RealtimeSyncService {
  constructor(
    private supabase: SupabaseClient,
    private eventBus: EventBus
  ) {}

  subscribeToChanges(userId: string) {
    this.supabase
      .channel(`user-${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'audios',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        this.handleAudioChange(payload);
      })
      .subscribe();
  }

  private handleAudioChange(payload: any) {
    switch (payload.eventType) {
      case 'INSERT':
        this.eventBus.emit('audio.uploaded', { 
          audio: this.mapToEntity(payload.new) 
        });
        break;
      case 'DELETE':
        this.eventBus.emit('audio.deleted', {
          audioId: payload.old.id,
          userId: payload.old.user_id
        });
        break;
    }
  }
}
```

---

## 8. Migration Strategy (Improved)

### 8.1 Migration Architecture
```typescript
export class StorageMigrationService {
  constructor(
    private migrationRepo: MigrationRepository,
    private storageService: StorageService,
    private eventBus: EventBus
  ) {}

  async migrateUserData(
    userId: string,
    options: MigrationOptions
  ): Promise<MigrationResult> {
    const migration = await this.migrationRepo.create({
      userId,
      sourceProvider: options.from,
      targetProvider: options.to,
      status: 'pending'
    });

    try {
      // Phase 1: Discovery
      const filesToMigrate = await this.discoverFiles(userId);
      
      // Phase 2: Validation
      const validatedFiles = await this.validateFiles(filesToMigrate);
      
      // Phase 3: Migration
      const result = await this.migrateInBatches(validatedFiles, {
        batchSize: options.batchSize || 5,
        onProgress: (progress) => {
          this.eventBus.emit('migration.progress', { 
            migrationId: migration.id, 
            progress 
          });
        }
      });
      
      // Phase 4: Verification
      await this.verifyMigration(result);
      
      await this.migrationRepo.update(migration.id, {
        status: 'completed',
        result
      });
      
      return result;
      
    } catch (error) {
      await this.migrationRepo.update(migration.id, {
        status: 'failed',
        error: error.message
      });
      throw error;
    }
  }
}
```

### 8.2 Rollback Strategy
```typescript
export class MigrationRollbackService {
  async rollback(migrationId: string): Promise<void> {
    const migration = await this.migrationRepo.findById(migrationId);
    
    // 1. Stop ongoing operations
    await this.cancelOngoingOperations(migrationId);
    
    // 2. Restore from backup
    await this.restoreFromBackup(migration);
    
    // 3. Clean up partial uploads
    await this.cleanupPartialUploads(migration);
    
    // 4. Update migration status
    await this.migrationRepo.update(migrationId, {
      status: 'rolled_back',
      rolledBackAt: new Date()
    });
  }
}
```

---

## 9. Configuration & Environment

### 9.1 Configuration Schema
```typescript
export interface StorageConfig {
  defaultProvider: StorageProvider;
  providers: {
    [StorageProvider.S3]: S3Config;
    [StorageProvider.SUPABASE]: SupabaseConfig;
    [StorageProvider.LOCAL]: LocalConfig;
  };
  cache: {
    enabled: boolean;
    ttl: number;
    maxSize: number;
  };
  migration: {
    batchSize: number;
    retryAttempts: number;
    rollbackOnFailure: boolean;
  };
}

export const defaultConfig: StorageConfig = {
  defaultProvider: StorageProvider.S3,
  providers: {
    [StorageProvider.S3]: {
      bucketName: process.env.REACT_APP_S3_BUCKET!,
      region: process.env.REACT_APP_AWS_REGION!,
      accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY!,
      cloudFrontDomain: process.env.REACT_APP_CLOUDFRONT_DOMAIN
    },
    [StorageProvider.SUPABASE]: {
      url: process.env.REACT_APP_SUPABASE_URL!,
      anonKey: process.env.REACT_APP_SUPABASE_ANON_KEY!
    },
    [StorageProvider.LOCAL]: {
      maxSize: 50 * 1024 * 1024, // 50MB
      cleanupOnExit: true
    }
  },
  cache: {
    enabled: true,
    ttl: 3600, // 1 hour
    maxSize: 100 * 1024 * 1024 // 100MB
  },
  migration: {
    batchSize: 5,
    retryAttempts: 3,
    rollbackOnFailure: true
  }
};
```

---

## 10. Testing Strategy

### 10.1 Unit Tests
```typescript
describe('StorageService', () => {
  it('should upload file using correct strategy', async () => {
    const mockStrategy = createMockStorageStrategy();
    const service = new StorageService(
      new Map([[StorageProvider.S3, mockStrategy]]),
      new MockCacheService(),
      defaultConfig
    );
    
    const file = new File(['test'], 'test.mp3', { type: 'audio/mp3' });
    const result = await service.upload(StorageProvider.S3, {
      file,
      key: 'test-key'
    });
    
    expect(mockStrategy.upload).toHaveBeenCalled();
    expect(result.key).toBe('test-key');
  });
});
```

### 10.2 Integration Tests
```typescript
describe('Storage Migration', () => {
  it('should migrate user data successfully', async () => {
    const migrationService = createMigrationService();
    
    const result = await migrationService.migrateUserData('user-123', {
      from: StorageProvider.LOCAL,
      to: StorageProvider.S3
    });
    
    expect(result.totalFiles).toBeGreaterThan(0);
    expect(result.failedFiles).toBe(0);
    expect(result.migratedFiles).toBe(result.totalFiles);
  });
});
```

---

## 11. Performance Optimization

### 11.1 Caching Strategy
- **Browser Cache:** Cache frequently accessed files
- **CDN Cache:** CloudFront/S3 edge caching
- **Application Cache:** In-memory cache với TTL
- **Database Cache:** Supabase query result caching

### 11.2 Lazy Loading
```typescript
export class LazyLoadingService {
  async loadAudioWithProgress(
    audioId: string,
    onProgress: (progress: number) => void
  ): Promise<AudioFile> {
    const audio = await this.audioRepo.findById(audioId);
    
    if (!audio) throw new Error('Audio not found');
    
    // Download with progress tracking
    const response = await fetch(audio.storageLocation.url!, {
      method: 'GET'
    });
    
    const reader = response.body!.getReader();
    const contentLength = +response.headers.get('Content-Length')!;
    
    let receivedLength = 0;
    const chunks = [];
    
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      chunks.push(value);
      receivedLength += value.length;
      
      onProgress(receivedLength / contentLength);
    }
    
    // Combine chunks và cache
    const blob = new Blob(chunks);
    await this.cache.set(`audio-${audioId}`, blob);
    
    return audio;
  }
}
```

---

## 12. Monitoring & Observability

### 12.1 Metrics Collection
```typescript
export class StorageMetrics {
  static trackUpload(provider: StorageProvider, size: number, duration: number) {
    analytics.track('storage_upload', {
      provider,
      size,
      duration,
      speed: size / duration
    });
  }
  
  static trackMigration(userId: string, result: MigrationResult) {
    analytics.track('storage_migration', {
      userId,
      ...result
    });
  }
}
```

### 12.2 Health Checks
```typescript
export class StorageHealthCheck {
  async checkAllProviders(): Promise<HealthStatus> {
    const checks = await Promise.allSettled([
      this.checkS3(),
      this.checkSupabase(),
      this.checkLocalStorage()
    ]);
    
    return {
      overall: checks.every(c => c.status === 'fulfilled'),
      details: checks.map((c, i) => ({
        provider: Object.values(StorageProvider)[i],
        status: c.status === 'fulfilled' ? 'healthy' : 'unhealthy',
        error: c.status === 'rejected' ? c.reason : undefined
      }))
    };
  }
}
```

---

## 13. Deployment & Rollout

### 13.1 Feature Flags
```typescript
export const