import Link from 'next/link'

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
    <div className="min-h-screen bg-[#0a0a0f]">
      <header className="border-b border-white/10 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-sm font-bold">A</div>
          <span className="text-white font-semibold text-lg tracking-tight">Atlas Synapse</span>
        </div>
        <nav className="flex items-center gap-6 text-sm text-white/50">
          <span className="text-white/90">Agent Store</span>
          <span>Docs</span>
          <span>Pricing</span>
          <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors">
            Get Started
          </button>
        </nav>
      </header>

      <div className="px-8 py-16 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 text-blue-400 text-sm mb-6">
          <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
          AI Agent Platform — Powered by Claude
        </div>
        <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
          AI Agents Built for<br />
          <span className="text-blue-400">Real Business Workflows</span>
        </h1>
        <p className="text-white/50 text-xl max-w-2xl mx-auto">
          Deploy specialized AI agents that automate your most complex business tasks.
          No setup required — just describe your problem and get results.
        </p>
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
              className={`relative border rounded-xl p-6 transition-all duration-200 ${
                agent.status === 'live'
                  ? 'border-blue-500/40 bg-blue-500/5 hover:border-blue-500/70 hover:bg-blue-500/10 cursor-pointer'
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