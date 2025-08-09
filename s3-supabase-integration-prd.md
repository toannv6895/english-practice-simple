# S3 & Supabase Integration PRD
## English Practice Application - Cloud Storage & Database Integration

**Document Version:** 1.0  
**Created:** 2025-08-08  
**Author:** Product Manager  
**Status:** Draft for Review  

---

## 1. Executive Summary

### Problem Statement
Ứng dụng hiện tại lưu trữ tất cả file audio, shadow recording và playlist images cục bộ trong browser storage, gây ra các vấn đề:
- Giới hạn dung lượng lưu trữ (5-10MB cho IndexedDB)
- Mất dữ liệu khi clear browser data
- Không thể truy cập cross-device
- Không có backup và recovery
- Performance kém với file lớn

### Solution Overview
Tích hợp AWS S3 cho lưu trữ file và Supabase cho metadata, cho phép:
- Lưu trữ không giới hạn trên cloud
- Truy cập cross-device với user authentication
- Backup và recovery tự động
- Performance tốt hơn với CDN
- Giữ nguyên UI/UX hiện tại, chỉ thay đổi phần connect data

---

## 2. Current State Analysis

### 2.1 Existing Architecture
- **Storage:** Browser IndexedDB/localStorage
- **Audio Files:** Raw audio data (WAV/MP3) ~1-5MB mỗi file
- **Shadow Recordings:** User recordings ~500KB-2MB mỗi file
- **Playlist Images:** Base64 encoded thumbnails ~50-200KB mỗi image
- **Metadata:** JSON objects trong browser storage

### 2.2 Data Structure hiện tại
```typescript
// Current Recording interface
interface Recording {
  id: string;
  audioData: ArrayBuffer;        // Raw audio - cần migrate sang S3
  transcript: string;
  shadowRecordings: Array<{
    id: string;
    audioData: ArrayBuffer;      // User recordings - cần migrate sang S3
    timestamp: number;
    accuracy: number;
  }>;
  playlistImage?: string;        // Base64 - cần migrate sang S3
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 3. Requirements

### 3.1 Functional Requirements

#### 3.1.1 File Storage (S3)
- **FR-001:** Upload audio files lên S3 bucket
- **FR-002:** Upload shadow recordings lên S3 bucket  
- **FR-003:** Upload playlist images lên S3 bucket
- **FR-004:** Download files từ S3 khi cần thiết
- **FR-005:** Xóa files khỏi S3 khi user xóa trong app
- **FR-006:** Generate pre-signed URLs cho secure access
- **FR-007:** Implement retry logic cho failed uploads

#### 3.1.2 Database Storage (Supabase)
- **FR-008:** Lưu metadata recordings vào Supabase
- **FR-009:** Lưu metadata playlists vào Supabase
- **FR-010:** Lưu user preferences vào Supabase
- **FR-011:** Query recordings theo user ID
- **FR-012:** Query playlists theo user ID
- **FR-013:** Real-time sync khi có thay đổi

#### 3.1.3 Migration
- **FR-014:** Migrate dữ liệu từ local storage sang cloud
- **FR-015:** Backup local data trước khi migration
- **FR-016:** Progress tracking cho migration process
- **FR-017:** Rollback capability nếu migration fail

### 3.2 Non-Functional Requirements

#### 3.2.1 Security
- **NFR-001:** Không upload sensitive data lên server training
- **NFR-002:** Sử dụng pre-signed URLs cho S3 access
- **NFR-003:** Row Level Security (RLS) trên Supabase
- **NFR-004:** Encrypt sensitive metadata fields
- **NFR-005:** Secure credential storage trong .env.local

#### 3.2.2 Performance
- **NFR-006:** Upload/download speed ≥ 1MB/s
- **NFR-007:** Lazy loading cho audio files
- **NFR-008:** Cache frequently accessed files
- **NFR-009:** CDN integration cho global access

#### 3.2.3 Reliability
- **NFR-010:** 99.9% uptime cho upload/download
- **NFR-011:** Automatic retry với exponential backoff
- **NFR-012:** Offline queue cho failed operations
- **NFR-013:** Data integrity validation

---

## 4. Technical Architecture

### 4.1 S3 Integration
```typescript
// S3 Configuration
const S3_CONFIG = {
  bucketName: process.env.REACT_APP_S3_BUCKET,
  region: process.env.REACT_APP_AWS_REGION,
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
  cloudFrontDomain: process.env.REACT_APP_CLOUDFRONT_DOMAIN
}

