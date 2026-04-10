import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { AuthNav } from '@/components/auth/auth-nav'
import { AtlasLogo } from '@/components/brand/atlas-logo'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

const AGENT_META: Record<string, { href: string; icon: string; subtitle: string }> = {
    'Cybersecurity Threat Agent': {
        href: '/agents/cybersecurity',
        icon: '🛡️',
        subtitle: 'Re-run the threat workflow with fresh evidence or updated incident context.',
    },
    'Contract Analysis Agent': {
        href: '/agents/contract',
        icon: '📄',
        subtitle: 'Review the agreement again, compare versions, or continue negotiation prep.',
    },
    'Lead Scoring Agent': {
        href: '/agents/leads',
        icon: '🎯',
        subtitle: 'Re-score a prospect or continue your sales follow-up from the saved insight.',
    },
    'Regulatory Compliance Agent': {
        href: '/agents/compliance',
        icon: '⚖️',
        subtitle: 'Re-check the policy posture and confirm the latest compliance gaps.',
    },
    'Recruitment Screening Agent': {
        href: '/agents/hr',
        icon: '👥',
        subtitle: 'Reopen the hiring workflow and compare new candidate details quickly.',
    },
    'Fraud Detection Agent': {
        href: '/agents/fraud',
        icon: '🔍',
        subtitle: 'Continue the fraud review and investigate the saved risk findings.',
    },
}

function formatTimestamp(value: string | null) {
    if (!value) return 'Unknown'

    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value

    return new Intl.DateTimeFormat('en', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(date)
}

function formatDuration(durationMs: number | null | undefined) {
    if (!durationMs) return '—'
    if (durationMs < 1000) return `${durationMs} ms`
    return `${(durationMs / 1000).toFixed(1)}s`
}

function formatLabel(value: string) {
    return value
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase())
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function getTextValue(value: unknown) {
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        return String(value)
    }

    return null
}

function extractHighlights(outputData: Record<string, unknown>) {
    const candidates = [
        ['Overall Score', outputData.score],
        ['Priority', outputData.priority_tier],
        ['Severity', outputData.severity],
        ['Risk Level', outputData.risk_level],
        ['Status', outputData.compliance_status],
        ['Timeline', outputData.recommended_timeline],
        ['Recommendation', outputData.recommendation],
        ['Verdict', outputData.verdict],
    ] as const

    return candidates
        .map(([label, value]) => ({ label, value: getTextValue(value) }))
        .filter((item) => Boolean(item.value))
        .map((item) => ({ label: item.label, value: item.value as string }))
        .slice(0, 4)
}

function extractActionNotes(outputData: Record<string, unknown>) {
    const notes: string[] = []

    if (typeof outputData.recommended_next_action === 'string') {
        notes.push(outputData.recommended_next_action)
    }

    const listKeys = ['recommendations', 'remediation_steps', 'talking_points', 'strengths']

    for (const key of listKeys) {
        const value = outputData[key]
        if (Array.isArray(value)) {
            for (const item of value) {
                if (typeof item === 'string' && item.trim()) {
                    notes.push(item.trim())
                }
            }
        }
    }

    return Array.from(new Set(notes)).slice(0, 4)
}

