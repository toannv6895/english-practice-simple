import { PlaylistRepository } from '../../domain/repositories/PlaylistRepository';
import { Playlist } from '../../domain/entities/Playlist';
import { supabase } from '../../lib/supabase';

export class SupabasePlaylistRepository implements PlaylistRepository {
  async save(playlist: Omit<Playlist, 'id' | 'createdAt' | 'updatedAt'>): Promise<Playlist> {
    // Build insert payload defensively — callers may provide visibility or a cover image via imageLocation
    const insertData: any = {
      owner_id: (playlist as any).userId || (playlist as any).owner_id,
      name: (playlist as any).name,
      description: (playlist as any).description ?? null,
      audio_count: 0,
    };

    // Preserve explicit visibility when provided, otherwise default to 'private'
    insertData.visibility = (playlist as any).visibility ?? 'private';

    // Handle image/location metadata if available
    if ((playlist as any).imageLocation) {
      insertData.storage_provider = (playlist as any).imageLocation.provider;
      insertData.storage_key = (playlist as any).imageLocation.key;
      insertData.storage_url = (playlist as any).imageLocation.url;
      insertData.cover_image = (playlist as any).imageLocation.url ?? null;
    } else {
      // allow callers to pass cover_image/storage_* fields directly (some code paths insert these)
      if ((playlist as any).cover_image) insertData.cover_image = (playlist as any).cover_image;
      if ((playlist as any).storage_provider) insertData.storage_provider = (playlist as any).storage_provider;
      if ((playlist as any).storage_key) insertData.storage_key = (playlist as any).storage_key;
      if ((playlist as any).storage_url) insertData.storage_url = (playlist as any).storage_url;
      // ensure cover_image exists as explicit null if not provided
      insertData.cover_image = insertData.cover_image ?? null;
    }

    const { data, error } = await supabase
      .from('playlists')
      .insert(insertData)
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
    // The DB column for owner is 'owner_id' — use that consistently
    const { data, error } = await supabase
      .from('playlists')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map((d: any) => this.mapToEntity(d));
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
      description: data.description ?? undefined,
      imageLocation: data.storage_key ? {
        provider: data.storage_provider,
        key: data.storage_key,
        url: data.storage_url,
      } : undefined,
      audioIds: data.audio_ids || [],
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}