// File structure trong S3
s3://english-practice-bucket/
├── audio-files/
│   └── {user-id}/{recording-id}/audio.mp3
├── shadow-recordings/
│   └── {user-id}/{recording-id}/{shadow-id}.wav
└── playlist-images/
    └── {user-id}/{playlist-id}/thumbnail.jpg
```

### 4.2 Supabase Schema
```sql
-- Recordings table
CREATE TABLE recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  s3_audio_url TEXT NOT NULL,
  transcript TEXT,
  duration INTEGER, -- seconds
  file_size INTEGER, -- bytes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shadow recordings table
CREATE TABLE shadow_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recording_id UUID REFERENCES recordings(id),
  s3_audio_url TEXT NOT NULL,
  accuracy_score DECIMAL(3,2),
  duration INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Playlists table
CREATE TABLE playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  s3_image_url TEXT,
  recording_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE shadow_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
```

### 4.3 Service Layer
```typescript
// S3 Service
class S3Service {
  async uploadAudio(file: File, userId: string, recordingId: string): Promise<string>
  async uploadShadowRecording(file: File, userId: string, recordingId: string, shadowId: string): Promise<string>
  async uploadPlaylistImage(file: File, userId: string, playlistId: string): Promise<string>
  async deleteFile(url: string): Promise<void>
  async getSignedUrl(key: string): Promise<string>
}

