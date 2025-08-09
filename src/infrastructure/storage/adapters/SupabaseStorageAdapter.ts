import { StorageStrategy, UploadParams, StorageResult, DownloadResult, StorageUsage, StorageProvider } from '../StorageStrategy';

export class SupabaseStorageAdapter implements StorageStrategy {
  async upload(params: UploadParams): Promise<StorageResult> {
    console.log('Uploading to Supabase:', params.key);
    return {
      key: params.key,
      url: `https://supabase.example.com/storage/${params.key}`,
      size: params.file.size,
    };
  }

  async download(key: string): Promise<DownloadResult> {
    console.log('Downloading from Supabase:', key);
    return {
      data: new Blob(['mock supabase data'], { type: 'text/plain' }),
      metadata: {},
    };
  }

  async delete(key: string): Promise<void> {
    console.log('Deleting from Supabase:', key);
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    return `https://supabase.example.com/storage/${key}?expires=${expiresIn}`;
  }

  async getUsage(userId: string): Promise<StorageUsage> {
    return { size: 0, count: 0 };
  }
}