import { PlaylistRepository } from '../../domain/repositories/PlaylistRepository';
import { Playlist } from '../../domain/entities/Playlist';
import { supabase } from '../../lib/supabase';

export class SupabasePlaylistRepository implements PlaylistRepository {
  async save(playlist: Omit<Playlist, 'id' | 'createdAt' | 'updatedAt'>): Promise<Playlist> {
    const { data, error } = await supabase
      .from('playlists')
      .insert({
        owner_id: playlist.userId,
        name: playlist.name,
        description: playlist.description,
        storage_provider: playlist.imageLocation?.provider,
        storage_key: playlist.imageLocation?.key,
        storage_url: playlist.imageLocation?.url,
        audio_count: 0,
        visibility: 'private',
        cover_image: null
      })
      .select()
      .single();

    if (error) throw error;

    return this.mapToEntity(data);
  }

  async findById(id: string): Promise<Playlist | null> {
    const { data, error } = await supabase
      .from('playlists')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return this.mapToEntity(data);
  }

  async findByUserId(userId: string): Promise<Playlist[]> {
    const { data, error } = await supabase
      .from('playlists')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(this.mapToEntity);
  }

  async update(id: string, updates: Partial<Playlist>): Promise<Playlist> {
    const updateData: any = { ...updates };
    
    if (updates.imageLocation) {
      updateData.storage_provider = updates.imageLocation.provider;
      updateData.storage_key = updates.imageLocation.key;
      updateData.storage_url = updates.imageLocation.url;
      delete updateData.imageLocation;
    }

    if (updates.audioIds) {
      updateData.audio_ids = updates.audioIds;
      delete updateData.audioIds;
    }

    const { data, error } = await supabase
      .from('playlists')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.mapToEntity(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('playlists')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async addAudio(playlistId: string, audioId: string): Promise<void> {
    const { data: playlist, error: fetchError } = await supabase
      .from('playlists')
      .select('audio_ids')
      .eq('id', playlistId)
      .single();

    if (fetchError) throw fetchError;

    const audioIds = playlist.audio_ids || [];
    if (!audioIds.includes(audioId)) {
      audioIds.push(audioId);

      const { error } = await supabase
        .from('playlists')
        .update({ audio_ids: audioIds })
        .eq('id', playlistId);

      if (error) throw error;
    }
  }

  async removeAudio(playlistId: string, audioId: string): Promise<void> {
    const { data: playlist, error: fetchError } = await supabase
      .from('playlists')
      .select('audio_ids')
      .eq('id', playlistId)
      .single();

    if (fetchError) throw fetchError;

    const audioIds = (playlist.audio_ids || []).filter((id: string) => id !== audioId);

    const { error } = await supabase
      .from('playlists')
      .update({ audio_ids: audioIds })
      .eq('id', playlistId);

    if (error) throw error;
  }

  private mapToEntity(data: any): Playlist {
    return {
      id: data.id,
      userId: data.owner_id,
      name: data.name,
      description: data.description,
      imageLocation: data.storage_key ? {
        provider: data.storage_provider,
        key: data.storage_key,
        url: data.storage_url,
      } : undefined,
      audioIds: [],
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}