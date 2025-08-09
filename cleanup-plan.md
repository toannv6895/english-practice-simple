# Cleanup Plan - Code Thừa & Refactoring Strategy

## Tổng quan
Dựa trên phân tích dự án hiện tại, đã xác định được nhiều code thừa và duplicate. Kế hoạch này chi tiết cách loại bỏ code thừa và refactor theo architecture mới.

## 1. Files Cần Loại Bỏ

### 1.1 Storage Implementations Cũ
| File Path | Status | Lý Do | Hành Động |
|-----------|--------|--------|-----------|
| `src/utils/storage.ts` | ✅ **Đã Xóa** | Supabase storage cũ, đã có S3 | Đã xóa trong cleanup |
| `src/utils/s3Storage.ts` | ✅ **Đã Xóa** | Direct S3 implementation, không có abstraction | Đã thay thế bằng `S3StorageAdapter` |
| `src/services/s3Service.ts` | ✅ **Đã Xóa** | Business logic lẫn với S3 implementation | Đã thay thế bằng use cases và repositories |

### 1.2 Local Storage Implementations
| File Path | Status | Lý Do | Hành Động |
|-----------|--------|--------|-----------|
| `src/store/useRecordingStore.ts` | ⚠️ **Refactor** | Local storage logic cần tách biệt | Giữ store nhưng thay storage backend |
| `src/utils/dataMigration.ts` | ✅ **Đã Xóa** | Migration logic cũ | Đã thay bằng `StorageMigrationService` |

### 1.3 Duplicate Components
| File Path | Status | Lý Do | Hành Động |
|-----------|--------|--------|-----------|
| `src/components/EnhancedFileUpload.tsx` | ✅ **Đã Xóa** | Duplicate với `FileUpload.tsx` | Đã merge features vào `FileUpload.tsx` |
| `src/components/RecordingTest.tsx` | ✅ **Đã Xóa** | Test component không cần thiết | Đã xóa sau khi test xong |

## 2. Refactoring Steps

### Phase 1: Setup Infrastructure (Week 1)
```bash
# 1. Tạo folder structure mới
mkdir -p src/domain/entities
mkdir -p src/domain/repositories
mkdir -p src/application/use-cases
mkdir -p src/infrastructure/storage
mkdir -p src/infrastructure/repositories

# 2. Tạo interfaces và entities
touch src/domain/entities/AudioFile.ts
touch src/domain/entities/Recording.ts
touch src/domain/entities/Playlist.ts
touch src/domain/repositories/AudioRepository.ts
touch src/domain/repositories/RecordingRepository.ts
```

### Phase 2: Implement New Architecture (Week 2)
```typescript
// 1. Tạo Storage Strategies
// src/infrastructure/storage/S3StorageAdapter.ts
// src/infrastructure/storage/SupabaseStorageAdapter.ts
// src/infrastructure/storage/LocalStorageAdapter.ts

// 2. Tạo Repository Implementations
// src/infrastructure/repositories/SupabaseAudioRepository.ts
// src/infrastructure/repositories/SupabaseRecordingRepository.ts

// 3. Tạo Use Cases
// src/application/use-cases/UploadAudioUseCase.ts
// src/application/use-cases/DownloadAudioUseCase.ts
// src/application/use-cases/MigrateStorageUseCase.ts
```

### Phase 3: Migrate Components (Week 3)
```typescript
// 1. Update components để dùng use cases
// Before:
import { uploadAudioWithRecord } from '../services/s3Service';

// After:
import { UploadAudioUseCase } from '../application/use-cases/UploadAudioUseCase';

// 2. Update store để dùng repositories
// Before:
const useRecordingStore = create((set) => ({
  recordings: [],
  addRecording: (recording) => set((state) => ({
    recordings: [...state.recordings, recording]
  }))
}));

// After:
const useRecordingStore = create((set, get) => ({
  recordings: [],
  loadRecordings: async (userId) => {
    const recordings = await recordingRepo.findByUserId(userId);
    set({ recordings });
  }
}));
```

## 3. Code Thừa Chi Tiết

### 3.1 Storage Service Duplication
```typescript
// ❌ Code thừa trong src/utils/storage.ts
export const uploadAudioFile = async (file: File, userId: string, playlistId: string) => {
  // Direct Supabase storage - không có abstraction
  const { data, error } = await supabase.storage
    .from('audios')
    .upload(filePath, file);
  // ...
};

// ✅ Thay thế bằng:
export class UploadAudioUseCase {
  async execute(params: UploadAudioParams) {
    // Clean architecture với repository pattern
    const audio = await this.audioRepo.save(audioEntity);
    return audio;
  }
}
```

### 3.2 S3 Service Duplication
```typescript
// ❌ Code thừa trong src/services/s3Service.ts
export const uploadAudioWithRecord = async (params: UploadAudioParams) => {
  // Business logic lẫn với S3 implementation
  const uploadResult = await uploadToS3({ file, userId });
  // Database update lẫn với upload logic
  // ...
};

// ✅ Thay thế bằng:
export class S3StorageAdapter implements StorageStrategy {
  async upload(params: UploadParams): Promise<StorageResult> {
    // Pure S3 implementation
    return { key, url, size };
  }
}
```

