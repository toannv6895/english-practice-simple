import { supabase } from '../lib/supabase'

export const uploadAudioFile = async (
  file: File,
  userId: string,
  playlistId: string
): Promise<string> => {
  const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
  const filePath = `${userId}/${playlistId}/${fileName}`
  
  const { data, error } = await supabase.storage
    .from('audios')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    })
    
  if (error) throw error
  
  const { data: { publicUrl } } = supabase.storage
    .from('audios')
    .getPublicUrl(filePath)
    
  return publicUrl
}

export const deleteAudioFile = async (filePath: string) => {
  const { error } = await supabase.storage
    .from('audios')
    .remove([filePath])
    
  if (error) throw error
}

export const getAudioFileUrl = (filePath: string): string => {
  const { data: { publicUrl } } = supabase.storage
    .from('audios')
    .getPublicUrl(filePath)
    
  return publicUrl
}
