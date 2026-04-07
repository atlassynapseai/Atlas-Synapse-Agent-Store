import Anthropic from '@anthropic-ai/sdk'

const SYSTEM_PROMPT = `You are a senior B2B sales strategist. Analyze the provided prospect information and return a structured lead scoring report as valid JSON only — no markdown, no explanation, just the JSON object.

The JSON must follow this exact shape:
{
  "prospect_name": "string",
  "company": "string",
  "score": number (1-100),
  "priority_tier": "Hot" | "Warm" | "Cold",
  "tier_rationale": "string — 1-2 sentences explaining the tier",
  "strengths": ["string", ...],
  "concerns": ["string", ...],
  "fit_breakdown": {
    "budget_fit": number (1-10),
    "authority_fit": number (1-10),
    "need_fit": number (1-10),
    "timeline_fit": number (1-10)
  },
  "recommended_next_action": "string — specific, actionable step",
  "recommended_timeline": "string — e.g. 'Contact within 24 hours'",
  "talking_points": ["string", ...],
  "risk_factors": ["string", ...]
}

If the input doesn't contain identifiable prospect or lead information, return:
{ "error": "The provided input does not contain recognizable lead or prospect information. Please paste a prospect profile, CRM record, or lead summary." }`

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return Response.json({ error: 'ANTHROPIC_API_KEY is not configured.' }, { status: 500 })
  }

  let body: { input?: string }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const input = body.input?.trim()
  if (!input) {
    return Response.json({ error: 'No input provided.' }, { status: 400 })
  }

  try {
    const client = new Anthropic({ apiKey })
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: `Prospect information to score:\n\n${input}` }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text.trim() : ''
    const cleaned = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
    const parsed = JSON.parse(cleaned)

    return Response.json(parsed)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return Response.json({ error: `Scoring failed: ${message}` }, { status: 500 })
  }
}
