import { supabase } from '../lib/supabase'

export const migrateLocalDataToSupabase = async (userId: string) => {
  // Sample data for new users
  const samplePlaylists = [
    {
      name: 'My First Playlist',
      description: 'Start practicing English with this playlist',
      visibility: 'private' as const
    },
    {
      name: 'Daily Practice',
      description: 'Practice English daily with these audio files',
      visibility: 'private' as const
    }
  ]
  
  try {
    for (const playlist of samplePlaylists) {
      const { data, error } = await supabase
        .from('playlists')
        .insert([{
          ...playlist,
          owner_id: userId
        }])
        .select()
        .single()
      
      if (error) {
        console.error('Error creating sample playlist:', error)
      }
    }
  } catch (error) {
    console.error('Migration error:', error)
  }
}
