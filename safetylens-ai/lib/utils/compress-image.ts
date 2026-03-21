import { createClient } from '@/lib/supabase/client'

/**
 * Upload the raw photo to Supabase Storage and return the storage path.
 * This completely avoids client-side image decoding/compression, which
 * crashes mobile browsers on large camera photos (12-48 MP).
 *
 * The server will download, compress with Sharp, and send to Claude.
 */
export async function uploadPhotoToStorage(
  file: File,
  userId: string,
  auditId: string,
): Promise<{ storagePath: string }> {
  const supabase = createClient()
  const fileId = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  const storagePath = `${userId}/${auditId}/raw/${fileId}.jpg`

  const { error } = await supabase.storage
    .from('audit-photos')
    .upload(storagePath, file, {
      contentType: file.type || 'image/jpeg',
      upsert: false,
    })

  if (error) {
    throw new Error(`Upload failed: ${error.message}`)
  }

  return { storagePath }
}

/**
 * Convert a File to base64 (still used as fallback for small files).
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      const result = reader.result as string
      const base64 = result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = (error) => reject(error)
  })
}
