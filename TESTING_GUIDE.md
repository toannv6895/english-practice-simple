# Recording Metadata Testing Guide

## Overview
This guide provides step-by-step instructions for testing the new recording metadata features in the English Practice App.

## Prerequisites
1. Ensure Supabase is properly configured with the new recording metadata tables
2. Run the database migration scripts
3. User must be authenticated

## Database Setup

### 1. Run Migration Scripts
```bash
# Run the recording metadata setup script
psql -h your-supabase-host -U your-user -d your-database -f scripts/setup-recording-metadata.sql
```

### 2. Verify Tables
Check that the following tables are created:
- `recording_sessions`
- `dictation_attempts`
- `shadowing_recordings`
- `listening_sessions`

## Testing Components

### 1. RecordingTest Component
A comprehensive test component is available at `src/components/RecordingTest.tsx`.

To use it:
1. Import and add to your app:
```tsx
import { RecordingTest } from './components/RecordingTest';

// Add to your routing or main component
<RecordingTest />
```

### 2. RecordingIntegration Component
Automatic recording integration is available at `src/components/RecordingIntegration.tsx`.

To enable:
1. Import and add to your app:
```tsx
import { RecordingIntegration } from './components/RecordingIntegration';

// Add to your main app component
<RecordingIntegration />
```

## Manual Testing Steps

### 1. Test Recording Sessions
```typescript
import { useRecordingStore } from './store/useRecordingStore';

const { startSession, endSession } = useRecordingStore();

// Start a session
await startSession('audio-id-123', 'dictation', { test: true });

// End the session
await endSession(300); // 300 seconds duration
```

### 2. Test Dictation Attempts
```typescript
const { addDictationAttempt } = useRecordingStore();

await addDictationAttempt({
  audio_id: 'audio-id-123',
  sentence_index: 0,
  original_text: 'Hello world',
  user_input: 'Hello world',
  is_correct: true,
  accuracy_score: 100,
  time_taken: 5000
});
```

### 3. Test Shadowing Recordings
```typescript
const { addShadowingRecording } = useRecordingStore();

await addShadowingRecording({
  audio_id: 'audio-id-123',
  sentence_index: 0,
  original_text: 'Hello world',
  audio_url: 'https://example.com/recording.mp3',
  audio_duration: 3000,
  pronunciation_score: 85,
  fluency_score: 90,
  completeness_score: 95,
  overall_score: 90,
  feedback: { pronunciation: 'Good', fluency: 'Excellent' }
});
```

### 4. Test Listening Sessions
```typescript
const { addListeningSession } = useRecordingStore();

await addListeningSession({
  audio_id: 'audio-id-123',
  sentence_index: 0,
  original_text: 'Hello world',
  time_listened: 5000,
  repetitions: 3
});
```

### 5. Test Statistics
```typescript
const { loadUserStats, userStats } = useRecordingStore();

await loadUserStats();
console.log('User Stats:', userStats);
```

## Integration Testing

### 1. Dictation Mode Integration
```typescript
// In DictationMode component
const recordAttempt = async (sentenceIndex: number, userInput: string, isCorrect: boolean) => {
  const originalText = subtitles[sentenceIndex]?.text || '';
  const accuracy = calculateAccuracy(originalText, userInput);
  
  await window.recordingAPI?.recordDictationAttempt(
    sentenceIndex,
    originalText,
    userInput,
    isCorrect,
    accuracy,
    Date.now() - startTime
  );
};
```

### 2. Shadowing Mode Integration
```typescript
// In ShadowingMode component
const recordShadowing = async (sentenceIndex: number, audioBlob: Blob, scores: any) => {
  const originalText = subtitles[sentenceIndex]?.text || '';
  const audioUrl = URL.createObjectURL(audioBlob);
  
  await window.recordingAPI?.recordShadowingRecording(
    sentenceIndex,
    originalText,
    audioUrl,
    audioBlob.size,
    scores
  );
};
```

### 3. Listening Mode Integration
```typescript
// In ListeningMode component
const recordListening = async (sentenceIndex: number, timeListened: number, repetitions: number) => {
  const originalText = subtitles[sentenceIndex]?.text || '';
  
  await window.recordingAPI?.recordListeningSession(
    sentenceIndex,
    originalText,
    timeListened,
    repetitions
  );
};
```

## Database Verification

### 1. Check Recording Sessions
```sql
SELECT * FROM recording_sessions WHERE user_id = 'your-user-id';
```

### 2. Check Dictation Attempts
```sql
SELECT * FROM dictation_attempts WHERE user_id = 'your-user-id';
```

### 3. Check Shadowing Recordings
```sql
SELECT * FROM shadowing_recordings WHERE user_id = 'your-user-id';
```

### 4. Check Listening Sessions
```sql
SELECT * FROM listening_sessions WHERE user_id = 'your-user-id';
```

### 5. Check User Statistics
```sql
SELECT * FROM get_user_practice_stats('your-user-id');
```

## Troubleshooting

### Common Issues

1. **Authentication Error**
   - Ensure user is logged in
   - Check auth token validity

2. **Database Connection Error**
   - Verify Supabase URL and anon key
   - Check network connectivity

3. **Permission Denied**
   - Ensure RLS policies are properly configured
   - Check user has correct permissions

4. **Data Not Saving**
   - Verify all required fields are provided
   - Check for validation errors in console

### Debug Mode
Enable debug logging by adding to your environment:
```bash
REACT_APP_DEBUG_RECORDING=true
```

## Performance Testing

### 1. Load Testing
```typescript
// Test with large datasets
const testBulkOperations = async () => {
  const attempts = Array.from({ length: 100 }, (_, i) => ({
    audio_id: 'test-audio',
    sentence_index: i,
    original_text: `Test sentence ${i}`,
    user_input: `Test sentence ${i}`,
    is_correct: true,
    accuracy_score: 100,
    time_taken: 1000
  }));

  await RecordingService.createDictationAttempts(attempts);
};
```

### 2. Query Performance
```typescript
// Test query performance
const testQueryPerformance = async () => {
  console.time('loadUserSessions');
  const sessions = await RecordingService.getUserSessions(100);
  console.timeEnd('loadUserSessions');
  console.log(`Loaded ${sessions.length} sessions`);
};
```

## Cleanup
After testing, you can clean up test data:
```sql
-- Delete test sessions (be careful in production!)
DELETE FROM recording_sessions 
WHERE user_id = 'your-user-id' 
  AND metadata->>'test' = 'true';
```

## Next Steps
1. Integrate recording features into actual practice modes
2. Add progress tracking UI
3. Implement analytics dashboard
4. Add export functionality for user data