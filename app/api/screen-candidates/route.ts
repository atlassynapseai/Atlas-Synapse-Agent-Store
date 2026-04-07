import Anthropic from '@anthropic-ai/sdk'

const SYSTEM_PROMPT = `You are a senior talent acquisition specialist and HR strategist. Analyze the provided job description and candidate profiles, then return a structured screening report as valid JSON only — no markdown, no explanation, just the JSON object.

The JSON must follow this exact shape:
{
  "role": "string — job title being hired for",
  "total_candidates_reviewed": number,
  "shortlisted_count": number,
  "ranked_candidates": [
    {
      "rank": number,
      "name": "string",
      "overall_score": number (0-100),
      "tier": "Strong Fit" | "Good Fit" | "Potential Fit" | "Not Recommended",
      "strengths": ["string", ...],
      "gaps": ["string", ...],
      "reasoning": "string — 2-3 sentences explaining the ranking",
      "recommended_action": "string — e.g. 'Schedule technical interview', 'Request portfolio'"
    }
  ],
  "hiring_recommendation": "string — overall recommendation and next steps",
  "key_differentiators": ["string", ...],
  "suggested_interview_questions": ["string", ...]
}

If the input doesn't contain a job description and at least one candidate profile, return:
{ "error": "Please provide both a job description and at least one candidate profile to screen." }`

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
      messages: [{ role: 'user', content: `Job description and candidate profiles:\n\n${input}` }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text.trim() : ''
    const cleaned = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
    const parsed = JSON.parse(cleaned)

    return Response.json(parsed)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return Response.json({ error: `Screening failed: ${message}` }, { status: 500 })
  }
}
