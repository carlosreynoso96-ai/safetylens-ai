'use client'

import { Mic, MicOff } from 'lucide-react'

interface VoiceButtonProps {
  isListening: boolean
  isSupported: boolean
  onStart: () => void
  onStop: () => void
  disabled?: boolean
}

export function VoiceButton({
  isListening,
  isSupported,
  onStart,
  onStop,
  disabled,
}: VoiceButtonProps) {
  if (!isSupported) {
    return (
      <div className="text-center text-xs text-gray-400 py-2">
        Voice input not supported in this browser. Use text input below.
      </div>
    )
  }

  const handleToggle = () => {
    if (isListening) {
      onStop()
    } else {
      onStart()
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={disabled}
      className={`w-16 h-16 rounded-full flex items-center justify-center transition-all disabled:opacity-50 ${
        isListening
          ? 'bg-red-500 text-white shadow-lg shadow-red-200 scale-110 animate-pulse'
          : 'bg-orange-500 text-white shadow-lg shadow-orange-200 hover:bg-orange-600 hover:scale-105 active:scale-110'
      }`}
    >
      {isListening ? (
        <MicOff className="w-7 h-7" />
      ) : (
        <Mic className="w-7 h-7" />
      )}
    </button>
  )
}
