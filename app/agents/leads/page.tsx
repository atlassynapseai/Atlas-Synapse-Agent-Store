'use client'

import { useState } from 'react'
import Link from 'next/link'

type FitBreakdown = { budget_fit: number; authority_fit: number; need_fit: number; timeline_fit: number }

type LeadReport = {
  prospect_name: string
  company: string
  score: number
  priority_tier: 'Hot' | 'Warm' | 'Cold'
  tier_rationale: string
  strengths: string[]
  concerns: string[]
  fit_breakdown: FitBreakdown
  recommended_next_action: string
  recommended_timeline: string
  talking_points: string[]
  risk_factors: string[]
  error?: string
}

const TIER_CONFIG = {
  Hot: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', dot: 'bg-red-400', scoreColor: 'text-red-400' },
  Warm: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', dot: 'bg-yellow-400', scoreColor: 'text-yellow-400' },
  Cold: { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', dot: 'bg-blue-400', scoreColor: 'text-blue-400' },
}

const EXAMPLE = `Prospect Profile
----------------
Name: Sarah Chen
Title: VP of Operations
Company: Meridian Logistics Group
Company Size: 850 employees
Industry: Supply Chain & Logistics
Revenue: ~$120M ARR
Location: Chicago, IL

Engagement History:
- Downloaded our "AI in Logistics" whitepaper 3 weeks ago
- Attended our live webinar on "Automating Warehouse Operations" last week
- Opened 4 of our last 5 email campaigns
- Visited pricing page twice in the last 10 days
- Submitted a contact form asking for an enterprise demo

Pain Points (from form submission):
"We're manually processing 2,000+ shipment records per day. Our team is burning out and we're making costly errors. We evaluated two other vendors last quarter but neither could handle our EDI integration requirements."

Budget: Has approved budget for Q1 — mentioned $80-120K annual range is "workable"
Timeline: Wants to have something in place before peak season in April
Decision Authority: She confirmed she's the economic buyer, but will need sign-off from CTO for technical review`

function ScoreBar({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-white/40 text-xs">{label}</span>
        <span className="text-white/60 text-xs font-medium">{value}/10</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-blue-500 transition-all"
          style={{ width: `${value * 10}%` }}
        />
      </div>
    </div>
  )
}

export default function LeadsPage() {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState<LeadReport | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function analyze() {
    if (!input.trim()) return
    setLoading(true)
    setReport(null)
    setError(null)
    try {
      const res = await fetch('/api/score-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      })
      const data: LeadReport = await res.json()
      if (data.error) setError(data.error)
      else setReport(data)
    } catch {
      setError('Network error — could not reach the scoring service.')
    } finally {
      setLoading(false)
    }
  }

  const tier = report ? TIER_CONFIG[report.priority_tier] ?? TIER_CONFIG.Cold : null

  return (
    <div className="min-h-screen bg-[#0a0a0f] font-[family-name:var(--font-geist-sans)]">
      <header className="border-b border-white/10 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-sm font-bold text-white">A</div>
            <span className="text-white font-semibold text-lg tracking-tight">Atlas Synapse</span>
          </Link>
          <span className="text-white/20 mx-1">/</span>
          <span className="text-white/50 text-sm">Lead Scoring Agent</span>
        </div>
        <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1.5">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
          <span className="text-green-400 text-xs font-medium">Live</span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-8 py-12">
        <div className="mb-10">
          <div className="text-4xl mb-4">🎯</div>
          <h1 className="text-3xl font-bold text-white mb-3">Lead Scoring Agent</h1>
          <p className="text-white/50 text-lg max-w-2xl">
            Paste a prospect profile or CRM record. Get an AI-powered score, priority tier, BANT breakdown, and a concrete next action.
          </p>
        </div>

        <div className="border border-white/10 rounded-2xl bg-white/[0.02] p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <label className="text-white/60 text-sm font-medium">Prospect Information</label>
            <button onClick={() => setInput(EXAMPLE)} className="text-blue-400/70 text-xs hover:text-blue-400 transition-colors">
              Load example
            </button>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste a prospect profile, CRM record, engagement history, or lead summary..."
            rows={12}
            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white/80 placeholder-white/20 text-sm font-[family-name:var(--font-geist-mono)] resize-y focus:outline-none focus:border-blue-500/50 focus:bg-black/40 transition-all"
          />
          <div className="flex items-center justify-between mt-4">
            <span className="text-white/20 text-xs">{input.length} characters</span>
            <button
              onClick={analyze}
              disabled={loading || !input.trim()}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-6 py-2.5 rounded-xl transition-all"
            >
              {loading ? (
                <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>Scoring...</>
              ) : 'Score Lead →'}
            </button>
          </div>
        </div>

        {error && (
          <div className="border border-red-500/30 bg-red-500/5 rounded-2xl p-6 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-red-400 text-lg">⚠</span>
              <div>
                <p className="text-red-400 font-medium mb-1">Scoring Error</p>
                <p className="text-white/50 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {report && tier && (
          <div className="space-y-4">
            {/* Score banner */}
            <div className={`border ${tier.border} ${tier.bg} rounded-2xl p-6 flex items-center gap-8`}>
              <div className="shrink-0 text-center">
                <div className={`text-6xl font-bold ${tier.scoreColor} leading-none`}>{report.score}</div>
                <div className="text-white/30 text-xs mt-1">/ 100</div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${tier.dot}`}></span>
                  <span className={`text-sm font-semibold ${tier.color}`}>{report.priority_tier} Priority</span>
                  <span className="text-white/20 text-sm">·</span>
                  <span className="text-white/60 text-sm">{report.prospect_name}</span>
                  <span className="text-white/20 text-sm">at</span>
                  <span className="text-white/60 text-sm">{report.company}</span>
                </div>
                <p className="text-white/70 text-sm leading-relaxed">{report.tier_rationale}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* BANT breakdown */}
              <div className="border border-white/10 bg-white/[0.02] rounded-2xl p-6">
                <h3 className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-4">BANT Fit Score</h3>
                <div className="space-y-3">
                  <ScoreBar value={report.fit_breakdown.budget_fit} label="Budget" />
                  <ScoreBar value={report.fit_breakdown.authority_fit} label="Authority" />
                  <ScoreBar value={report.fit_breakdown.need_fit} label="Need" />
                  <ScoreBar value={report.fit_breakdown.timeline_fit} label="Timeline" />
                </div>
              </div>

              {/* Next action */}
              <div className="border border-white/10 bg-white/[0.02] rounded-2xl p-6 flex flex-col">
                <h3 className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-3">Recommended Next Action</h3>
                <p className="text-white/80 text-sm leading-relaxed flex-1">{report.recommended_next_action}</p>
                <div className="mt-4 flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-2">
                  <span className="text-blue-400 text-xs">⏱</span>
                  <span className="text-blue-400 text-xs font-medium">{report.recommended_timeline}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Strengths */}
              <div className="border border-white/10 bg-white/[0.02] rounded-2xl p-6">
                <h3 className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-3">Strengths</h3>
                <ul className="space-y-2">
                  {report.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                      <span className="text-green-400 mt-0.5 shrink-0">✓</span>{s}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Concerns */}
              <div className="border border-white/10 bg-white/[0.02] rounded-2xl p-6">
                <h3 className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-3">Concerns & Risks</h3>
                <ul className="space-y-2">
                  {[...report.concerns, ...report.risk_factors].map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                      <span className="text-yellow-400/70 mt-0.5 shrink-0">!</span>{c}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Talking points */}
            {report.talking_points.length > 0 && (
              <div className="border border-white/10 bg-white/[0.02] rounded-2xl p-6">
                <h3 className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-4">Recommended Talking Points</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {report.talking_points.map((tp, i) => (
                    <div key={i} className="flex items-start gap-2 bg-black/20 border border-white/5 rounded-lg px-3 py-2 text-sm text-white/60">
                      <span className="text-blue-400/50 shrink-0">→</span>{tp}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-white/20 text-xs text-center pb-4">Analysis generated by Claude · Atlas Synapse Lead Scoring Agent</p>
          </div>
        )}
      </div>
    </div>
  )
}
