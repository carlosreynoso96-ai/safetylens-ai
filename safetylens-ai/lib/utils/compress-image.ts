import imageCompression from 'browser-image-compression'

const MAX_DIMENSION = 1200
const FALLBACK_DIMENSION = 960

/**
 * Native canvas fallback — uses createImageBitmap to decode at reduced
 * resolution so we never allocate a full-size bitmap in memory.
 * Works on all modern mobile browsers (iOS 15+, Chrome Android).
 */
async function nativeCompress(file: File, maxDim: number, quality: number): Promise<File> {
  // createImageBitmap can resize during decode — avoids the full-res memory spike
  const bitmap = await createImageBitmap(file, {
    resizeWidth: maxDim,
    resizeHeight: maxDim,
    resizeQuality: 'medium',
  })

  // The bitmap respects aspect ratio when only one dimension would exceed maxDim,
  // but createImageBitmap with both set will squash. Calculate proper dims.
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height))
  const w = Math.round(bitmap.width * scale) || bitmap.width
  const h = Math.round(bitmap.height * scale) || bitmap.height

  const canvas = new OffscreenCanvas(w, h)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas not supported')
  ctx.drawImage(bitmap, 0, 0, w, h)
  bitmap.close()

  const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality })
  return new File([blob], file.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' })
}

export async function compressImage(file: File): Promise<File> {
  // 1. Try the library (best quality, uses Web Worker)
  try {
    return await imageCompression(file, {
      maxSizeMB: 1,
      maxWidthOrHeight: MAX_DIMENSION,
      useWebWorker: true,
      fileType: 'image/jpeg' as const,
      initialQuality: 0.7,
    })
  } catch {
    // Library failed — fall through to native
  }

  // 2. Native canvas fallback — bypasses the library entirely
  try {
    return await nativeCompress(file, FALLBACK_DIMENSION, 0.65)
  } catch {
    // OffscreenCanvas or createImageBitmap not available
  }

  // 3. Last resort — regular canvas without createImageBitmap resize
  try {
    return await new Promise<File>((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const scale = Math.min(1, FALLBACK_DIMENSION / Math.max(img.width, img.height))
        const w = Math.round(img.width * scale)
        const h = Math.round(img.height * scale)
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) { reject(new Error('Canvas not supported')); return }
        ctx.drawImage(img, 0, 0, w, h)
        canvas.toBlob(
          (blob) => {
            if (!blob) { reject(new Error('Canvas export failed')); return }
            resolve(new File([blob], file.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' }))
          },
          'image/jpeg',
          0.6,
        )
      }
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = URL.createObjectURL(file)
    })
  } catch (err) {
    throw new Error(
      `Could not process ${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB). ` +
      `Try taking the photo at a lower resolution.`,
    )
  }
}

export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      const result = reader.result as string
      // Remove the data:image/...;base64, prefix
      const base64 = result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = (error) => reject(error)
  })
}
