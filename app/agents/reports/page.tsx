import { AgentRunHistory } from '@/components/agents/agent-run-history'
import { AuthNav } from '@/components/auth/auth-nav'
import { AtlasLogo } from '@/components/brand/atlas-logo'

export default function AgentReportsPage() {
    return (
        <div className="page-noise min-h-screen bg-[#0a0a0f] font-[family-name:var(--font-geist-sans)]">
            <header className="border-b border-white/10 px-8 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <AtlasLogo href="/agents" />
                    <span className="text-white/20 mx-1">/</span>
                    <span className="text-white/50 text-sm">Saved Reports</span>
                </div>
                <AuthNav />
            </header>

            <div className="max-w-5xl mx-auto px-8 py-12">
                <div className="mb-8">
                    <div className="text-4xl mb-4">📊</div>
                    <h1 className="text-3xl font-bold text-white mb-3">Saved Reports</h1>
                    <p className="text-white/50 text-lg max-w-2xl">
                        Review your latest saved reports across cybersecurity, contracts, compliance, HR, fraud, and lead scoring workflows.
                    </p>
                    <p className="mt-2 text-sm text-cyan-200/80">
                        Open any saved report below to view the full original input and detailed results again.
                    </p>
                </div>

                <AgentRunHistory title="All saved reports" limit={20} />
            </div>
        </div>
    )
}
