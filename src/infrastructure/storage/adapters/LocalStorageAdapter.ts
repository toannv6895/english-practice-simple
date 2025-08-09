import { StorageStrategy, UploadParams, StorageResult, DownloadResult, StorageUsage, StorageProvider } from '../StorageStrategy';

export class LocalStorageAdapter implements StorageStrategy {
  async upload(params: UploadParams): Promise<StorageResult> {
    console.log('Uploading to local storage:', params.key);
    
    // Convert file to base64 for local storage
    const base64 = await this.fileToBase64(params.file);
    localStorage.setItem(`file:${params.key}`, base64);
    
    return {
      key: params.key,
      url: `local:${params.key}`,
      size: params.file.size,
    };
  }

  async download(key: string): Promise<DownloadResult> {
    console.log('Downloading from local storage:', key);
    
    const base64 = localStorage.getItem(`file:${key}`);
    if (!base64) {
      throw new Error('File not found in local storage');
    }
    
    const blob = this.base64ToBlob(base64);
    
    return {
      data: blob,
      metadata: {},
    };
  }

  async delete(key: string): Promise<void> {
    console.log('Deleting from local storage:', key);
    localStorage.removeItem(`file:${key}`);
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    return `local:${key}`;
  }

  async getUsage(userId: string): Promise<StorageUsage> {
    let totalSize = 0;
    let count = 0;
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('file:')) {
        const value = localStorage.getItem(key);
        if (value) {
          totalSize += value.length;
          count++;
        }
      }
    }
    
    return { size: totalSize, count };
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private base64ToBlob(base64: string): Blob {
    const parts = base64.split(';base64,');
    const contentType = parts[0].split(':')[1];
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);
    
    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }
    
    return new Blob([uInt8Array], { type: contentType });
  }
}