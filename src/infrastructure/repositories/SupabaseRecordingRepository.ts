import { RecordingRepository } from '../../domain/repositories/RecordingRepository';
import { Recording } from '../../domain/entities/Recording';
import { supabase } from '../../lib/supabase';

export class SupabaseRecordingRepository implements RecordingRepository {
  async create(recording: Omit<Recording, 'id' | 'createdAt' | 'updatedAt'>): Promise<Recording> {
    const { data, error } = await supabase
      .from('recordings')
      .insert({
        user_id: recording.userId,
        audio_id: recording.audioId,
        type: recording.type,
        storage_provider: recording.storageLocation.provider,
        storage_key: recording.storageLocation.key,
        storage_url: recording.storageLocation.url,
        accuracy_score: recording.accuracyScore,
        duration: recording.duration,
        metadata: recording.metadata,
      })
      .select()
      .single();

    if (error) throw error;

    return this.mapToEntity(data);
  }

  async findById(id: string): Promise<Recording | null> {
    const { data, error } = await supabase
      .from('recordings')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return this.mapToEntity(data);
  }

  async findByUserId(userId: string): Promise<Recording[]> {
    const { data, error } = await supabase
      .from('recordings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(this.mapToEntity);
  }

  async findByAudioId(audioId: string): Promise<Recording[]> {
    const { data, error } = await supabase
      .from('recordings')
      .select('*')
      .eq('audio_id', audioId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(this.mapToEntity);
  }

  async findByType(type: 'shadow' | 'dictation' | 'listening'): Promise<Recording[]> {
    const { data, error } = await supabase
      .from('recordings')
      .select('*')
      .eq('type', type)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(this.mapToEntity);
  }

  async update(id: string, updates: Partial<Recording>): Promise<Recording> {
    const updateData: any = { ...updates };
    
    if (updates.storageLocation) {
      updateData.storage_provider = updates.storageLocation.provider;
      updateData.storage_key = updates.storageLocation.key;
      updateData.storage_url = updates.storageLocation.url;
      delete updateData.storageLocation;
    }

    const { data, error } = await supabase
      .from('recordings')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.mapToEntity(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('recordings')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  private mapToEntity(data: any): Recording {
    return {
      id: data.id,
      userId: data.user_id,
      audioId: data.audio_id,
      type: data.type,
      storageLocation: {
        provider: data.storage_provider,
        key: data.storage_key,
        url: data.storage_url,
      },
      accuracyScore: data.accuracy_score,
      duration: data.duration,
      metadata: data.metadata || {},
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}