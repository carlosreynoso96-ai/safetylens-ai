'use client'

import { useState, useCallback, useRef } from 'react'

interface UseSpeechSynthesisReturn {
  isSpeaking: boolean
  isSupported: boolean
  speak: (text: string) => void
  cancel: () => void
}

export function useSpeechSynthesis(): UseSpeechSynthesisReturn {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window

  const speak = useCallback(
    (text: string) => {
      if (!isSupported) return

      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 1.0
      utterance.pitch = 1.0
      utterance.volume = 1.0

      // Try to find a natural-sounding English voice
      const voices = window.speechSynthesis.getVoices()
      const preferred = voices.find(
        (v) => v.lang.startsWith('en') && v.name.includes('Natural')
      )
      if (preferred) {
        utterance.voice = preferred
      } else {
        const english = voices.find((v) => v.lang.startsWith('en'))
        if (english) utterance.voice = english
      }

      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)

      utteranceRef.current = utterance
      window.speechSynthesis.speak(utterance)
    },
    [isSupported]
  )

  const cancel = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }, [isSupported])

  return { isSpeaking, isSupported, speak, cancel }
}
