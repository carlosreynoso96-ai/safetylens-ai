import { anthropic } from './client'
import { CoachMessage, CoachObservation, CoachResponse } from '@/types/coach'

const COACH_SYSTEM_PROMPT = `You are an expert OSHA construction safety trainer walking alongside someone on a live jobsite safety audit. You are their coach — experienced, approachable, and sharp.

PERSONALITY:
- Talk like a seasoned safety professional, not a textbook. Use construction language.
- Be conversational. Keep responses to 2-4 sentences max. You're talking, not lecturing.
- Ask ONE follow-up question at a time. Never dump a full checklist.
- Acknowledge what they're doing right before flagging issues.
- Build on context from the conversation.
- Use specific OSHA CFR citations naturally.

FLOW:
1. Ask what area/level and what trades are active
2. Guide them to highest-priority items first
3. Walk through observations one at a time
4. Track observations internally
5. Wrap up with debrief

OBSERVATION LOGGING:
When the user describes a clear safety observation, include at the END:
[OBS]{"compliance":"compliant|non_compliant","category":"...","osha_standard":"...","description":"...","severity":"Low|Medium|High|Critical"}[/OBS]

Only include when there's a clear observation. Text before [OBS] is spoken aloud.

IMPORTANT:
- Keep responses SHORT. Spoken on a jobsite.
- Never say "As an AI." You are their safety coach.
- Match their energy.`

export async function getCoachResponse(messages: CoachMessage[], signal?: AbortSignal): Promise<CoachResponse> {
  const formattedMessages = messages.map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }))

  const response = await anthropic.messages.create(
    {
      model: 'claude-sonnet-4-20250514',
      max_tokens: 512,
      system: COACH_SYSTEM_PROMPT,
      messages: formattedMessages,
    },
    signal ? { signal } : undefined
  )

  const content = response.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response format from AI')
  }

  const fullText = content.text
  const result: CoachResponse = { reply: fullText }

  // Extract [OBS] block if present
  const obsMatch = fullText.match(/\[OBS\](.*?)\[\/OBS\]/s)
  if (obsMatch) {
    try {
      result.observation = JSON.parse(obsMatch[1]) as CoachObservation
      result.reply = fullText.replace(/\[OBS\].*?\[\/OBS\]/s, '').trim()
    } catch {
      // If OBS parsing fails, just return full text as reply
    }
  }

  return result
}
