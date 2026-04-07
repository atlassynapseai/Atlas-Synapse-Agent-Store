'use client'

import { useState } from 'react'
import Link from 'next/link'

type Party = { name: string; role: string }
type KeyClause = { title: string; summary: string; clause_ref: string | null }
type Obligation = { party: string; obligation: string; deadline: string | null }
type Risk = { severity: 'High' | 'Medium' | 'Low'; description: string; clause_ref: string | null }

type ContractReport = {
  executive_summary: string
  contract_type: string
  parties: Party[]
  effective_date: string | null
  expiry_date: string | null
  auto_renewal: boolean
  auto_renewal_notice_days: string | null
  financial_terms: string
  key_clauses: KeyClause[]
  obligations: Obligation[]
  risks: Risk[]
  termination_conditions: string
  governing_law: string | null
  error?: string
}

const RISK_CONFIG = {
  High: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', dot: 'bg-red-400' },
  Medium: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', dot: 'bg-yellow-400' },
  Low: { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', dot: 'bg-blue-400' },
}

const EXAMPLE = `SOFTWARE AS A SERVICE SUBSCRIPTION AGREEMENT

This Software as a Service Subscription Agreement ("Agreement") is entered into as of January 1, 2025 ("Effective Date") between Acme Corp, a Delaware corporation ("Provider") and Globex Ltd, a UK limited company ("Customer").

1. SUBSCRIPTION TERM
The initial subscription term shall commence on the Effective Date and continue for twelve (12) months ("Initial Term"). Upon expiration, this Agreement shall automatically renew for successive one (1) year periods unless either party provides written notice of non-renewal at least sixty (60) days prior to the end of the then-current term.

2. FEES AND PAYMENT
Customer shall pay Provider a monthly subscription fee of $4,500 USD, due on the first business day of each calendar month. All fees are non-refundable. Provider may increase fees by up to 8% annually with 30 days written notice.

3. DATA PROCESSING
Provider shall process Customer data solely for the purpose of providing the Service. Provider shall implement commercially reasonable security measures. In the event of a data breach affecting Customer data, Provider shall notify Customer within 72 hours of discovery.

4. LIMITATION OF LIABILITY
IN NO EVENT SHALL EITHER PARTY BE LIABLE FOR INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES. PROVIDER'S TOTAL LIABILITY SHALL NOT EXCEED THE FEES PAID IN THE THREE (3) MONTHS PRECEDING THE CLAIM.

5. INTELLECTUAL PROPERTY
Provider retains all rights, title, and interest in the Service. Customer grants Provider a non-exclusive license to use Customer data solely to provide the Service.

6. TERMINATION FOR CAUSE
Either party may terminate this Agreement immediately upon written notice if the other party materially breaches this Agreement and fails to cure such breach within thirty (30) days of written notice.

Governing Law: State of Delaware, United States.`

export default function ContractPage() {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState<ContractReport | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function analyze() {
    if (!input.trim()) return
    setLoading(true)
    setReport(null)
    setError(null)
    try {
      const res = await fetch('/api/analyze-contract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      })
      const data: ContractReport = await res.json()
      if (data.error) setError(data.error)
      else setReport(data)
    } catch {
      setError('Network error — could not reach the analysis service.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] font-[family-name:var(--font-geist-sans)]">
      <header className="border-b border-white/10 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-sm font-bold text-white">A</div>
            <span className="text-white font-semibold text-lg tracking-tight">Atlas Synapse</span>
          </Link>
          <span className="text-white/20 mx-1">/</span>
          <span className="text-white/50 text-sm">Contract Analysis Agent</span>
        </div>
        <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1.5">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
          <span className="text-green-400 text-xs font-medium">Live</span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-8 py-12">
        <div className="mb-10">
          <div className="text-4xl mb-4">📄</div>
          <h1 className="text-3xl font-bold text-white mb-3">Contract Analysis Agent</h1>
          <p className="text-white/50 text-lg max-w-2xl">
            Paste any contract text. The agent extracts key clauses, obligations, risk flags, and critical dates — in seconds.
          </p>
        </div>

        <div className="border border-white/10 rounded-2xl bg-white/[0.02] p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <label className="text-white/60 text-sm font-medium">Contract Text</label>
            <button onClick={() => setInput(EXAMPLE)} className="text-blue-400/70 text-xs hover:text-blue-400 transition-colors">
              Load example
            </button>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your contract, agreement, NDA, or legal document here..."
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
                <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>Analyzing...</>
              ) : 'Analyze Contract →'}
            </button>
          </div>
        </div>

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

        {report && (
          <div className="space-y-4">
            {/* Overview */}
            <div className="border border-blue-500/20 bg-blue-500/5 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-blue-400/70 text-xs font-semibold uppercase tracking-widest">{report.contract_type}</span>
              </div>
              <p className="text-white/80 text-sm leading-relaxed mb-4">{report.executive_summary}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Effective', value: report.effective_date ?? 'Not specified' },
                  { label: 'Expires', value: report.expiry_date ?? 'Not specified' },
                  { label: 'Auto-renewal', value: report.auto_renewal ? `Yes — ${report.auto_renewal_notice_days ?? 'notice required'}` : 'No' },
                  { label: 'Governing Law', value: report.governing_law ?? 'Not specified' },
                ].map((item) => (
                  <div key={item.label} className="bg-black/20 border border-white/5 rounded-xl p-3">
                    <p className="text-white/30 text-xs mb-1">{item.label}</p>
                    <p className="text-white/80 text-xs font-medium">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Parties */}
              <div className="border border-white/10 bg-white/[0.02] rounded-2xl p-6">
                <h3 className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-3">Parties</h3>
                <div className="space-y-2">
                  {report.parties.map((p, i) => (
                    <div key={i} className="flex items-center justify-between bg-black/20 border border-white/5 rounded-lg px-3 py-2">
                      <span className="text-white/70 text-sm">{p.name}</span>
                      <span className="text-white/30 text-xs">{p.role}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Terms */}
              <div className="border border-white/10 bg-white/[0.02] rounded-2xl p-6">
                <h3 className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-3">Financial Terms</h3>
                <p className="text-white/70 text-sm leading-relaxed">{report.financial_terms}</p>
              </div>
            </div>

            {/* Key Clauses */}
            <div className="border border-white/10 bg-white/[0.02] rounded-2xl p-6">
              <h3 className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-4">Key Clauses</h3>
              <div className="space-y-3">
                {report.key_clauses.map((clause, i) => (
                  <div key={i} className="border border-white/5 bg-black/20 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-white/80 text-sm font-medium">{clause.title}</p>
                      {clause.clause_ref && <span className="text-white/20 text-xs font-[family-name:var(--font-geist-mono)]">{clause.clause_ref}</span>}
                    </div>
                    <p className="text-white/50 text-sm leading-relaxed">{clause.summary}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Risks */}
            {report.risks.length > 0 && (
              <div className="border border-white/10 bg-white/[0.02] rounded-2xl p-6">
                <h3 className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-4">Risk Flags</h3>
                <div className="space-y-3">
                  {report.risks.map((risk, i) => {
                    const cfg = RISK_CONFIG[risk.severity]
                    return (
                      <div key={i} className={`border ${cfg.border} ${cfg.bg} rounded-xl p-4`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
                          <span className={`text-xs font-semibold ${cfg.color}`}>{risk.severity} Risk</span>
                          {risk.clause_ref && <span className="text-white/20 text-xs font-[family-name:var(--font-geist-mono)] ml-auto">{risk.clause_ref}</span>}
                        </div>
                        <p className="text-white/70 text-sm leading-relaxed">{risk.description}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Obligations */}
            {report.obligations.length > 0 && (
              <div className="border border-white/10 bg-white/[0.02] rounded-2xl p-6">
                <h3 className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-4">Obligations</h3>
                <div className="space-y-2">
                  {report.obligations.map((ob, i) => (
                    <div key={i} className="flex gap-4 border border-white/5 bg-black/20 rounded-xl p-4">
                      <span className="text-blue-400/60 text-xs font-medium whitespace-nowrap mt-0.5 w-24 shrink-0">{ob.party}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white/70 text-sm">{ob.obligation}</p>
                        {ob.deadline && <p className="text-white/30 text-xs mt-1">Deadline: {ob.deadline}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Termination */}
            <div className="border border-white/10 bg-white/[0.02] rounded-2xl p-6">
              <h3 className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-3">Termination Conditions</h3>
              <p className="text-white/70 text-sm leading-relaxed">{report.termination_conditions}</p>
            </div>

            <p className="text-white/20 text-xs text-center pb-4">Analysis generated by Claude · Atlas Synapse Contract Analysis Agent</p>
          </div>
        )}
      </div>
    </div>
  )
}
