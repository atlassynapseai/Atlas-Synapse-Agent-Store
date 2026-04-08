import Link from 'next/link'
import { AuthNav } from '@/components/auth/auth-nav'
import { AtlasLogo } from '@/components/brand/atlas-logo'
import { Reveal } from '@/components/ui/reveal'

const agents = [
  {
    id: 'cybersecurity',
    name: 'Cybersecurity Threat Agent',
    description: 'Paste an incident report or system log. Get a full structured threat analysis, severity rating, and remediation steps instantly.',
    category: 'IT & Cybersecurity',
    icon: '🛡️',
    status: 'live',
  },
  {
    id: 'contract',
    name: 'Contract Analysis Agent',
    description: 'Upload or paste a contract. AI extracts key clauses, flags risks, and summarizes obligations in plain English.',
    category: 'Legal & Compliance',
    icon: '📄',
    status: 'live',
  },
  {
    id: 'leads',
    name: 'Lead Scoring Agent',
    description: 'Input prospect data and get AI-powered lead scores, priority rankings, and recommended next actions.',
    category: 'Sales',
    icon: '🎯',
    status: 'live',
  },
  {
    id: 'compliance',
    name: 'Regulatory Compliance Agent',
    description: 'Monitor regulatory changes and check your policies for compliance gaps across multiple jurisdictions.',
    category: 'Legal & Compliance',
    icon: '⚖️',
    status: 'live',
  },
  {
    id: 'hr',
    name: 'Recruitment Screening Agent',
    description: 'Paste job descriptions and candidate profiles. Get ranked shortlists with reasoning in seconds.',
    category: 'Human Resources',
    icon: '👥',
    status: 'live',
  },
  {
    id: 'fraud',
    name: 'Fraud Detection Agent',
    description: 'Analyze transaction patterns and flag anomalies with AI-powered risk scoring and investigation recommendations.',
    category: 'Financial',
    icon: '🔍',
    status: 'live',
  },
]

const highlights = [
  {
    value: '6 live agents',
    label: 'Workflow coverage',
    description: 'Security, contracts, compliance, recruiting, fraud, and revenue workflows.',
  },
  {
    value: 'JSON-first outputs',
    label: 'Reliable structure',
    description: 'Clear recommendations, rationale, priorities, and next actions every run.',
  },
  {
    value: 'Auth + logging',
    label: 'Production controls',
    description: 'Protected execution backed by Supabase sessions and audit-friendly run history.',
  },
]

