import { AudioRepository } from '../../domain/repositories/AudioRepository';
import { AudioFile } from '../../domain/entities/AudioFile';
import { supabase } from '../../lib/supabase';

export class SupabaseAudioRepository implements AudioRepository {
  async save(audio: Omit<AudioFile, 'id' | 'createdAt' | 'updatedAt'>): Promise<AudioFile> {
    const { data, error } = await supabase
      .from('audios')
      .insert({
        user_id: audio.userId,
        playlist_id: audio.playlistId,
        original_name: audio.originalName,
        mime_type: audio.mimeType,
        file_size: audio.fileSize,
        duration: audio.duration,
        storage_provider: audio.storageLocation.provider,
        storage_key: audio.storageLocation.key,
        storage_url: audio.storageLocation.url,
        transcript: audio.transcript,
        metadata: audio.metadata,
      })
      .select()
      .single();

    if (error) throw error;

    return this.mapToEntity(data);
  }

  async findById(id: string): Promise<AudioFile | null> {
    const { data, error } = await supabase
      .from('audios')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return this.mapToEntity(data);
  }

  async findByUserId(userId: string): Promise<AudioFile[]> {
    const { data, error } = await supabase
      .from('audios')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(this.mapToEntity);
  }

  async findByPlaylistId(playlistId: string): Promise<AudioFile[]> {
    const { data, error } = await supabase
      .from('audios')
      .select('*')
      .eq('playlist_id', playlistId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(this.mapToEntity);
  }

  async update(id: string, updates: Partial<AudioFile>): Promise<AudioFile> {
    const updateData: any = { ...updates };
    
    if (updates.storageLocation) {
      updateData.storage_provider = updates.storageLocation.provider;
      updateData.storage_key = updates.storageLocation.key;
      updateData.storage_url = updates.storageLocation.url;
      delete updateData.storageLocation;
    }

    const { data, error } = await supabase
      .from('audios')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.mapToEntity(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('audios')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  private mapToEntity(data: any): AudioFile {
    return {
      id: data.id,
      userId: data.user_id,
      playlistId: data.playlist_id,
      originalName: data.original_name,
      mimeType: data.mime_type,
      fileSize: data.file_size,
      duration: data.duration,
      storageLocation: {
        provider: data.storage_provider,
        key: data.storage_key,
        url: data.storage_url,
      },
      transcript: data.transcript,
      metadata: data.metadata || {},
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}