function renderValue(value: unknown, keyPath = 'root'): ReactNode {
    if (value === null || value === undefined || value === '') {
        return <p className="text-sm text-white/35">Not available.</p>
    }

    if (typeof value === 'string') {
        return <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/75">{value}</p>
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
        return <p className="text-sm font-medium text-white">{String(value)}</p>
    }

    if (Array.isArray(value)) {
        if (value.length === 0) {
            return <p className="text-sm text-white/35">No items.</p>
        }

        const simpleItems = value.every((item) => !isPlainObject(item) && !Array.isArray(item))

        if (simpleItems) {
            return (
                <ul className="space-y-2">
                    {value.map((item, index) => (
                        <li key={`${keyPath}-${index}`} className="flex items-start gap-2 text-sm text-white/75">
                            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
                            <span>{String(item)}</span>
                        </li>
                    ))}
                </ul>
            )
        }

        return (
            <div className="space-y-3">
                {value.map((item, index) => (
                    <div key={`${keyPath}-${index}`} className="rounded-xl border border-white/5 bg-black/20 p-4">
                        {renderValue(item, `${keyPath}-${index}`)}
                    </div>
                ))}
            </div>
        )
    }

    if (isPlainObject(value)) {
        const entries = Object.entries(value).filter(([key]) => key !== '_meta')

        if (entries.length === 0) {
            return <p className="text-sm text-white/35">No details available.</p>
        }

        return (
            <div className="grid gap-3 md:grid-cols-2">
                {entries.map(([key, nestedValue]) => (
                    <div key={`${keyPath}-${key}`} className="rounded-xl border border-white/5 bg-black/20 p-4">
                        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
                            {formatLabel(key)}
                        </p>
                        {renderValue(nestedValue, `${keyPath}-${key}`)}
                    </div>
                ))}
            </div>
        )
    }

    return <p className="text-sm text-white/75">{String(value)}</p>
}

