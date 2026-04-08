import { runStructuredAgent } from '@/lib/agents/run-structured-agent'

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
  return runStructuredAgent({
    request,
    agentName: 'Lead Scoring Agent',
    systemPrompt: SYSTEM_PROMPT,
    userPromptLabel: 'Prospect information to score:',
    failureLabel: 'Scoring failed',
  })
}
