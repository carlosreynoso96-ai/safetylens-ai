'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CoachMessage, CoachObservation } from '@/types/coach'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis'
import { usePlan } from '@/hooks/usePlan'
import { CoachChat } from '@/components/coach/CoachChat'
import { VoiceButton } from '@/components/coach/VoiceButton'
import { TextInput } from '@/components/coach/TextInput'
import { ObservationLog } from '@/components/coach/ObservationLog'
import { WalkStartScreen } from '@/components/coach/WalkStartScreen'
import { StatusIndicator } from '@/components/coach/StatusIndicator'
import { ClipboardList, X, Square, Lock } from 'lucide-react'

type SessionState = 'start' | 'active' | 'ended'

export default function CoachPage() {
  const { canUseCoach, loading: planLoading, plan } = usePlan()
  const [sessionState, setSessionState] = useState<SessionState>('start')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [auditId, setAuditId] = useState<string | null>(null)
  const [messages, setMessages] = useState<CoachMessage[]>([])
  const [observations, setObservations] = useState<CoachObservation[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [showObsPanel, setShowObsPanel] = useState(false)
  const [status, setStatus] = useState<'ready' | 'listening' | 'speaking' | 'processing'>('ready')

  // Guard ref to prevent duplicate transcript submissions
  const transcriptSentRef = useRef(false)

  const { isListening, transcript, isSupported, startListening, stopListening, resetTranscript } =
    useSpeechRecognition()
  const { speak, cancel: cancelSpeech, isSpeaking } = useSpeechSynthesis()

  // Update status based on state
  useEffect(() => {
    if (isListening) setStatus('listening')
    else if (isSpeaking) setStatus('speaking')
    else if (isProcessing) setStatus('processing')
    else setStatus('ready')
  }, [isListening, isSpeaking, isProcessing])

  // Reset the sent guard when listening starts
  useEffect(() => {
    if (isListening) {
      transcriptSentRef.current = false
    }
  }, [isListening])

  // Handle transcript completion — fires once when user stops speaking
  useEffect(() => {
    if (!isListening && transcript && !transcriptSentRef.current) {
      transcriptSentRef.current = true // Prevent duplicate sends
      handleSendMessage(transcript)
      resetTranscript()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListening, transcript])

  async function handleStartWalk(projectId: string | null, inspectorName: string) {
    const supabase = createClient()

    try {
      // Create audit via centralized API (handles walk counting & validation)
      const res = await fetch('/api/audits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId || null,
          audit_type: 'coach',
          inspector_name: inspectorName || null,
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: 'Failed to create audit' }))
        console.error('Failed to create coach audit:', errData.error)
        return
      }

      const { audit } = await res.json()
      if (!audit) return

      // Create coach session
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: session } = await supabase
        .from('coach_sessions')
        .insert({
          audit_id: audit.id,
          user_id: user.id,
          messages: [],
        })
        .select()
        .single()

      if (!session) return

      // Log usage
      await supabase.from('usage_logs').insert({
        user_id: user.id,
        action: 'coach_walk',
        audit_id: audit.id,
      })

      setAuditId(audit.id)
      setSessionId(session.id)
      setSessionState('active')
      setMessages([])
      setObservations([])
    } catch (error) {
      console.error('Error starting coach walk:', error)
    }
  }

  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!sessionId || isProcessing) return

      const userMessage: CoachMessage = {
        role: 'user',
        content: text,
        timestamp: new Date().toISOString(),
      }

      const updatedMessages = [...messages, userMessage]
      setMessages(updatedMessages)
      setIsProcessing(true)

      try {
        const res = await fetch('/api/coach', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: updatedMessages,
            session_id: sessionId,
          }),
        })

        if (!res.ok) {
          throw new Error('Failed to get coach response')
        }

        const data = await res.json()

        const assistantMessage: CoachMessage = {
          role: 'assistant',
          content: data.reply,
          timestamp: new Date().toISOString(),
        }

        setMessages((prev) => [...prev, assistantMessage])

        // Speak the response
        speak(data.reply)

        // Log observation if present
        if (data.observation) {
          setObservations((prev) => [...prev, data.observation])
        }
      } catch (error) {
        console.error('Coach error:', error)
        const errorMessage: CoachMessage = {
          role: 'assistant',
          content: 'Sorry, I had trouble processing that. Could you repeat it?',
          timestamp: new Date().toISOString(),
        }
        setMessages((prev) => [...prev, errorMessage])
      }

      setIsProcessing(false)
    },
    [sessionId, isProcessing, messages, speak]
  )

  async function handleEndWalk() {
    if (!auditId || !sessionId) return

    cancelSpeech()

    // Send end walk message
    const endMessage: CoachMessage = {
      role: 'user',
      content: 'I want to wrap up this safety walk now. Please give me a quick debrief.',
      timestamp: new Date().toISOString(),
    }

    const updatedMessages = [...messages, endMessage]
    setMessages(updatedMessages)
    setIsProcessing(true)

    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          session_id: sessionId,
        }),
      })

      const data = await res.json()

      const assistantMessage: CoachMessage = {
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      speak(data.reply)

      if (data.observation) {
        setObservations((prev) => [...prev, data.observation])
      }
    } catch {
      // Ignore errors during wrap-up
    }

    // Update audit status
    const supabase = createClient()
    await supabase
      .from('audits')
      .update({ status: 'completed', updated_at: new Date().toISOString() })
      .eq('id', auditId)

    // End session
    await supabase
      .from('coach_sessions')
      .update({ ended_at: new Date().toISOString() })
      .eq('id', sessionId)

    setIsProcessing(false)
    setSessionState('ended')
  }

  // Show plan gate if coach is not available on the user's plan
  if (!planLoading && !canUseCoach) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="max-w-md text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
            <Lock className="w-8 h-8 text-orange-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Safety Coach Not Available</h2>
          <p className="text-sm text-gray-600">
            The AI Safety Coach is not included in your current <span className="font-medium capitalize">{plan.replace('_', ' ')}</span> plan.
            Upgrade to the Coach or Enterprise plan to unlock voice-guided safety walks.
          </p>
          <a
            href="/settings"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
          >
            Upgrade Plan
          </a>
        </div>
      </div>
    )
  }

  if (sessionState === 'start') {
    return (
      <div className="h-[calc(100vh-8rem)]">
        <WalkStartScreen onStart={handleStartWalk} />
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-4">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Chat Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <h2 className="font-semibold text-gray-900">Safety Coach</h2>
            <StatusIndicator status={status} />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowObsPanel(!showObsPanel)}
              className="lg:hidden flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ClipboardList className="w-4 h-4" />
              {observations.length}
            </button>
            {sessionState === 'active' && (
              <button
                onClick={handleEndWalk}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Square className="w-3.5 h-3.5" />
                End Walk
              </button>
            )}
          </div>
        </div>

        {/* Messages */}
        <CoachChat messages={messages} isProcessing={isProcessing} />

        {/* Input Area */}
        {sessionState === 'active' && (
          <div className="p-4 border-t border-gray-200 space-y-3">
            <div className="flex items-center justify-center gap-4">
              <VoiceButton
                isListening={isListening}
                isSupported={isSupported}
                onStart={() => {
                  cancelSpeech()
                  startListening()
                }}
                onStop={stopListening}
                disabled={isProcessing}
              />
            </div>
            <TextInput onSend={handleSendMessage} disabled={isProcessing} />
            {isListening && (
              <p className="text-center text-xs text-gray-400">
                Hold to talk, release when done
              </p>
            )}
          </div>
        )}

        {sessionState === 'ended' && (
          <div className="p-4 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500 mb-3">Walk completed.</p>
            <div className="flex gap-2 justify-center">
              {auditId && (
                <a
                  href={`/audits/${auditId}`}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
                >
                  View Audit Report
                </a>
              )}
              <button
                onClick={() => {
                  setSessionState('start')
                  setMessages([])
                  setObservations([])
                  setSessionId(null)
                  setAuditId(null)
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                New Walk
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Observation Panel (desktop always, mobile toggle) */}
      <div
        className={`${
          showObsPanel ? 'fixed inset-0 z-50 bg-white' : 'hidden'
        } lg:block lg:relative lg:w-80 lg:bg-white lg:rounded-xl lg:border lg:border-gray-200 lg:overflow-hidden`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900 text-sm">Observation Log</h3>
          <button
            onClick={() => setShowObsPanel(false)}
            className="lg:hidden p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <div className="overflow-y-auto max-h-[calc(100vh-12rem)]">
          <ObservationLog observations={observations} />
        </div>
      </div>
    </div>
  )
}