export default function Home() {
  return (
    <div className="page-noise min-h-screen bg-[#0a0a0f]">
      <header className="relative z-20 border-b border-white/10 px-6 py-5 backdrop-blur-md md:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <AtlasLogo href="/agents" />
          <nav className="flex items-center gap-3 text-sm text-white/50 md:gap-4">
            <Link href="/agents" className="interactive-link text-white/90">Agent Store</Link>
            <Link href="https://www.atlassynapseai.com/#solutions" className="interactive-link hidden sm:inline-flex">Docs</Link>
            <Link href="https://www.atlassynapseai.com/#pricing" className="interactive-link hidden sm:inline-flex">Pricing</Link>
            <AuthNav />
          </nav>
        </div>
      </header>

      <main>
        <Reveal className="hero-spotlight mx-auto max-w-6xl px-6 py-10 md:px-8 md:py-12" y={22}>
          <section className="grid items-center gap-8 lg:grid-cols-[1.08fr_0.92fr]">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5 text-sm text-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.12)]">
                <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse"></span>
                Premium AI Agent Platform — Powered by Atlas Synapse
              </div>

              <h1 className="mb-6 text-4xl font-bold leading-tight text-white drop-shadow-[0_0_24px_rgba(59,130,246,0.12)] md:text-5xl">
                AI Agents Built for{' '}
                <span className="bg-gradient-to-r from-blue-300 via-blue-400 to-cyan-300 bg-clip-text text-transparent">
                  Real Business Workflows
                </span>
              </h1>

              <p className="mb-6 max-w-2xl text-lg text-white/55 md:text-xl">
                Launch specialized agents for security, legal, recruiting, fraud, and go-to-market work — with a richer product feel, protected access, and structured results your team can trust.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="#agents"
                  className="glow-button pressable inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-blue-500"
                >
                  Explore agents ↓
                </Link>
                <Link
                  href="/agents/auth?mode=signup"
                  className="pressable inline-flex items-center gap-2 rounded-lg border border-white/10 px-5 py-2.5 text-sm text-white/80 transition-all hover:-translate-y-0.5 hover:bg-white/5"
                >
                  Create account
                </Link>
              </div>
            </div>

            <div className="parallax-panel spotlight-panel rounded-[28px] border border-cyan-500/20 bg-[linear-gradient(180deg,rgba(7,17,40,0.95)_0%,rgba(4,10,24,0.98)_100%)] p-5 shadow-[0_0_60px_rgba(37,99,235,0.18)]">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">Live workflow preview</p>
                  <p className="mt-1 text-sm text-white/50">Premium structured outputs in seconds</p>
                </div>
                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] text-emerald-300">Online</span>
              </div>

              <div className="space-y-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="mb-1 text-xs uppercase tracking-[0.22em] text-white/35">Cybersecurity</p>
                  <p className="text-sm text-white/80">Incident report → severity, IoCs, remediation plan</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="mb-1 text-xs uppercase tracking-[0.22em] text-white/35">Contract review</p>
                  <p className="text-sm text-white/80">Clauses, risks, obligations, and negotiation flags</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="mb-1 text-xs uppercase tracking-[0.22em] text-white/35">Lead scoring</p>
                  <p className="text-sm text-white/80">Priority score, fit reasoning, and next-best-action</p>
                </div>
              </div>
            </div>
          </section>
        </Reveal>

        <Reveal className="mx-auto max-w-6xl px-6 pb-5 md:px-8" delay={0.04}>
          <section className="grid gap-3 md:grid-cols-3">
            {highlights.map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm font-medium text-cyan-300">{item.value}</p>
                <h2 className="mt-1 text-base font-semibold text-white">{item.label}</h2>
                <p className="mt-1 text-sm leading-relaxed text-white/50">{item.description}</p>
              </div>
            ))}
          </section>
        </Reveal>

        <Reveal className="mx-auto max-w-6xl px-6 pb-14 md:px-8" delay={0.08}>
          <section id="agents">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Agent Store</h2>
              <span className="text-sm text-white/30">{agents.length} agents available</span>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  className={`float-card interactive-card spotlight-panel relative rounded-xl border p-6 transition-all duration-200 ${agent.status === 'live'
                    ? 'cursor-pointer border-blue-500/40 bg-blue-500/5 hover:border-blue-500/70 hover:bg-blue-500/10 hover:shadow-[0_0_30px_rgba(59,130,246,0.12)]'
                    : 'border-white/5 bg-white/[0.02] opacity-60'
                    }`}
                >
                  <div className="mb-5 flex items-start justify-between gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-2xl">
                      {agent.icon}
                    </div>

                    {agent.status === 'live' && (
                      <div className="inline-flex items-center gap-1.5 rounded-full border border-green-500/20 bg-green-500/10 px-2.5 py-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse"></span>
                        <span className="text-xs text-green-400">Live</span>
                      </div>
                    )}
                  </div>

                  <div className="mb-2 text-xs font-medium uppercase tracking-wider text-blue-400/70">{agent.category}</div>
                  <h3 className="mb-2 font-semibold text-white">{agent.name}</h3>
                  <p className="mb-5 text-sm leading-relaxed text-white/40">{agent.description}</p>

                  <Link
                    href={`/agents/${agent.id}`}
                    className="pressable inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-500"
                  >
                    Launch Agent →
                  </Link>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        <Reveal className="mx-auto max-w-5xl px-6 pb-16 md:px-8" delay={0.14}>
          <section className="parallax-panel spotlight-panel rounded-[30px] border border-cyan-500/20 bg-[linear-gradient(180deg,rgba(10,18,44,0.95)_0%,rgba(4,10,24,0.98)_100%)] p-8 text-center shadow-[0_0_60px_rgba(37,99,235,0.18)]">
            <p className="text-sm font-medium text-cyan-300">Start building with Atlas Synapse</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Secure, fast, and ready for real business teams.</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-white/55 md:text-base">
              Create an account to unlock the full agent experience, keep runs logged to your workspace, and move from manual review to guided action faster.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/agents/auth?mode=signup"
                className="glow-button pressable inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-blue-500"
              >
                Create account →
              </Link>
              <Link
                href="https://www.atlassynapseai.com/contact"
                className="pressable inline-flex items-center gap-2 rounded-lg border border-white/10 px-5 py-2.5 text-sm text-white/80 transition-all hover:-translate-y-0.5 hover:bg-white/5"
              >
                Talk to sales
              </Link>
            </div>
          </section>
        </Reveal>
      </main>
    </div>
  )
}