## 4. Migration Script

### 4.1 Data Migration
```typescript
// src/scripts/migrate-to-new-architecture.ts
export class ArchitectureMigration {
  async migrate() {
    // 1. Backup current data
    await this.backupCurrentData();
    
    // 2. Migrate storage records
    await this.migrateStorageRecords();
    
    // 3. Update database schema
    await this.updateDatabaseSchema();
    
    // 4. Verify migration
    await this.verifyMigration();
  }
}
```

### 4.2 Database Schema Updates
```sql
-- 1. Tạo bảng mới với structure mới
CREATE TABLE audios_v2 (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  playlist_id UUID REFERENCES playlists(id),
  original_name TEXT NOT NULL,
  mime_type TEXT,
  file_size INTEGER,
  duration INTEGER,
  storage_provider TEXT NOT NULL,
  storage_key TEXT NOT NULL,
  storage_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Migrate data
INSERT INTO audios_v2 (id, user_id, playlist_id, original_name, ...)
SELECT id, user_id, playlist_id, original_filename, ...
FROM audios;

-- 3. Rename tables
ALTER TABLE audios RENAME TO audios_old;
ALTER TABLE audios_v2 RENAME TO audios;

-- 4. Drop old tables sau khi verify
DROP TABLE audios_old;
```

## 5. Testing Strategy

### 5.1 Unit Tests cho Architecture Mới
```typescript
// tests/unit/storage/S3StorageAdapter.test.ts
describe('S3StorageAdapter', () => {
  it('should upload file to S3', async () => {
    const adapter = new S3StorageAdapter(mockS3Client, 'test-bucket');
    const result = await adapter.upload(mockFile, 'test-key');
    
    expect(result.key).toBe('test-key');
    expect(result.url).toContain('test-bucket');
  });
});
```

### 5.2 Integration Tests
```typescript
// tests/integration/storage-migration.test.ts
describe('Storage Migration', () => {
  it('should migrate from local to S3', async () => {
    const migration = new StorageMigrationService();
    const result = await migration.migrateUserData('user-123', {
      from: StorageProvider.LOCAL,
      to: StorageProvider.S3
    });
    
    expect(result.failedFiles).toBe(0);
    expect(result.migratedFiles).toBe(result.totalFiles);
  });
});
```

## 6. Rollback Plan

### 6.1 Backup Strategy
```bash
# 1. Backup database
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d-%H%M%S).sql

# 2. Backup local storage
cp -r src/store/local-storage backup/local-storage-$(date +%Y%m%d-%H%M%S)

# 3. Backup S3 files
aws s3 sync s3://$BUCKET_NAME backup/s3-$(date +%Y%m%d-%H%M%S)
```

### 6.2 Rollback Process
```typescript
export class RollbackService {
  async rollbackToPreviousArchitecture() {
    // 1. Stop new services
    await this.stopNewServices();
    
    // 2. Restore database
    await this.restoreDatabase();
    
    // 3. Restore local storage
    await this.restoreLocalStorage();
    
    // 4. Verify rollback
    await this.verifyRollback();
  }
}
```

## 7. Timeline Implementation

| Tuần | Nhiệm vụ | Files tạo mới | Files xóa |
|------|----------|---------------|-----------|
| **Tuần 1** | Setup architecture | 15 files mới | 0 |
| **Tuần 2** | Implement adapters | 8 files mới | 0 |
| **Tuần 3** | Migrate components | 5 files mới | 3 files |
| **Tuần 4** | Testing & cleanup | 0 | 8 files |
| **Tuần 5** | Production deployment | 0 | 5 files |

## 8. Checklist Hoàn Thành

### Pre-migration
- [ ] Backup tất cả data
- [ ] Test migration script
- [ ] Setup monitoring
- [ ] Prepare rollback plan

### During migration
- [ ] Run migration in batches
- [ ] Monitor progress
- [ ] Handle errors
- [ ] Verify data integrity

### Post-migration
- [ ] Remove old files
- [ ] Update documentation
- [ ] Performance testing
- [ ] User acceptance testing

## 9. Files Cần Giữ Lại

### Core Components (Giữ nguyên)
- `src/components/AudioPlayer.tsx`
- `src/components/DictationMode.tsx`
- `src/components/ListeningMode.tsx`
- `src/components/ShadowingMode.tsx`

### Business Logic (Refactor)
- `src/store/useAppStore.ts` → Chỉ giữ UI state
- `src/store/usePlaylistStore.ts` → Chuyển sang repositories
- `src/store/useRecordingStore.ts` → Chuyển sang repositories

## 10. Commands Migration

### Old Commands
```bash
# Cũ
npm run test:s3-upload
npm run test:supabase
npm run migrate:local-to-cloud
```

### New Commands
```bash
# Mới
npm run test:storage
npm run test:migration
npm run storage:migrate
npm run storage:rollback
npm run storage:health-check
```

## Kết luận
Sau khi hoàn thành migration, dự án sẽ:
- Giảm 60% code duplicate
- Có architecture modular và dễ mở rộng
- Dễ thêm storage provider mới
- Có comprehensive testing
- Có rollback capability đầy đủ