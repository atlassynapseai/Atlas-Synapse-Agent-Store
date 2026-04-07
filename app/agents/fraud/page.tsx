'use client'

import { useState } from 'react'
import Link from 'next/link'

type Anomaly = {
  severity: 'Critical' | 'High' | 'Medium' | 'Low'
  type: string
  description: string
  transaction_ref: string | null
  amount: string | null
}

type Investigation = {
  priority: 'Immediate' | 'Short-term' | 'Long-term'
  action: string
  rationale: string
}

type FraudReport = {
  executive_summary: string
  overall_risk_score: number
  risk_level: 'Critical' | 'High' | 'Medium' | 'Low'
  risk_rationale: string
  affected_accounts: string[]
  total_value_at_risk: string | null
  anomalies: Anomaly[]
  fraud_indicators: string[]
  investigation_recommendations: Investigation[]
  suggested_controls: string[]
  error?: string
}

const RISK_CONFIG = {
  Critical: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', dot: 'bg-red-400' },
  High: { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', dot: 'bg-orange-400' },
  Medium: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', dot: 'bg-yellow-400' },
  Low: { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', dot: 'bg-blue-400' },
}

const PRIORITY_CONFIG = {
  Immediate: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  'Short-term': { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
  'Long-term': { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
}

const EXAMPLE = `ACCOUNT TRANSACTION LOG — Account: 4892-7741-XXXX-3301
Customer: Robert Harrington | Account Type: Business Checking

Date/Time (UTC)       | TXN ID       | Type       | Amount      | Merchant                        | Location           | Status
----------------------|--------------|------------|-------------|----------------------------------|--------------------|---------
2025-03-14 08:12:04   | TXN-00291847 | Purchase   | $12.50      | Starbucks #4421                  | Chicago, IL        | Approved
2025-03-14 08:14:33   | TXN-00291901 | Purchase   | $4,999.00   | Electronics Plus                 | Chicago, IL        | Approved
2025-03-14 08:15:02   | TXN-00291912 | Purchase   | $4,850.00   | Electronics Plus                 | Chicago, IL        | Approved
2025-03-14 08:16:18   | TXN-00291944 | Purchase   | $1.00       | Amazon Marketplace               | Online             | Approved
2025-03-14 08:16:45   | TXN-00291956 | Purchase   | $1.00       | Google Play                      | Online             | Approved
2025-03-14 08:17:03   | TXN-00291967 | Purchase   | $1.00       | Spotify                          | Online             | Approved
2025-03-14 08:31:22   | TXN-00292188 | Wire Out   | $23,400.00  | Beneficiary: NOVEX TRADE LTD     | Lagos, Nigeria     | Approved
2025-03-14 09:45:11   | TXN-00292901 | Purchase   | $3,200.00   | Luxury Timepieces                | Miami, FL          | Approved
2025-03-14 11:02:54   | TXN-00293440 | ATM        | $1,500.00   | ATM Withdrawal                   | Miami, FL          | Approved

Account History Context:
- Average monthly spend: $3,200
- No previous international transactions
- No previous wire transfers
- Customer is based in Chicago; device used in Chicago (last login 2025-03-13)
- Two failed login attempts at 07:58:41 UTC before successful login at 08:09:12`

export default function FraudPage() {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState<FraudReport | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function analyze() {
    if (!input.trim()) return
    setLoading(true)
    setReport(null)
    setError(null)
    try {
      const res = await fetch('/api/detect-fraud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      })
      const data: FraudReport = await res.json()
      if (data.error) setError(data.error)
      else setReport(data)
    } catch {
      setError('Network error — could not reach the detection service.')
    } finally {
      setLoading(false)
    }
  }

  const risk = report ? RISK_CONFIG[report.risk_level] : null

  return (
    <div className="min-h-screen bg-[#0a0a0f] font-[family-name:var(--font-geist-sans)]">
      <header className="border-b border-white/10 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-sm font-bold text-white">A</div>
            <span className="text-white font-semibold text-lg tracking-tight">Atlas Synapse</span>
          </Link>
          <span className="text-white/20 mx-1">/</span>
          <span className="text-white/50 text-sm">Fraud Detection Agent</span>
        </div>
        <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1.5">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
          <span className="text-green-400 text-xs font-medium">Live</span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-8 py-12">
        <div className="mb-10">
          <div className="text-4xl mb-4">🔍</div>
          <h1 className="text-3xl font-bold text-white mb-3">Fraud Detection Agent</h1>
          <p className="text-white/50 text-lg max-w-2xl">
            Paste transaction data or account activity. The agent identifies anomalies, assigns a risk score, and recommends investigation actions.
          </p>
        </div>

        <div className="border border-white/10 rounded-2xl bg-white/[0.02] p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <label className="text-white/60 text-sm font-medium">Transaction Data or Activity Log</label>
            <button onClick={() => setInput(EXAMPLE)} className="text-blue-400/70 text-xs hover:text-blue-400 transition-colors">
              Load example
            </button>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste transaction records, account activity logs, payment data, or a financial incident report..."
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
              ) : 'Detect Fraud →'}
            </button>
          </div>
        </div>

        {error && (
          <div className="border border-red-500/30 bg-red-500/5 rounded-2xl p-6 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-red-400 text-lg">⚠</span>
              <div>
                <p className="text-red-400 font-medium mb-1">Detection Error</p>
                <p className="text-white/50 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {report && risk && (
          <div className="space-y-4">
            {/* Risk banner */}
            <div className={`border ${risk.border} ${risk.bg} rounded-2xl p-6 flex items-center gap-8`}>
              <div className="shrink-0 text-center">
                <div className={`text-6xl font-bold ${risk.color} leading-none`}>{report.overall_risk_score}</div>
                <div className="text-white/30 text-xs mt-1">risk score</div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${risk.dot}`}></span>
                  <span className={`text-sm font-semibold ${risk.color}`}>{report.risk_level} Risk</span>
                  {report.total_value_at_risk && (
                    <>
                      <span className="text-white/20">·</span>
                      <span className="text-white/50 text-sm">{report.total_value_at_risk} at risk</span>
                    </>
                  )}
                </div>
                <p className="text-white/80 text-sm leading-relaxed mb-1">{report.executive_summary}</p>
                <p className={`text-xs ${risk.color} opacity-70`}>{report.risk_rationale}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Affected accounts */}
              <div className="border border-white/10 bg-white/[0.02] rounded-2xl p-6">
                <h3 className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-3">Affected Accounts</h3>
                <div className="space-y-2">
                  {report.affected_accounts.map((acc, i) => (
                    <div key={i} className="bg-black/20 border border-white/5 rounded-lg px-3 py-2 text-white/70 text-sm font-[family-name:var(--font-geist-mono)]">
                      {acc}
                    </div>
                  ))}
                </div>
              </div>

              {/* Fraud indicators */}
              <div className="border border-white/10 bg-white/[0.02] rounded-2xl p-6">
                <h3 className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-3">Fraud Indicators</h3>
                <ul className="space-y-2">
                  {report.fraud_indicators.map((ind, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-white/60">
                      <span className="text-orange-400/70 shrink-0 mt-0.5">!</span>{ind}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Anomalies */}
            {report.anomalies.length > 0 && (
              <div className="border border-white/10 bg-white/[0.02] rounded-2xl p-6">
                <h3 className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-4">Flagged Anomalies ({report.anomalies.length})</h3>
                <div className="space-y-3">
                  {report.anomalies.map((anomaly, i) => {
                    const cfg = RISK_CONFIG[anomaly.severity]
                    return (
                      <div key={i} className={`border ${cfg.border} ${cfg.bg} rounded-xl p-4`}>
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} shrink-0`}></span>
                            <span className={`text-xs font-semibold ${cfg.color}`}>{anomaly.severity}</span>
                            <span className="text-white/40 text-xs">· {anomaly.type}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {anomaly.amount && <span className="text-white/50 text-xs font-[family-name:var(--font-geist-mono)]">{anomaly.amount}</span>}
                            {anomaly.transaction_ref && <span className="text-white/20 text-xs font-[family-name:var(--font-geist-mono)]">{anomaly.transaction_ref}</span>}
                          </div>
                        </div>
                        <p className="text-white/70 text-sm leading-relaxed">{anomaly.description}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Investigation recommendations */}
            <div className="border border-white/10 bg-white/[0.02] rounded-2xl p-6">
              <h3 className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-4">Investigation Recommendations</h3>
              <div className="space-y-3">
                {report.investigation_recommendations.map((rec, i) => {
                  const pCfg = PRIORITY_CONFIG[rec.priority] ?? PRIORITY_CONFIG['Long-term']
                  return (
                    <div key={i} className="flex gap-4 border border-white/5 bg-black/20 rounded-xl p-4">
                      <span className={`shrink-0 mt-0.5 inline-flex items-center ${pCfg.bg} border ${pCfg.border} rounded-full px-2.5 py-0.5 text-xs font-medium ${pCfg.color} h-fit`}>
                        {rec.priority}
                      </span>
                      <div className="min-w-0">
                        <p className="text-white/80 text-sm font-medium mb-1">{rec.action}</p>
                        <p className="text-white/40 text-sm leading-relaxed">{rec.rationale}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Suggested controls */}
            {report.suggested_controls.length > 0 && (
              <div className="border border-white/10 bg-white/[0.02] rounded-2xl p-6">
                <h3 className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-3">Suggested Preventive Controls</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {report.suggested_controls.map((ctrl, i) => (
                    <div key={i} className="flex items-start gap-2 bg-black/20 border border-white/5 rounded-lg px-3 py-2 text-xs text-white/50">
                      <span className="text-blue-400/50 shrink-0">→</span>{ctrl}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-white/20 text-xs text-center pb-4">Analysis generated by Claude · Atlas Synapse Fraud Detection Agent</p>
          </div>
        )}
      </div>
    </div>
  )
}
