export interface StorageLocation {
  provider: string;
  key: string;
  url?: string;
}

export interface UploadParams {
  file: File;
  key: string;
  metadata?: Record<string, any>;
}

export interface StorageResult {
  key: string;
  url: string;
  size: number;
}

export interface DownloadResult {
  data: Blob;
  metadata?: Record<string, any>;
}

export interface StorageUsage {
  size: number;
  count: number;
}

export enum StorageProvider {
  LOCAL = 'local',
  S3 = 's3',
  SUPABASE = 'supabase'
}

export interface StorageStrategy {
  upload(params: UploadParams): Promise<StorageResult>;
  download(key: string): Promise<DownloadResult>;
  delete(key: string): Promise<void>;
  getSignedUrl(key: string, expiresIn?: number): Promise<string>;
  getUsage?(userId: string): Promise<StorageUsage>;
}