import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

type RunStructuredAgentOptions = {
  request: Request
  agentName: string
  systemPrompt: string
  userPromptLabel: string
  failureLabel: string
  maxTokens?: number
}

export async function runStructuredAgent({
  request,
  agentName,
  systemPrompt,
  userPromptLabel,
  failureLabel,
  maxTokens = 2048,
}: RunStructuredAgentOptions) {
  const supabase = await createClient()
  if (!supabase) {
    return Response.json({ error: 'Supabase is not configured.' }, { status: 500 })
  }

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
      model: process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: `${userPromptLabel}\n\n${input}` }],
    })

    const text = message.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('\n')
      .trim()

    const cleaned = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
    const parsed = JSON.parse(cleaned)

    const timestamp = new Date().toISOString()

    try {
      await supabase.from('agent_runs').insert({
        user_id: user.id,
        agent_name: agentName,
        input_data: { input },
        output_data: parsed,
        timestamp,
      })
    } catch (logError) {
      console.error(`Failed to log ${agentName} run`, logError)
    }

    return Response.json(parsed)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    const failurePayload = { error: `${failureLabel}: ${message}` }

    try {
      await supabase.from('agent_runs').insert({
        user_id: user.id,
        agent_name: agentName,
        input_data: { input },
        output_data: failurePayload,
        timestamp: new Date().toISOString(),
      })
    } catch (logError) {
      console.error(`Failed to log ${agentName} run`, logError)
    }

    return Response.json(failurePayload, { status: 500 })
  }
}
