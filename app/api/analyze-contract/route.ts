import Anthropic from '@anthropic-ai/sdk'

const SYSTEM_PROMPT = `You are a senior commercial lawyer and contract analyst. Analyze the provided contract text and return a structured report as valid JSON only — no markdown, no explanation, just the JSON object.

The JSON must follow this exact shape:
{
  "executive_summary": "string — 2-3 sentence plain-English overview",
  "contract_type": "string — e.g. SaaS Subscription Agreement, NDA, Employment Contract",
  "parties": [{ "name": "string", "role": "string" }],
  "effective_date": "string or null",
  "expiry_date": "string or null",
  "auto_renewal": boolean,
  "auto_renewal_notice_days": "string or null — e.g. '30 days before expiry'",
  "financial_terms": "string — summary of payment obligations",
  "key_clauses": [
    { "title": "string", "summary": "string", "clause_ref": "string or null" }
  ],
  "obligations": [
    { "party": "string", "obligation": "string", "deadline": "string or null" }
  ],
  "risks": [
    { "severity": "High" | "Medium" | "Low", "description": "string", "clause_ref": "string or null" }
  ],
  "termination_conditions": "string",
  "governing_law": "string or null"
}

If the input is not a contract, return:
{ "error": "The provided input does not appear to be a contract. Please paste actual contract text." }`

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
      messages: [{ role: 'user', content: `Contract text to analyze:\n\n${input}` }],
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
