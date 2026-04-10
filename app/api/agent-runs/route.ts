import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

function getRunStatus(outputData: Record<string, unknown> | null) {
    const meta = outputData?._meta
    if (meta && typeof meta === 'object' && 'status' in meta) {
        return meta.status === 'failed' ? 'failed' : 'success'
    }

    return outputData && typeof outputData.error === 'string' ? 'failed' : 'success'
}

export async function GET(request: Request) {
    const supabase = await createClient()
    if (!supabase) {
        return Response.json({ error: 'Supabase is not configured.' }, { status: 500 })
    }

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
        return Response.json({ error: 'Please sign in to view your saved reports.' }, { status: 401 })
    }

    const url = new URL(request.url)
    const limitParam = Number(url.searchParams.get('limit') ?? '5')
    const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 20) : 5
    const agentName = url.searchParams.get('agentName')?.trim()

    const db = createAdminClient() ?? supabase

    let query = db
        .from('agent_runs')
        .select('id, agent_name, input_data, output_data, timestamp, created_at')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false })
        .limit(limit)

    if (agentName) {
        query = query.eq('agent_name', agentName)
    }

    const { data, error } = await query

    if (error) {
        console.error('Failed to load agent run history:', error.message)
        return Response.json({ error: 'Could not load your saved reports right now.' }, { status: 500 })
    }

    const runs = (data ?? []).map((row) => {
        const inputData = row.input_data as Record<string, unknown> | null
        const outputData = row.output_data as Record<string, unknown> | null
        const meta = outputData?._meta as { duration_ms?: number } | undefined
        const summary = typeof outputData?.error === 'string'
            ? outputData.error
            : typeof outputData?.executive_summary === 'string'
                ? outputData.executive_summary
                : typeof outputData?.summary === 'string'
                    ? outputData.summary
                    : typeof outputData?.tier_rationale === 'string'
                        ? outputData.tier_rationale
                        : typeof outputData?.recommended_next_action === 'string'
                            ? outputData.recommended_next_action
                            : 'Open this report to review the saved details.'

        return {
            id: row.id,
            agent_name: row.agent_name,
            status: getRunStatus(outputData),
            timestamp: row.timestamp ?? row.created_at,
            summary,
            input_preview: typeof inputData?.input === 'string' ? inputData.input.slice(0, 180) : '',
            duration_ms: typeof meta?.duration_ms === 'number' ? meta.duration_ms : null,
        }
    })

    return Response.json({ runs })
}
