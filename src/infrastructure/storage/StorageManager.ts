import { StorageStrategy, StorageLocation, StorageProvider } from './StorageStrategy';

export class StorageManager {
  private adapters = new Map<string, StorageStrategy>();

  registerAdapter(name: string, adapter: StorageStrategy): void {
    this.adapters.set(name, adapter);
  }

  getAdapter(provider: string): StorageStrategy {
    const adapter = this.adapters.get(provider);
    if (!adapter) {
      throw new Error(`Storage adapter '${provider}' not found`);
    }
    return adapter;
  }

  async uploadAudio(
    file: File,
    userId: string,
    playlistId: string,
    metadata?: any
  ): Promise<StorageLocation> {
    const key = `${userId}/${playlistId}/${Date.now()}-${file.name}`;
    const provider = this.getDefaultProvider();
    
    const adapter = this.getAdapter(provider);
    const result = await adapter.upload({
      file,
      key,
      metadata
    });

    return {
      provider,
      key: result.key,
      url: result.url
    };
  }

  async download(location: StorageLocation): Promise<Blob> {
    const adapter = this.getAdapter(location.provider);
    const result = await adapter.download(location.key);
    return result.data;
  }

  async delete(location: StorageLocation): Promise<void> {
    const adapter = this.getAdapter(location.provider);
    await adapter.delete(location.key);
  }

  async getSignedUrl(location: StorageLocation, expiresIn: number = 3600): Promise<string> {
    const adapter = this.getAdapter(location.provider);
    return await adapter.getSignedUrl(location.key, expiresIn);
  }

  async migrateStorage(
    location: StorageLocation,
    targetProvider: StorageProvider
  ): Promise<StorageLocation> {
    if (location.provider === targetProvider) {
      return location;
    }

    const fromAdapter = this.getAdapter(location.provider);
    const toAdapter = this.getAdapter(targetProvider);

    // Download from source
    const downloadResult = await fromAdapter.download(location.key);
    
    // Create file from blob
    const file = new File([downloadResult.data], location.key.split('/').pop() || 'file', {
      type: downloadResult.metadata?.type || 'application/octet-stream'
    });

    // Upload to destination
    const uploadResult = await toAdapter.upload({
      file,
      key: location.key,
      metadata: downloadResult.metadata
    });

    // Delete from source (optional)
    // await fromAdapter.delete(location.key);

    return {
      provider: targetProvider,
      key: uploadResult.key,
      url: uploadResult.url
    };
  }

  private getDefaultProvider(): string {
    // Logic to determine default provider based on environment
    return StorageProvider.SUPABASE;
  }
}