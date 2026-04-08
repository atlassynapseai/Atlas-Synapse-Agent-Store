'use client'

import { useState } from 'react'
import { AuthNav } from '@/components/auth/auth-nav'
import { AtlasLogo } from '@/components/brand/atlas-logo'

type Candidate = {
  rank: number
  name: string
  overall_score: number
  tier: 'Strong Fit' | 'Good Fit' | 'Potential Fit' | 'Not Recommended'
  strengths: string[]
  gaps: string[]
  reasoning: string
  recommended_action: string
}

type HRReport = {
  role: string
  total_candidates_reviewed: number
  shortlisted_count: number
  ranked_candidates: Candidate[]
  hiring_recommendation: string
  key_differentiators: string[]
  suggested_interview_questions: string[]
  error?: string
}

const TIER_CONFIG = {
  'Strong Fit': { color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/25', badge: 'bg-green-500/10 border-green-500/20 text-green-400' },
  'Good Fit': { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/25', badge: 'bg-blue-500/10 border-blue-500/20 text-blue-400' },
  'Potential Fit': { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/25', badge: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' },
  'Not Recommended': { color: 'text-white/30', bg: 'bg-white/[0.02]', border: 'border-white/5', badge: 'bg-white/5 border-white/10 text-white/30' },
}

const EXAMPLE = `JOB DESCRIPTION
Position: Senior Full Stack Engineer
Location: Remote (UK/EU)
Salary: £80,000 – £110,000
Experience: 5+ years

Requirements:
- 5+ years of full-stack development experience
- Strong proficiency in React, TypeScript, and Node.js
- Experience with PostgreSQL and Redis
- Familiarity with AWS or GCP cloud infrastructure
- Experience with CI/CD pipelines (GitHub Actions, CircleCI)
- Excellent communication skills and ability to work autonomously
- Experience leading or mentoring junior engineers is a plus
- Prior startup experience preferred

---

CANDIDATE 1: Marcus Webb
Experience: 7 years
Current Role: Senior Engineer at Monzo (fintech, 800 employees)
Skills: React, TypeScript, Node.js, Go, PostgreSQL, AWS, Kubernetes
Education: BSc Computer Science, University of Edinburgh
Notes: Led a team of 4 engineers. Shipped a real-time payment notification system handling 500K events/day. Strong GitHub portfolio. Asking £105,000. Available in 4 weeks.

---

CANDIDATE 2: Priya Nair
Experience: 4 years
Current Role: Mid-level Frontend Developer at a digital agency
Skills: React, Vue.js, JavaScript (no TypeScript), Figma
Education: Self-taught, completed a bootcamp in 2020
Notes: Excellent frontend work but limited backend experience. No cloud infrastructure exposure. Portfolio shows strong UI/UX skills. Asking £72,000. Available immediately.

---

CANDIDATE 3: Jordan Blake
Experience: 6 years
Current Role: Full Stack Engineer at a Series B SaaS startup (remote)
Skills: React, TypeScript, Python, Django, PostgreSQL, Redis, GCP, GitHub Actions
Education: MEng Software Engineering, Imperial College London
Notes: Worked in a 3-person eng team, very autonomous. Built the company's entire data pipeline from scratch. References say outstanding problem-solver. Asking £98,000. 2 month notice period.`

export default function HRPage() {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState<HRReport | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function analyze() {
    if (!input.trim()) return
    setLoading(true)
    setReport(null)
    setError(null)
    try {
      const res = await fetch('/api/screen-candidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      })
      const data: HRReport = await res.json()
      if (data.error) setError(data.error)
      else setReport(data)
    } catch {
      setError('Network error — could not reach the screening service.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] font-[family-name:var(--font-geist-sans)]">
      <header className="border-b border-white/10 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AtlasLogo href="/agents" />
          <span className="text-white/20 mx-1">/</span>
          <span className="text-white/50 text-sm">Recruitment Screening Agent</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1.5">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-green-400 text-xs font-medium">Live</span>
          </div>
          <AuthNav />
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-8 py-12">
        <div className="mb-10">
          <div className="text-4xl mb-4">👥</div>
          <h1 className="text-3xl font-bold text-white mb-3">Recruitment Screening Agent</h1>
          <p className="text-white/50 text-lg max-w-2xl">
            Paste a job description followed by candidate profiles. Get a ranked shortlist with scores, fit analysis, and suggested interview questions.
          </p>
        </div>

        <div className="border border-white/10 rounded-2xl bg-white/[0.02] p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <label className="text-white/60 text-sm font-medium">Job Description + Candidate Profiles</label>
            <button onClick={() => setInput(EXAMPLE)} className="text-blue-400/70 text-xs hover:text-blue-400 transition-colors">
              Load example
            </button>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste the job description first, then each candidate profile separated by a line break. The more detail you provide, the more accurate the screening."
            rows={14}
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
                <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>Screening...</>
              ) : 'Screen Candidates →'}
            </button>
          </div>
        </div>

        {error && (
          <div className="border border-red-500/30 bg-red-500/5 rounded-2xl p-6 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-red-400 text-lg">⚠</span>
              <div>
                <p className="text-red-400 font-medium mb-1">Screening Error</p>
                <p className="text-white/50 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {report && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="border border-blue-500/20 bg-blue-500/5 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-blue-400/70 text-xs font-semibold uppercase tracking-widest">{report.role}</span>
                <div className="flex items-center gap-4 text-xs text-white/40">
                  <span>{report.total_candidates_reviewed} reviewed</span>
                  <span className="text-white/20">·</span>
                  <span className="text-blue-400">{report.shortlisted_count} shortlisted</span>
                </div>
              </div>
              <p className="text-white/80 text-sm leading-relaxed">{report.hiring_recommendation}</p>
            </div>

            {/* Ranked candidates */}
            <div className="border border-white/10 bg-white/[0.02] rounded-2xl p-6">
              <h3 className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-4">Ranked Shortlist</h3>
              <div className="space-y-4">
                {report.ranked_candidates.map((candidate) => {
                  const cfg = TIER_CONFIG[candidate.tier] ?? TIER_CONFIG['Not Recommended']
                  return (
                    <div key={candidate.rank} className={`border ${cfg.border} ${cfg.bg} rounded-xl p-5`}>
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 text-sm font-semibold shrink-0">
                            {candidate.rank}
                          </div>
                          <div>
                            <p className="text-white font-semibold">{candidate.name}</p>
                            <span className={`inline-flex items-center border rounded-full px-2 py-0.5 text-xs font-medium mt-0.5 ${cfg.badge}`}>
                              {candidate.tier}
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className={`text-2xl font-bold ${cfg.color}`}>{candidate.overall_score}</div>
                          <div className="text-white/20 text-xs">/ 100</div>
                        </div>
                      </div>

                      <p className="text-white/60 text-sm leading-relaxed mb-3">{candidate.reasoning}</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        {candidate.strengths.length > 0 && (
                          <div>
                            <p className="text-white/30 text-xs mb-1.5">Strengths</p>
                            <ul className="space-y-1">
                              {candidate.strengths.map((s, i) => (
                                <li key={i} className="flex items-start gap-1.5 text-xs text-white/60">
                                  <span className="text-green-400 shrink-0 mt-0.5">✓</span>{s}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {candidate.gaps.length > 0 && (
                          <div>
                            <p className="text-white/30 text-xs mb-1.5">Gaps</p>
                            <ul className="space-y-1">
                              {candidate.gaps.map((g, i) => (
                                <li key={i} className="flex items-start gap-1.5 text-xs text-white/60">
                                  <span className="text-yellow-400/70 shrink-0 mt-0.5">!</span>{g}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 bg-black/20 border border-white/5 rounded-lg px-3 py-2">
                        <span className="text-blue-400/50 text-xs shrink-0">→</span>
                        <span className="text-white/50 text-xs">{candidate.recommended_action}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Key differentiators */}
            {report.key_differentiators.length > 0 && (
              <div className="border border-white/10 bg-white/[0.02] rounded-2xl p-6">
                <h3 className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-3">Key Differentiating Factors</h3>
                <div className="flex flex-wrap gap-2">
                  {report.key_differentiators.map((d, i) => (
                    <span key={i} className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white/60 text-xs">{d}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Interview questions */}
            {report.suggested_interview_questions.length > 0 && (
              <div className="border border-white/10 bg-white/[0.02] rounded-2xl p-6">
                <h3 className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-4">Suggested Interview Questions</h3>
                <ol className="space-y-2">
                  {report.suggested_interview_questions.map((q, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-white/60">
                      <span className="text-white/20 font-[family-name:var(--font-geist-mono)] shrink-0 w-5">{i + 1}.</span>
                      {q}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <p className="text-white/20 text-xs text-center pb-4">Analysis generated by Claude · Atlas Synapse Recruitment Screening Agent</p>
          </div>
        )}
      </div>
    </div>
  )
}
