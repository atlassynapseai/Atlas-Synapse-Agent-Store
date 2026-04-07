import Anthropic from '@anthropic-ai/sdk'

const SYSTEM_PROMPT = `You are a senior financial fraud analyst and forensic accountant. Analyze the provided transaction data or activity log and return a structured fraud detection report as valid JSON only — no markdown, no explanation, just the JSON object.

The JSON must follow this exact shape:
{
  "executive_summary": "string — 2-3 sentence overview of findings",
  "overall_risk_score": number (0-100),
  "risk_level": "Critical" | "High" | "Medium" | "Low",
  "risk_rationale": "string — why this risk level was assigned",
  "affected_accounts": ["string", ...],
  "total_value_at_risk": "string or null — e.g. '$14,250.00'",
  "anomalies": [
    {
      "severity": "Critical" | "High" | "Medium" | "Low",
      "type": "string — e.g. 'Velocity Fraud', 'Account Takeover', 'Card Testing'",
      "description": "string",
      "transaction_ref": "string or null",
      "amount": "string or null"
    }
  ],
  "fraud_indicators": ["string", ...],
  "investigation_recommendations": [
    {
      "priority": "Immediate" | "Short-term" | "Long-term",
      "action": "string",
      "rationale": "string"
    }
  ],
  "suggested_controls": ["string", ...]
}

If the input doesn't look like transaction data or an activity log with financial relevance, return:
{ "error": "The provided input does not appear to be transaction data or a financial activity log. Please paste actual transaction records, account activity, or a financial incident report." }`

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
      messages: [{ role: 'user', content: `Transaction data / activity log to analyze:\n\n${input}` }],
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
