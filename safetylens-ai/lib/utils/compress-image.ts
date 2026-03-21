import imageCompression from 'browser-image-compression'

export async function compressImage(file: File): Promise<File> {
  try {
    const compressedFile = await imageCompression(file, {
      maxSizeMB: 1,
      maxWidthOrHeight: 1200,
      useWebWorker: true,
      fileType: 'image/jpeg' as const,
      initialQuality: 0.7,
    })
    return compressedFile
  } catch {
    // Web Worker or canvas failed (common on mobile) — retry without Web Worker
    // and with smaller dimensions to stay within mobile memory limits
    try {
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 0.8,
        maxWidthOrHeight: 960,
        useWebWorker: false,
        fileType: 'image/jpeg' as const,
        initialQuality: 0.6,
      })
      return compressedFile
    } catch (fallbackErr) {
      throw new Error(
        `Failed to compress image (${file.name}, ${(file.size / 1024 / 1024).toFixed(1)}MB). ` +
        `Try a smaller photo or screenshot instead.`
      )
    }
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
