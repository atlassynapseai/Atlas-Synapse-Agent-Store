'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

type AgentRunItem = {
    id: string
    agent_name: string
    status: 'success' | 'failed'
    timestamp: string
    summary: string
    input_preview: string
    duration_ms: number | null
}

function formatTimestamp(value: string) {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value

    return new Intl.DateTimeFormat('en', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(date)
}

function formatDuration(durationMs: number | null) {
    if (!durationMs || durationMs < 1000) {
        return durationMs ? `${durationMs} ms` : null
    }

    return `${(durationMs / 1000).toFixed(1)}s`
}

export function AgentRunHistory({
    agentName,
    title = 'Saved reports',
    limit = 5,
}: {
    agentName?: string
    title?: string
    limit?: number
}) {
    const [runs, setRuns] = useState<AgentRunItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const queryString = useMemo(() => {
        const params = new URLSearchParams()
        params.set('limit', String(limit))
        if (agentName) params.set('agentName', agentName)
        return params.toString()
    }, [agentName, limit])

    useEffect(() => {
        let cancelled = false

        async function loadRuns() {
            setLoading(true)
            setError(null)

            const endpoints = [`/agents/api/agent-runs?${queryString}`, `/api/agent-runs?${queryString}`]
            let lastError = 'Could not load your saved reports right now.'

            try {
                for (const endpoint of endpoints) {
                    const res = await fetch(endpoint, { cache: 'no-store', credentials: 'include' })
                    const contentType = res.headers.get('content-type') ?? ''

                    if (!contentType.includes('application/json')) {
                        if (res.status === 404) {
                            continue
                        }

                        lastError = 'Your saved reports are temporarily unavailable. Please refresh and try again.'
                        continue
                    }

                    const data = await res.json() as { runs?: AgentRunItem[]; error?: string }

                    if (res.ok) {
                        if (!cancelled) {
                            setRuns(Array.isArray(data.runs) ? data.runs : [])
                        }
                        return
                    }

                    lastError = data.error || lastError

                    if (res.status !== 404) {
                        break
                    }
                }

                if (!cancelled) {
                    setError(lastError)
                }
            } catch {
                if (!cancelled) {
                    setError('Could not load your saved reports right now.')
                }
            } finally {
                if (!cancelled) {
                    setLoading(false)
                }
            }
        }

        void loadRuns()

        return () => {
            cancelled = true
        }
    }, [queryString])

    return (
        <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                    <h2 className="text-white text-lg font-semibold">{title}</h2>
                    <p className="text-white/40 text-sm">Review reports from your recent agent sessions.</p>
                </div>
            </div>

            {loading ? (
                <div className="space-y-3">
                    {Array.from({ length: Math.min(limit, 3) }).map((_, idx) => (
                        <div key={idx} className="animate-pulse rounded-xl border border-white/5 bg-black/20 p-4">
                            <div className="mb-2 h-3 w-32 rounded bg-white/10" />
                            <div className="mb-2 h-4 w-3/4 rounded bg-white/10" />
                            <div className="h-3 w-2/3 rounded bg-white/10" />
                        </div>
                    ))}
                </div>
            ) : error ? (
                <div className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {error}
                </div>
            ) : runs.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/10 bg-black/20 px-4 py-5 text-sm text-white/45">
                    No saved reports yet. Once you complete an analysis, it will appear here.
                </div>
            ) : (
                <div className="space-y-3">
                    {runs.map((run) => (
                        <div key={run.id} className="rounded-xl border border-white/5 bg-black/20 p-4 transition-colors hover:border-cyan-500/20">
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                                <span className="text-white/70 text-sm font-medium">{run.agent_name}</span>
                                <span
                                    className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${run.status === 'success'
                                        ? 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
                                        : 'border border-red-500/20 bg-red-500/10 text-red-300'
                                        }`}
                                >
                                    {run.status === 'success' ? 'Success' : 'Failed'}
                                </span>
                                <span className="text-white/25 text-xs">{formatTimestamp(run.timestamp)}</span>
                                {formatDuration(run.duration_ms) && (
                                    <span className="text-white/25 text-xs">· {formatDuration(run.duration_ms)}</span>
                                )}
                            </div>
                            <p className="mb-2 text-sm text-white/65 leading-relaxed">{run.summary}</p>
                            <p className="text-xs text-white/35 line-clamp-2">Input: {run.input_preview}</p>

                            <div className="mt-4 flex items-center justify-end">
                                <Link
                                    href={`/agents/reports/${run.id}`}
                                    className="inline-flex items-center gap-2 rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-xs font-medium text-cyan-200 transition-colors hover:border-cyan-400/30 hover:bg-cyan-500/15"
                                >
                                    Open report →
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    )
}
