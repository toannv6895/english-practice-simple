import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useAuthStore } from '../store/useAuthStore'
import { uploadAudioFile } from '../utils/storage'
import { supabase } from '../lib/supabase'

interface FileUploadProps {
  playlistId: string
  onUploadComplete?: () => void
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
  playlistId, 
  onUploadComplete 
}) => {
  const { user } = useAuthStore()
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!user) {
      setError('You must be logged in to upload files')
      return
    }
    
    setIsUploading(true)
    setError(null)
    
    try {
      for (const file of acceptedFiles) {
        // Validate file type
        if (!file.type.startsWith('audio/')) {
          throw new Error(`${file.name} is not an audio file`)
        }
        
        // Validate file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`${file.name} is too large (max 10MB)`)
        }
        
        // Upload to Supabase Storage
        const url = await uploadAudioFile(file, user.id, playlistId)
        
        // Save metadata to database
        const { error: dbError } = await supabase
          .from('audios')
          .insert([{
            name: file.name,
            url,
            playlist_id: playlistId,
            owner_id: user.id,
            file_size: file.size
          }])
        
        if (dbError) throw dbError
        
        setUploadProgress((prev) => prev + (100 / acceptedFiles.length))
      }
      
      onUploadComplete?.()
    } catch (error: any) {
      setError(error.message || 'Upload failed')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }, [user, playlistId, onUploadComplete])
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a', '.aac', '.ogg']
    },
    disabled: isUploading
  })
  
  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-colors duration-200
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        {isUploading ? (
          <div>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">
              Uploading... {Math.round(uploadProgress)}%
            </p>
          </div>
        ) : (
          <div>
            <p className="text-lg font-medium text-gray-700 mb-2">
              {isDragActive ? 'Drop audio files here' : 'Drag & drop audio files here'}
            </p>
            <p className="text-sm text-gray-500">
              or click to select files (MP3, WAV, M4A, AAC, OGG)
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Max file size: 10MB
            </p>
          </div>
        )}
      </div>
      
      {error && (
        <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}
    </div>
  )
}