'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'

interface TextInputProps {
  onSend: (text: string) => void
  disabled?: boolean
}

export function TextInput({ onSend, disabled }: TextInputProps) {
  const [text, setText] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim() || disabled) return
    onSend(text.trim())
    setText('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type a message..."
        disabled={disabled}
        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={!text.trim() || disabled}
        className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center hover:bg-orange-600 disabled:opacity-50 transition-colors"
      >
        <Send className="w-4 h-4" />
      </button>
    </form>
  )
}
