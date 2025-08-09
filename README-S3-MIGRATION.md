# S3 Migration Guide

## Overview
This guide provides step-by-step instructions for migrating your English Practice app to use AWS S3 for file storage and Supabase for metadata storage.

## Prerequisites
1. AWS Account with S3 bucket configured
2. AWS Access Key ID and Secret Access Key
3. Updated `.env.local` file with S3 credentials

## Environment Variables Required

Add these to your `.env.local` file:

```bash
# AWS S3 Configuration
REACT_APP_AWS_ACCESS_KEY_ID=your-access-key-id
REACT_APP_AWS_SECRET_ACCESS_KEY=your-secret-access-key
REACT_APP_AWS_REGION=us-east-1
REACT_APP_S3_BUCKET_NAME=your-bucket-name

# Supabase Configuration
REACT_APP_SUPABASE_URL=your-supabase-url
REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Migration Steps

### 1. Database Schema Update
Run the SQL migration script to add S3 columns:

```bash
# Run the migration script
psql -h your-supabase-host -U your-user -d your-database -f scripts/s3-migration.sql
```

Or use Supabase SQL editor to run:
```sql
-- Add S3 columns to audios table
ALTER TABLE audios 
ADD COLUMN IF NOT EXISTS s3_audio_url TEXT,
ADD COLUMN IF NOT EXISTS s3_audio_key TEXT,
ADD COLUMN IF NOT EXISTS s3_image_url TEXT,
ADD COLUMN IF NOT EXISTS s3_image_key TEXT;
```

### 2. Test S3 Connection
Test your S3 configuration:

```bash
# Install dependencies
npm install @aws-sdk/client-s3

# Run S3 connection test
node scripts/test-s3-upload.js
```

### 3. Migrate Existing Data (Optional)
If you have existing audio files that need to be migrated to S3:

```bash
# Run the migration script
node scripts/migrate-existing-data.js
```

### 4. Start the Application
```bash
# Install all dependencies
npm install

# Start the development server
npm start
```

## File Structure Changes

### New Files Added:
- `src/services/s3Service.ts` - S3 upload service
- `src/utils/s3Storage.ts` - S3 storage utilities
- `scripts/s3-migration.sql` - Database migration script
- `scripts/test-s3-upload.js` - S3 connection test
- `scripts/migrate-existing-data.js` - Data migration script

### Updated Files:
- `src/pages/UploadAudioPage.tsx` - Updated to use S3 upload
- `src/services/recordingService.ts` - Updated to handle S3 URLs
- `src/types/recording.ts` - Added S3 fields to types

## Usage

### Uploading New Audio Files
1. Navigate to `/upload`
2. Select audio file (MP3, WAV, M4A, AAC, OGG, up to 10MB)
3. Optionally select cover image
4. Fill in metadata (title, description, etc.)
5. Click "Upload Audio" - files will be stored in S3, metadata in Supabase

### File Storage Structure
- **Audio files**: `s3://your-bucket/audios/{user_id}/{audio_id}/audio.mp3`
- **Cover images**: `s3://your-bucket/audios/{user_id}/{audio_id}/cover.jpg`

## Troubleshooting

### Common Issues

1. **S3 Upload Fails**
   - Check AWS credentials in `.env.local`
   - Verify bucket name and region
   - Ensure bucket has proper CORS configuration

2. **Database Connection Issues**
   - Verify Supabase URL and anon key
   - Check network connectivity
   - Ensure database has proper RLS policies

3. **File Size Limits**
   - Default limit is 10MB per file
   - Can be adjusted in `src/pages/UploadAudioPage.tsx`

### CORS Configuration for S3
Add this CORS configuration to your S3 bucket:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
        "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
        "ExposeHeaders": []
    }
]
```

## Security Considerations

1. **Environment Variables**: Never commit AWS credentials to version control
2. **S3 Bucket Policy**: Ensure bucket has proper access controls
3. **Supabase RLS**: Enable Row Level Security for user data isolation
4. **File Validation**: All files are validated for type and size before upload

## Testing

### Manual Testing Checklist
- [ ] Upload audio file successfully
- [ ] Upload cover image successfully
- [ ] Verify files appear in S3 bucket
- [ ] Verify metadata stored in Supabase
- [ ] Test audio playback from S3 URL
- [ ] Test image display from S3 URL
- [ ] Test user isolation (users can only access their own files)

### Automated Testing
```bash
# Run S3 upload test
node scripts/test-s3-upload.js

# Run database connection test
node scripts/test-connection.js
```

## Rollback Plan
If migration fails, you can:
1. Revert to previous commit
2. Remove S3 columns from database
3. Update app to use previous file storage method