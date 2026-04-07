'use client'

import { useState } from 'react'
import Link from 'next/link'

type Gap = {
  severity: 'Critical' | 'High' | 'Medium' | 'Low'
  gap: string
  regulation: string
  required_change: string
}

type RemediationStep = {
  priority: 'Immediate' | 'Short-term' | 'Long-term'
  action: string
  description: string
  regulation: string
}

type ComplianceReport = {
  executive_summary: string
  document_type: string
  overall_risk_level: 'Critical' | 'High' | 'Medium' | 'Low'
  compliance_score: number
  frameworks_assessed: string[]
  compliant_areas: string[]
  compliance_gaps: Gap[]
  remediation_steps: RemediationStep[]
  estimated_effort: string
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

const EXAMPLE = `DATA PROTECTION AND PRIVACY POLICY
Version 1.2 | Last Updated: March 2024

1. PURPOSE
This policy outlines how Nexus Digital Ltd collects, processes, and stores personal data in the course of its business operations.

2. DATA COLLECTION
We collect personal data including names, email addresses, phone numbers, and payment information when users register on our platform. We may also collect browsing behavior and device information through cookies.

3. DATA STORAGE
All customer data is stored on AWS servers located in us-east-1 (Virginia, USA). Data is retained for 7 years following account closure for compliance purposes.

4. DATA SHARING
We share customer data with third-party service providers including Stripe (payments), Mailchimp (marketing), and Salesforce (CRM). We do not sell personal data to third parties.

5. SECURITY MEASURES
We implement SSL encryption for data in transit. Passwords are hashed using bcrypt. Access to production databases is restricted to engineering staff.

6. USER RIGHTS
Users may request access to their data by emailing privacy@nexusdigital.com. We aim to respond within 30 days. Users may also request deletion of their account.

7. COOKIES
We use analytics cookies to improve our service. Users can opt out via browser settings.

8. CONTACT
Data Controller: Nexus Digital Ltd, 45 Innovation Street, London, EC2A 1NT
Privacy Officer: Jane Smith, jane.smith@nexusdigital.com`

export default function CompliancePage() {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState<ComplianceReport | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function analyze() {
    if (!input.trim()) return
    setLoading(true)
    setReport(null)
    setError(null)
    try {
      const res = await fetch('/api/check-compliance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      })
      const data: ComplianceReport = await res.json()
      if (data.error) setError(data.error)
      else setReport(data)
    } catch {
      setError('Network error — could not reach the compliance service.')
    } finally {
      setLoading(false)
    }
  }

  const risk = report ? RISK_CONFIG[report.overall_risk_level] : null

  return (
    <div className="min-h-screen bg-[#0a0a0f] font-[family-name:var(--font-geist-sans)]">
      <header className="border-b border-white/10 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-sm font-bold text-white">A</div>
            <span className="text-white font-semibold text-lg tracking-tight">Atlas Synapse</span>
          </Link>
          <span className="text-white/20 mx-1">/</span>
          <span className="text-white/50 text-sm">Regulatory Compliance Agent</span>
        </div>
        <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1.5">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
          <span className="text-green-400 text-xs font-medium">Live</span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-8 py-12">
        <div className="mb-10">
          <div className="text-4xl mb-4">⚖️</div>
          <h1 className="text-3xl font-bold text-white mb-3">Regulatory Compliance Agent</h1>
          <p className="text-white/50 text-lg max-w-2xl">
            Paste a policy or procedure. The agent assesses it against GDPR, ISO 27001, SOC 2, HIPAA, and other frameworks — returning gaps, risk level, and required changes.
          </p>
        </div>

        <div className="border border-white/10 rounded-2xl bg-white/[0.02] p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <label className="text-white/60 text-sm font-medium">Policy or Procedure Document</label>
            <button onClick={() => setInput(EXAMPLE)} className="text-blue-400/70 text-xs hover:text-blue-400 transition-colors">
              Load example
            </button>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your data privacy policy, security procedure, compliance document, or internal policy here..."
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
                <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>Assessing...</>
              ) : 'Check Compliance →'}
            </button>
          </div>
        </div>

        {error && (
          <div className="border border-red-500/30 bg-red-500/5 rounded-2xl p-6 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-red-400 text-lg">⚠</span>
              <div>
                <p className="text-red-400 font-medium mb-1">Assessment Error</p>
                <p className="text-white/50 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {report && risk && (
          <div className="space-y-4">
            {/* Summary banner */}
            <div className={`border ${risk.border} ${risk.bg} rounded-2xl p-6`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${risk.dot}`}></span>
                  <span className={`text-xs font-semibold uppercase tracking-widest ${risk.color}`}>
                    {report.overall_risk_level} Risk · {report.document_type}
                  </span>
                </div>
                <div className="text-right">
                  <div className={`text-3xl font-bold ${risk.color}`}>{report.compliance_score}</div>
                  <div className="text-white/30 text-xs">compliance score</div>
                </div>
              </div>
              <p className="text-white/80 text-sm leading-relaxed mb-3">{report.executive_summary}</p>
              <div className="flex flex-wrap gap-2">
                {report.frameworks_assessed.map((fw, i) => (
                  <span key={i} className="bg-white/5 border border-white/10 rounded-full px-3 py-1 text-white/50 text-xs">{fw}</span>
                ))}
              </div>
            </div>

            {/* Score bar */}
            <div className="border border-white/10 bg-white/[0.02] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white/40 text-xs font-semibold uppercase tracking-widest">Compliance Score</h3>
                <span className="text-white/30 text-xs">Estimated Effort: {report.estimated_effort}</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    report.compliance_score >= 80 ? 'bg-green-500' :
                    report.compliance_score >= 60 ? 'bg-yellow-500' :
                    report.compliance_score >= 40 ? 'bg-orange-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${report.compliance_score}%` }}
                />
              </div>
              {report.compliant_areas.length > 0 && (
                <div className="mt-4">
                  <p className="text-white/30 text-xs mb-2">Areas already compliant:</p>
                  <div className="flex flex-wrap gap-2">
                    {report.compliant_areas.map((area, i) => (
                      <span key={i} className="flex items-center gap-1.5 bg-green-500/5 border border-green-500/15 rounded-lg px-2.5 py-1 text-green-400/70 text-xs">
                        <span>✓</span>{area}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Gaps */}
            {report.compliance_gaps.length > 0 && (
              <div className="border border-white/10 bg-white/[0.02] rounded-2xl p-6">
                <h3 className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-4">Compliance Gaps ({report.compliance_gaps.length})</h3>
                <div className="space-y-3">
                  {report.compliance_gaps.map((gap, i) => {
                    const cfg = RISK_CONFIG[gap.severity]
                    return (
                      <div key={i} className={`border ${cfg.border} ${cfg.bg} rounded-xl p-4`}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
                          <span className={`text-xs font-semibold ${cfg.color}`}>{gap.severity}</span>
                          <span className="text-white/20 text-xs font-[family-name:var(--font-geist-mono)]">· {gap.regulation}</span>
                        </div>
                        <p className="text-white/70 text-sm mb-2">{gap.gap}</p>
                        <p className="text-white/40 text-xs leading-relaxed">Required: {gap.required_change}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Remediation */}
            <div className="border border-white/10 bg-white/[0.02] rounded-2xl p-6">
              <h3 className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-4">Remediation Plan</h3>
              <div className="space-y-3">
                {report.remediation_steps.map((step, i) => {
                  const pCfg = PRIORITY_CONFIG[step.priority] ?? PRIORITY_CONFIG['Long-term']
                  return (
                    <div key={i} className="flex gap-4 border border-white/5 bg-black/20 rounded-xl p-4">
                      <span className={`shrink-0 mt-0.5 inline-flex items-center ${pCfg.bg} border ${pCfg.border} rounded-full px-2.5 py-0.5 text-xs font-medium ${pCfg.color} h-fit`}>
                        {step.priority}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-white/80 text-sm font-medium">{step.action}</p>
                          <span className="text-white/20 text-xs font-[family-name:var(--font-geist-mono)]">{step.regulation}</span>
                        </div>
                        <p className="text-white/40 text-sm leading-relaxed">{step.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <p className="text-white/20 text-xs text-center pb-4">Analysis generated by Claude · Atlas Synapse Regulatory Compliance Agent</p>
          </div>
        )}
      </div>
    </div>
  )
}
