import { z } from 'zod'
import { MAX_AGENT_INPUT_CHARS } from '@/lib/agents/constants'

export const agentInputSchema = z.object({
  input: z
    .string({ error: 'Input must be provided as text.' })
    .trim()
    .min(1, 'Please enter some text before running the agent.')
    .max(
      MAX_AGENT_INPUT_CHARS,
      `Input is too large. Please keep it under ${MAX_AGENT_INPUT_CHARS.toLocaleString()} characters.`,
    ),
})

export function getValidationMessage(error: z.ZodError) {
  return error.issues[0]?.message ?? 'Invalid input.'
}
