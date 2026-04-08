import { runStructuredAgent } from '@/lib/agents/run-structured-agent'

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
  return runStructuredAgent({
    request,
    agentName: 'Contract Analysis Agent',
    systemPrompt: SYSTEM_PROMPT,
    userPromptLabel: 'Contract text to analyze:',
    failureLabel: 'Analysis failed',
  })
}
