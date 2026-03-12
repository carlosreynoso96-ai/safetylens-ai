'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface UseSpeechRecognitionReturn {
  isListening: boolean
  transcript: string
  isSupported: boolean
  startListening: () => void
  stopListening: () => void
  resetTranscript: () => void
}

export function useSpeechRecognition(): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isSupported, setIsSupported] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  // Track which result index we've already processed to avoid duplicates
  const processedIndexRef = useRef(0)

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      setIsSupported(true)
      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = false // Only final results — avoids duplicate partials on mobile
      recognition.lang = 'en-US'

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        // Only process NEW results (from processedIndexRef onward) to prevent duplicates
        let newTranscript = ''
        for (let i = processedIndexRef.current; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            newTranscript += event.results[i][0].transcript
            processedIndexRef.current = i + 1
          }
        }
        if (newTranscript) {
          setTranscript((prev) => (prev ? prev + ' ' + newTranscript : newTranscript))
        }
      }

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = recognition
    }
  }, [])

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setTranscript('')
      processedIndexRef.current = 0 // Reset processed index for new session
      recognitionRef.current.start()
      setIsListening(true)
    }
  }, [isListening])

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }, [isListening])

  const resetTranscript = useCallback(() => {
    setTranscript('')
  }, [])

  return {
    isListening,
    transcript,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  }
}
