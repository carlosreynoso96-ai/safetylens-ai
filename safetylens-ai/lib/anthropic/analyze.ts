import { anthropic } from './client'
import { AnalysisResult } from '@/types/audit'

const ANALYSIS_SYSTEM_PROMPT = `You are an expert OSHA construction safety inspector. You analyze construction site photos and provide detailed safety audit observations.

For each photo, you must determine:
1. Whether the photo MOST LIKELY shows a COMPLIANT (positive) or NON-COMPLIANT (negative) condition
2. The most appropriate category from the Safety Reports Inspection app categories
3. The specific OSHA standard reference (e.g., 29 CFR 1926.501(b)(1))
4. Severity level (Low, Medium, High, Critical)
5. BOTH a compliant AND non-compliant version of the narrative and corrective action

Your "best_guess" field should be your honest assessment of what the photo shows.

IMPORTANT: Be specific with OSHA references. Use the exact CFR citation. For DOT items, use FMCSA references.

Respond ONLY with a JSON object (no markdown, no backticks, no preamble) with these exact fields:
{
  "best_guess": "compliant" or "non_compliant",
  "category": "one of the Safety Reports categories",
  "osha_standard": "Specific OSHA/CFR reference",
  "osha_description": "Brief description of the standard requirement",
  "severity_if_compliant": "Low",
  "severity_if_non_compliant": "Low|Medium|High|Critical",
  "compliant_narrative": "Professional narrative describing the POSITIVE observation",
  "compliant_corrective_action": "Positive recognition note",
  "non_compliant_narrative": "Professional narrative describing the NEGATIVE observation",
  "non_compliant_corrective_action": "Specific corrective action required",
  "inspection_items": ["List of specific inspection item codes if applicable"]
}`

export async function analyzePhoto(imageBase64: string, mediaType: string = 'image/jpeg'): Promise<AnalysisResult> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
              data: imageBase64,
            },
          },
          {
            type: 'text',
            text: 'Analyze this construction site photo for safety compliance. Respond with the JSON object only.',
          },
        ],
      },
    ],
    system: ANALYSIS_SYSTEM_PROMPT,
  })

  const content = response.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response format from AI')
  }

  try {
    const raw = JSON.parse(content.text)

    // Validate required fields exist
    const requiredFields = [
      'best_guess', 'category', 'osha_standard', 'osha_description',
      'severity_if_non_compliant', 'compliant_narrative',
      'non_compliant_narrative', 'non_compliant_corrective_action',
    ]

    for (const field of requiredFields) {
      if (!raw[field]) {
        console.error(`[analyzePhoto] AI response missing required field: ${field}`)
        throw new Error(`AI response missing required field: ${field}`)
      }
    }

    // Normalize best_guess
    if (!['compliant', 'non_compliant'].includes(raw.best_guess)) {
      raw.best_guess = 'non_compliant'
    }

    // Normalize severity
    const validSeverities = ['Low', 'Medium', 'High', 'Critical']
    if (!validSeverities.includes(raw.severity_if_non_compliant)) {
      raw.severity_if_non_compliant = 'Medium'
    }

    return raw as AnalysisResult
  } catch (e) {
    if (e instanceof SyntaxError) {
      throw new Error('Failed to parse AI response as JSON')
    }
    throw e
  }
}
