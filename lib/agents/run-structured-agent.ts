import Anthropic from '@anthropic-ai/sdk'
import type { SupabaseClient } from '@supabase/supabase-js'
import { checkRateLimit } from '@/lib/agents/rate-limit'
import { agentInputSchema, getValidationMessage } from '@/lib/agents/validation'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

type RunStructuredAgentOptions = {
  request: Request
  agentName: string
  systemPrompt: string
  userPromptLabel: string
  failureLabel: string
  maxTokens?: number
}

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const RATE_LIMIT_MAX_REQUESTS = 12

async function logAgentRun(
  supabase: SupabaseClient,
  payload: {
    user_id: string
    agent_name: string
    input_data: Record<string, unknown>
    output_data: Record<string, unknown>
    timestamp: string
  },
) {
  const { error } = await supabase.from('agent_runs').insert(payload)

  if (error) {
    console.error(`Failed to log ${payload.agent_name} run:`, error.message)
  }
}

function extractStructuredJson(rawText: string) {
  const direct = rawText.trim()
  const fencedMatch = direct.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)
  const objectMatch = direct.match(/\{[\s\S]*\}/)

  const candidates = [direct, fencedMatch?.[1], objectMatch?.[0]].filter(
    (value): value is string => Boolean(value && value.trim()),
  )

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate.trim()) as Record<string, unknown>
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed
      }
    } catch {
      // Try the next candidate.
    }
  }

  throw new Error('The AI response was not valid JSON. Please try again.')
}

function toUserFacingErrorMessage(failureLabel: string, rawMessage: string) {
  const message = rawMessage.toLowerCase()

  if (message.includes('rate limit')) {
    return 'The AI service is currently busy. Please wait a moment and try again.'
  }

  if (message.includes('credit balance') || message.includes('billing')) {
    return 'The AI service is temporarily unavailable. Please try again later.'
  }

  if (message.includes('valid json')) {
    return 'The response could not be structured correctly. Please try again.'
  }

  return `${failureLabel}. Please try again.`
}

export async function runStructuredAgent({
  request,
  agentName,
  systemPrompt,
  userPromptLabel,
  failureLabel,
  maxTokens = 2048,
}: RunStructuredAgentOptions) {
  const requestStartedAt = Date.now()
  const supabase = await createClient()
  if (!supabase) {
    return Response.json({ error: 'Supabase is not configured.' }, { status: 500 })
  }

  const logClient = createAdminClient() ?? supabase

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return Response.json({ error: 'Unauthorized. Please log in to use this agent.' }, { status: 401 })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return Response.json({ error: 'ANTHROPIC_API_KEY is not configured.' }, { status: 500 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const validation = agentInputSchema.safeParse(body)
  if (!validation.success) {
    return Response.json({ error: getValidationMessage(validation.error) }, { status: 400 })
  }

  const { input } = validation.data
  const requestIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const rateLimit = checkRateLimit({
    key: `${user.id}:${requestIp}`,
    limit: RATE_LIMIT_MAX_REQUESTS,
    windowMs: RATE_LIMIT_WINDOW_MS,
  })

  if (!rateLimit.allowed) {
    const retryAfterSeconds = Math.max(Math.ceil((rateLimit.resetAt - Date.now()) / 1000), 1)
    return Response.json(
      { error: `Rate limit exceeded. Please wait ${retryAfterSeconds} seconds and try again.` },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfterSeconds),
        },
      },
    )
  }

  try {
    const model = process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-20250514'
    const client = new Anthropic({ apiKey })
    const message = await client.messages.create({
      model,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: `${userPromptLabel}\n\n${input}` }],
    })

    const text = message.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('\n')
      .trim()

    const parsed = extractStructuredJson(text)
    const timestamp = new Date().toISOString()

    await logAgentRun(logClient, {
      user_id: user.id,
      agent_name: agentName,
      input_data: { input },
      output_data: {
        ...parsed,
        _meta: {
          status: 'success',
          model,
          duration_ms: Date.now() - requestStartedAt,
        },
      },
      timestamp,
    })

    return Response.json(parsed)
  } catch (error) {
    const rawMessage = error instanceof Error ? error.message : 'Unknown error'
    const userMessage = toUserFacingErrorMessage(failureLabel, rawMessage)

    const failurePayload = {
      error: userMessage,
      _meta: {
        status: 'failed',
        duration_ms: Date.now() - requestStartedAt,
        raw_error: rawMessage,
      },
    }

    console.error(`${agentName} failed:`, rawMessage)

    await logAgentRun(logClient, {
      user_id: user.id,
      agent_name: agentName,
      input_data: { input },
      output_data: failurePayload,
      timestamp: new Date().toISOString(),
    })

    return Response.json({ error: userMessage }, { status: 500 })
  }
}
