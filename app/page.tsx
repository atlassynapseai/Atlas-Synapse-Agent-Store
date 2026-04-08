import Link from 'next/link'
import { AuthNav } from '@/components/auth/auth-nav'
import { AtlasLogo } from '@/components/brand/atlas-logo'

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

export default function Home() {
  return (
    <div className="page-noise min-h-screen bg-[#0a0a0f]">
      <header className="border-b border-white/10 px-8 py-5 flex items-center justify-between backdrop-blur-sm">
        <AtlasLogo href="/agents" />
        <nav className="flex items-center gap-4 text-sm text-white/50">
          <Link href="/agents" className="transition-colors hover:text-white text-white/90">Agent Store</Link>
          <Link href="https://www.atlassynapseai.com/#solutions" className="transition-colors hover:text-white">Docs</Link>
          <Link href="https://www.atlassynapseai.com/#pricing" className="transition-colors hover:text-white">Pricing</Link>
          <AuthNav />
        </nav>
      </header>

      <div className="hero-spotlight px-8 py-16 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 text-blue-400 text-sm mb-6 shadow-[0_0_30px_rgba(59,130,246,0.12)]">
          <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
          AI Agent Platform — Powered by Atlas Synapse
        </div>
        <h1 className="text-5xl font-bold text-white mb-6 leading-tight drop-shadow-[0_0_24px_rgba(59,130,246,0.12)]">
          AI Agents Built for<br />
          <span className="bg-gradient-to-r from-blue-300 via-blue-400 to-cyan-300 bg-clip-text text-transparent">Real Business Workflows</span>
        </h1>
        <p className="text-white/50 text-xl max-w-2xl mx-auto mb-6">
          Deploy specialized AI agents that automate your most complex business tasks.
          No setup required — just describe your problem and get results.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/agents/auth?mode=signup"
            className="glow-button inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-blue-500"
          >
            Create account →
          </Link>
          <Link
            href="/agents/auth"
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-5 py-2.5 text-sm text-white/80 transition-all hover:-translate-y-0.5 hover:bg-white/5"
          >
            Log in
          </Link>
        </div>
      </div>

      <div className="px-8 pb-16 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-white font-semibold text-xl">Agent Store</h2>
          <span className="text-white/30 text-sm">{agents.length} agents available</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className={`float-card relative border rounded-xl p-6 transition-all duration-200 ${agent.status === 'live'
                  ? 'border-blue-500/40 bg-blue-500/5 hover:border-blue-500/70 hover:bg-blue-500/10 hover:shadow-[0_0_30px_rgba(59,130,246,0.12)] cursor-pointer'
                  : 'border-white/5 bg-white/[0.02] opacity-60'
                }`}
            >
              {agent.status === 'live' && (
                <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 rounded-full px-2.5 py-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                  <span className="text-green-400 text-xs">Live</span>
                </div>
              )}
              {agent.status === 'coming-soon' && (
                <div className="absolute top-4 right-4 bg-white/5 border border-white/10 rounded-full px-2.5 py-1">
                  <span className="text-white/30 text-xs">Soon</span>
                </div>
              )}
              <div className="text-3xl mb-4">{agent.icon}</div>
              <div className="text-blue-400/70 text-xs font-medium uppercase tracking-wider mb-2">{agent.category}</div>
              <h3 className="text-white font-semibold mb-2">{agent.name}</h3>
              <p className="text-white/40 text-sm leading-relaxed mb-5">{agent.description}</p>
              {agent.status === 'live' ? (
                <Link
                  href={`/agents/${agent.id}`}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded-lg transition-colors"
                >
                  Launch Agent →
                </Link>
              ) : (
                <span className="text-white/20 text-sm">Coming soon</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}