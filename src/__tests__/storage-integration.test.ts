import { StorageManager } from '../infrastructure/storage/StorageManager';
import { LocalStorageAdapter } from '../infrastructure/storage/adapters/LocalStorageAdapter';
import { S3StorageAdapter } from '../infrastructure/storage/adapters/S3StorageAdapter';
import { SupabaseStorageAdapter } from '../infrastructure/storage/adapters/SupabaseStorageAdapter';
import { StorageProvider } from '../infrastructure/storage/StorageStrategy';

describe('Storage Integration Tests', () => {
  let storageManager: StorageManager;

  beforeEach(() => {
    storageManager = new StorageManager();
    storageManager.registerAdapter('local', new LocalStorageAdapter());
    storageManager.registerAdapter('s3', new S3StorageAdapter());
    storageManager.registerAdapter('supabase', new SupabaseStorageAdapter());
  });

  test('should register all storage adapters correctly', () => {
    expect(storageManager.getAdapter('local')).toBeInstanceOf(LocalStorageAdapter);
    expect(storageManager.getAdapter('s3')).toBeInstanceOf(S3StorageAdapter);
    expect(storageManager.getAdapter('supabase')).toBeInstanceOf(SupabaseStorageAdapter);
  });

  test('should handle file upload/download flow', async () => {
    const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
    
    // Test upload
    const result = await storageManager.uploadAudio(
      testFile,
      'test-user',
      'test-playlist',
      { type: 'audio' }
    );
    
    expect(result.provider).toBe('local');
    expect(result.key).toContain('test-user/test-playlist/');
    
    // Test download
    const downloadResult = await storageManager.download(result);
    expect(downloadResult).toBeInstanceOf(Blob);
  });

  test('should handle storage migration', async () => {
    const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
    
    // Upload to local storage
    const localResult = await storageManager.uploadAudio(
      testFile,
      'test-user',
      'test-playlist',
      { type: 'audio' }
    );
    
    // Migrate to S3
    const migratedResult = await storageManager.migrateStorage(
      localResult,
      's3' as StorageProvider
    );
    
    expect(migratedResult.provider).toBe('s3');
    expect(migratedResult.key).toBe(localResult.key);
  });
});