// Supabase Service
class SupabaseService {
  async saveRecordingMetadata(recording: RecordingMetadata): Promise<void>
  async getUserRecordings(userId: string): Promise<Recording[]>
  async updateRecording(id: string, updates: Partial<Recording>): Promise<void>
  async deleteRecording(id: string): Promise<void>
}
```

---

## 5. UI/UX Changes (Minimal)

### 5.1 Current UI Preservation
- **Giữ nguyên:** Tất cả components hiện tại
- **Giữ nguyên:** Layout và styling
- **Giữ nguyên:** User flows

### 5.2 Minor UI Updates
- **Loading states:** Thêm spinner khi upload/download
- **Error handling:** Thêm error messages cho failed operations
- **Progress indicators:** Progress bar cho large file uploads
- **Offline indicators:** Badge khi offline và queue operations

### 5.3 New UI Elements (Optional)
- **Cloud sync status:** Small indicator showing sync status
- **Storage usage:** Progress bar showing cloud storage usage
- **Migration progress:** Modal hiển thị migration progress

---

## 6. Migration Strategy

### 6.1 Phase 1: Setup (Week 1)
- Setup S3 bucket và CloudFront
- Setup Supabase project và tables
- Configure environment variables
- Implement basic upload/download services

### 6.2 Phase 2: Dual-write (Week 2)
- Implement dual-write: vừa lưu local vừa upload cloud
- Background sync khi online
- User vẫn dùng local storage chính

### 6.3 Phase 3: Migration (Week 3)
- Detect existing local data
- Batch migrate tất cả local files lên S3
- Migrate metadata lên Supabase
- Progress tracking và error handling

### 6.4 Phase 4: Cloud-primary (Week 4)
- Switch sang cloud storage làm primary
- Lazy load files khi cần
- Cleanup local storage cũ

---

## 7. Security & Privacy

### 7.1 Data Classification
- **Public:** Playlist metadata, transcript text
- **Private:** Audio files, shadow recordings, user preferences
- **Sensitive:** Không có (đã loại trừ theo yêu cầu)

### 7.2 Security Measures
- **S3:** Pre-signed URLs với 1-hour expiration
- **Supabase:** RLS policies cho user isolation
- **Encryption:** TLS 1.3 cho tất cả connections
- **Access Control:** User chỉ access được data của mình

### 7.3 Privacy Compliance
- **Data Residency:** S3 bucket và Supabase region phù hợp
- **User Control:** User có thể delete tất cả data của mình
- **Data Portability:** Export functionality cho user data

---

## 8. Success Metrics

### 8.1 Technical KPIs
- **Upload Success Rate:** ≥ 99%
- **Download Success Rate:** ≥ 99%
- **Average Upload Time:** ≤ 5s cho file 1MB
- **Migration Success Rate:** ≥ 95%
- **Data Integrity:** 100% (no corruption)

### 8.2 User Experience KPIs
- **Migration Completion Rate:** ≥ 90% users complete migration
- **User Retention:** ≥ 95% sau migration
- **Support Tickets:** < 5% users report issues
- **Performance Impact:** No perceptible slowdown

---

## 9. Risk Assessment & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|---------|------------|
| **Migration failure** | Medium | High | Incremental migration, rollback plan |
| **S3 costs spike** | Low | Medium | Cost monitoring, lifecycle policies |
| **User data loss** | Low | Critical | Backup trước migration, verify integrity |
| **Performance degradation** | Medium | Medium | CDN, caching, lazy loading |
| **User resistance** | Medium | Medium | Gradual rollout, clear communication |

---

## 10. Budget & Resources

### 10.1 Infrastructure Costs (Monthly)
- **S3 Storage:** ~$0.023/GB (estimated $5-15/month)
- **CloudFront:** ~$0.085/GB (estimated $10-30/month)
- **Supabase:** Free tier covers 500MB database
- **Data Transfer:** ~$5-10/month

### 10.2 Development Resources
- **Frontend Developer:** 2-3 weeks
- **Backend/Cloud Setup:** 1 week
- **Testing:** 1 week
- **Total:** 4-5 weeks với 1 developer

---

## 11. Timeline & Milestones

| Week | Milestone | Deliverables |
|------|-----------|--------------|
| **Week 1** | Setup & Core Services | S3 setup, Supabase schema, basic services |
| **Week 2** | Dual-write Implementation | Upload/download logic, sync mechanism |
| **Week 3** | Migration System | Migration UI, batch processing, error handling |
| **Week 4** | Testing & Polish | Testing, bug fixes, performance optimization |
| **Week 5** | Launch | Production deployment, monitoring setup |

---

## 12. Testing Strategy

### 12.1 Unit Tests
- S3 upload/download functions
- Supabase CRUD operations
- Error handling và retry logic
- Data validation

### 12.2 Integration Tests
- End-to-end upload flow
- Migration process
- Cross-device sync
- Offline/online transitions

### 12.3 User Acceptance Testing
- Migration experience với 10 beta users
- Performance testing với large datasets
- Error recovery testing

---

## 13. Rollback Plan

### 13.1 Rollback Triggers
- Migration failure rate > 5%
- User complaints > 10%
- Performance degradation > 50%
- Data corruption detected

### 13.2 Rollback Process
1. Stop cloud sync
2. Restore local storage từ backup
3. Notify users về rollback
4. Investigate và fix issues
5. Retry migration sau khi fix

---

## 14. Future Enhancements

### 14.1 Phase 2 Features
- Real-time collaboration
- Social sharing
- Advanced analytics
- Mobile app sync

### 14.2 Phase 3 Features
- AI-powered recommendations
- Advanced search
- Content discovery
- Offline mode với sync

---

## 15. Appendices

### 15.1 Environment Variables
```bash
# Required in .env.local
REACT_APP_SUPABASE_URL=
REACT_APP_SUPABASE_ANON_KEY=
REACT_APP_S3_BUCKET=
REACT_APP_AWS_REGION=
REACT_APP_AWS_ACCESS_KEY_ID=
REACT_APP_AWS_SECRET_ACCESS_KEY=
REACT_APP_CLOUDFRONT_DOMAIN=
```

### 15.2 Useful Commands
```bash
# Test S3 upload
npm run test:s3-upload

# Test Supabase connection
npm run test:supabase

# Run migration
npm run migrate:local-to-cloud
```

### 15.3 Support Contacts
- **Technical Lead:** [Email]
- **DevOps:** [Email]
- **Product Manager:** [Email]

---

**Document Status:** Ready for Review  
**Next Steps:** Technical team review, timeline confirmation, resource allocation