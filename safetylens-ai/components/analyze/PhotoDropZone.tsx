'use client'

import { useCallback, useRef, useState, type DragEvent, type ChangeEvent } from 'react'
import clsx from 'clsx'
import { Camera, Upload } from 'lucide-react'

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const ACCEPTED_EXTENSIONS = '.jpg,.jpeg,.png,.webp'

interface PhotoDropZoneProps {
  onFilesSelected: (files: File[]) => void
  disabled?: boolean
}

function PhotoDropZone({ onFilesSelected, disabled = false }: PhotoDropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const filterValidFiles = useCallback((fileList: FileList | File[]): File[] => {
    const files = Array.from(fileList)
    return files.filter((file) => ACCEPTED_TYPES.includes(file.type))
  }, [])

  const handleDragOver = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      if (!disabled) {
        setIsDragOver(true)
      }
    },
    [disabled],
  )

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOver(false)

      if (disabled) return

      const validFiles = filterValidFiles(e.dataTransfer.files)
      if (validFiles.length > 0) {
        onFilesSelected(validFiles)
      }
    },
    [disabled, filterValidFiles, onFilesSelected],
  )

  const handleFileInput = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files || disabled) return

      const validFiles = filterValidFiles(e.target.files)
      if (validFiles.length > 0) {
        onFilesSelected(validFiles)
      }

      // Reset input so the same file can be re-selected
      e.target.value = ''
    },
    [disabled, filterValidFiles, onFilesSelected],
  )

  const handleClick = useCallback(() => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }, [disabled])

  return (
    <div
      onDragOver={handleDragOver}
      onDragEnter={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
      aria-label="Upload photos for analysis"
      className={clsx(
        'relative flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-10',
        'cursor-pointer transition-all duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f97316]/50 focus-visible:ring-offset-2',
        disabled && 'opacity-50 cursor-not-allowed',
        isDragOver
          ? 'border-[#f97316] bg-orange-50 dark:bg-orange-900/10'
          : 'border-gray-300 bg-gray-50/50 hover:border-[#f97316]/50 hover:bg-orange-50/50 dark:border-gray-600 dark:bg-gray-800/50 dark:hover:border-[#f97316]/50 dark:hover:bg-orange-900/5',
      )}
    >
      {/* Icon */}
      <div
        className={clsx(
          'flex h-16 w-16 items-center justify-center rounded-full',
          isDragOver
            ? 'bg-orange-100 dark:bg-orange-900/30'
            : 'bg-gray-100 dark:bg-gray-800',
        )}
      >
        <Camera
          size={28}
          className={clsx(
            'transition-colors duration-200',
            isDragOver
              ? 'text-[#f97316]'
              : 'text-gray-400 dark:text-gray-500',
          )}
        />
      </div>

      {/* Text */}
      <div className="text-center">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {isDragOver ? 'Drop photos here' : 'Drag photos here or click to browse'}
        </p>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Accepts JPEG, PNG, and WebP images
        </p>
      </div>

      {/* Browse Button (visual only, the whole zone is clickable) */}
      <div
        className={clsx(
          'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium',
          'transition-colors duration-150',
          isDragOver
            ? 'bg-[#f97316] text-white'
            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700',
        )}
      >
        <Upload size={16} />
        Browse Files
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_EXTENSIONS}
        multiple
        onChange={handleFileInput}
        className="hidden"
        tabIndex={-1}
        aria-hidden="true"
      />
    </div>
  )
}

export { PhotoDropZone }