export default async function ReportDetailPage({
    params,
}: {
    params: Promise<{ reportId: string }>
}) {
    const { reportId } = await params
    const supabase = await createClient()

    if (!supabase) {
        redirect(`/agents/auth?next=${encodeURIComponent(`/agents/reports/${reportId}`)}`)
    }

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
        redirect(`/agents/auth?next=${encodeURIComponent(`/agents/reports/${reportId}`)}`)
    }

    const db = createAdminClient() ?? supabase
    const { data: row, error } = await db
        .from('agent_runs')
        .select('id, agent_name, input_data, output_data, timestamp, created_at')
        .eq('id', reportId)
        .eq('user_id', user.id)
        .maybeSingle()

    if (error || !row) {
        notFound()
    }

    const inputData = (row.input_data ?? {}) as Record<string, unknown>
    const outputData = (row.output_data ?? {}) as Record<string, unknown>
    const meta = (outputData._meta ?? null) as { duration_ms?: number; status?: string } | null
    const status = meta?.status === 'failed' || typeof outputData.error === 'string' ? 'Failed' : 'Success'
    const summary = typeof outputData.executive_summary === 'string'
        ? outputData.executive_summary
        : typeof outputData.summary === 'string'
            ? outputData.summary
            : typeof outputData.recommended_next_action === 'string'
                ? outputData.recommended_next_action
                : typeof outputData.error === 'string'
                    ? outputData.error
                    : null
    const inputText = typeof inputData.input === 'string'
        ? inputData.input
        : JSON.stringify(inputData, null, 2)
    const highlights = extractHighlights(outputData)
    const actionNotes = extractActionNotes(outputData)
    const agentMeta = AGENT_META[row.agent_name] ?? {
        href: '/agents',
        icon: '📊',
        subtitle: 'Open the Agent Store and continue this workflow from the saved result.',
    }

    return (
        <div className="page-noise min-h-screen bg-[#0a0a0f] font-[family-name:var(--font-geist-sans)]">
            <header className="border-b border-white/10 px-8 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <AtlasLogo href="/agents" />
                    <span className="text-white/20 mx-1">/</span>
                    <span className="text-white/50 text-sm">Report Details</span>
                </div>
                <AuthNav />
            </header>

            <div className="mx-auto max-w-6xl px-6 py-10 md:px-8">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <Link
                        href="/agents/reports"
                        className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm text-white/70 transition-colors hover:border-white/20 hover:bg-white/5 hover:text-white"
                    >
                        ← Back to saved reports
                    </Link>

                    <div className="flex flex-wrap items-center gap-3">
                        <Link
                            href={agentMeta.href}
                            className="inline-flex items-center gap-2 rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-100 transition-colors hover:border-cyan-400/30 hover:bg-cyan-500/15"
                        >
                            Launch this agent again →
                        </Link>
                    </div>
                </div>

                <div className="mb-6 rounded-[28px] border border-cyan-500/15 bg-[linear-gradient(180deg,rgba(7,17,40,0.95)_0%,rgba(4,10,24,0.98)_100%)] p-6 shadow-[0_0_40px_rgba(37,99,235,0.12)]">
                    <div className="grid gap-6 lg:grid-cols-[1.12fr_0.88fr]">
                        <div>
                            <div className="mb-4 flex flex-wrap items-center gap-2">
                                <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-200">
                                    {row.agent_name}
                                </span>
                                <span className={`rounded-full px-3 py-1 text-xs font-medium ${status === 'Success'
                                    ? 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
                                    : 'border border-red-500/20 bg-red-500/10 text-red-300'
                                    }`}>
                                    {status}
                                </span>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 text-3xl">
                                    {agentMeta.icon}
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-white">Saved Report</h1>
                                    <p className="mt-2 max-w-3xl text-white/55">
                                        Reopen a previous result, review the original input, and continue from the exact output saved to your workspace.
                                    </p>
                                    <p className="mt-2 text-sm text-cyan-200/80">{agentMeta.subtitle}</p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-300/80">Quick actions</p>
                            <div className="mt-4 space-y-3 text-sm text-white/70">
                                <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
                                    <p className="font-medium text-white">Continue this workflow</p>
                                    <p className="mt-1 text-white/50">Reopen the same agent with fresh details or compare a new case side by side.</p>
                                </div>
                                <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
                                    <p className="font-medium text-white">Saved on</p>
                                    <p className="mt-1 text-white/50">{formatTimestamp(row.timestamp ?? row.created_at)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-5 grid gap-3 md:grid-cols-4">
                        <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/35">Saved on</p>
                            <p className="mt-2 text-sm text-white/80">{formatTimestamp(row.timestamp ?? row.created_at)}</p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/35">Processing time</p>
                            <p className="mt-2 text-sm text-white/80">{formatDuration(meta?.duration_ms)}</p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/35">Source workflow</p>
                            <p className="mt-2 text-sm text-white/80">{row.agent_name}</p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/35">Report ID</p>
                            <p className="mt-2 truncate text-sm text-white/60">{row.id}</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {highlights.length > 0 && (
                        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                            <h2 className="mb-4 text-lg font-semibold text-white">Key Highlights</h2>
                            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                                {highlights.map((item) => (
                                    <div key={item.label} className="rounded-xl border border-white/5 bg-black/20 p-4">
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-300/80">{item.label}</p>
                                        <p className="mt-2 text-sm font-medium text-white">{item.value}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {summary && (
                        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                            <h2 className="mb-3 text-lg font-semibold text-white">Overview</h2>
                            <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/75">{summary}</p>
                        </section>
                    )}

                    {actionNotes.length > 0 && (
                        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                            <h2 className="mb-4 text-lg font-semibold text-white">Recommended Next Steps</h2>
                            <div className="grid gap-3 md:grid-cols-2">
                                {actionNotes.map((note, index) => (
                                    <div key={`${row.id}-note-${index}`} className="rounded-xl border border-cyan-500/10 bg-cyan-500/[0.04] p-4 text-sm leading-relaxed text-white/75">
                                        {note}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                        <h2 className="mb-3 text-lg font-semibold text-white">Original Input</h2>
                        <div className="rounded-xl border border-white/5 bg-black/20 p-4">
                            <pre className="whitespace-pre-wrap break-words text-sm leading-relaxed text-white/75">{inputText}</pre>
                        </div>
                    </section>

                    <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                        <h2 className="mb-4 text-lg font-semibold text-white">Detailed Results</h2>
                        {renderValue(outputData)}
                    </section>
                </div>
            </div>
        </div>
    )
}
