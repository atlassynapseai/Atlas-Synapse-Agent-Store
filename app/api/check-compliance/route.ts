import Anthropic from '@anthropic-ai/sdk'

const SYSTEM_PROMPT = `You are a senior regulatory compliance officer with expertise across GDPR, ISO 27001, SOC 2, HIPAA, PCI-DSS, and other major frameworks. Analyze the provided policy or procedure and return a structured compliance report as valid JSON only — no markdown, no explanation, just the JSON object.

The JSON must follow this exact shape:
{
  "executive_summary": "string — 2-3 sentence overview of compliance posture",
  "document_type": "string — e.g. Data Privacy Policy, Incident Response Procedure",
  "overall_risk_level": "Critical" | "High" | "Medium" | "Low",
  "compliance_score": number (0-100),
  "frameworks_assessed": ["string", ...],
  "compliant_areas": ["string", ...],
  "compliance_gaps": [
    {
      "severity": "Critical" | "High" | "Medium" | "Low",
      "gap": "string — what is missing or non-compliant",
      "regulation": "string — specific regulation or framework clause",
      "required_change": "string — what must be done to remediate"
    }
  ],
  "remediation_steps": [
    {
      "priority": "Immediate" | "Short-term" | "Long-term",
      "action": "string",
      "description": "string",
      "regulation": "string"
    }
  ],
  "estimated_effort": "string — e.g. 'Low (< 1 week)', 'Medium (1-4 weeks)', 'High (1-3 months)'"
}

If the input is not a policy, procedure, or compliance-relevant document, return:
{ "error": "The provided input does not appear to be a policy or procedure. Please paste an actual policy document, procedure, or regulatory text." }`

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
      messages: [{ role: 'user', content: `Policy/procedure to assess:\n\n${input}` }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text.trim() : ''
    const cleaned = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
    const parsed = JSON.parse(cleaned)

    return Response.json(parsed)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return Response.json({ error: `Assessment failed: ${message}` }, { status: 500 })
  }
}
