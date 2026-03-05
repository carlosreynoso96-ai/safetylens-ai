'use client'

import { useRef, useEffect } from 'react'
import { CoachMessage } from '@/types/coach'
import { Headphones, User } from 'lucide-react'

interface CoachChatProps {
  messages: CoachMessage[]
  isProcessing: boolean
}

export function CoachChat({ messages, isProcessing }: CoachChatProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isProcessing])

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 && (
        <div className="text-center text-gray-400 py-12">
          <Headphones className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">
            Start your safety walk by holding the mic button and telling your coach
            what area you&apos;re in and what trades are active.
          </p>
        </div>
      )}

      {messages.map((msg, index) => (
        <div
          key={index}
          className={`flex gap-3 ${
            msg.role === 'user' ? 'justify-end' : 'justify-start'
          }`}
        >
          {msg.role === 'assistant' && (
            <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Headphones className="w-4 h-4" />
            </div>
          )}
          <div
            className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
              msg.role === 'user'
                ? 'bg-orange-500 text-white rounded-br-md'
                : 'bg-gray-100 text-gray-900 rounded-bl-md'
            }`}
          >
            {msg.content}
          </div>
          {msg.role === 'user' && (
            <div className="w-8 h-8 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <User className="w-4 h-4" />
            </div>
          )}
        </div>
      ))}

      {isProcessing && (
        <div className="flex gap-3 justify-start">
          <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <Headphones className="w-4 h-4" />
          </div>
          <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}
