import Anthropic from '@anthropic-ai/sdk'

const SYSTEM_PROMPT = `You are a senior cybersecurity analyst. Analyze the provided security incident or log and return a structured threat report as valid JSON only — no markdown, no explanation, just the JSON object.

The JSON must follow this exact shape:
{
  "executive_summary": "string — 2-3 sentence overview of the incident",
  "severity_level": "Critical" | "High" | "Medium" | "Low" | "Informational",
  "severity_rationale": "string — why this severity was assigned",
  "affected_systems": ["string", ...],
  "attack_vector": "string — detailed description of the attack method/vector",
  "indicators_of_compromise": ["string", ...],
  "timeline": [
    { "timestamp": "string", "event": "string" }
  ],
  "remediation_steps": [
    { "priority": "Immediate" | "Short-term" | "Long-term", "action": "string", "description": "string" }
  ]
}

If the input doesn't look like a security incident or log, return:
{ "error": "The provided input does not appear to be a security incident or log. Please paste an actual incident report, system log, or security alert." }`

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
      messages: [{ role: 'user', content: `Security incident/log to analyze:\n\n${input}` }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text.trim() : ''
    const cleaned = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
    const parsed = JSON.parse(cleaned)

    return Response.json(parsed)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return Response.json({ error: `Analysis failed: ${message}` }, { status: 500 })
  }
}
