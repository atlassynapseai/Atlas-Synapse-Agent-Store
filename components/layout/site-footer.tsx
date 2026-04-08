import Link from 'next/link'
import { AtlasLogo } from '@/components/brand/atlas-logo'

const platformLinks = [
    { label: 'Agent Store', href: '/agents' },
    { label: 'Sign In', href: '/agents/auth' },
    { label: 'Create Account', href: '/agents/auth?mode=signup' },
]

const companyLinks = [
    { label: 'Solutions', href: 'https://www.atlassynapseai.com/#solutions' },
    { label: 'Pricing', href: 'https://www.atlassynapseai.com/#pricing' },
    { label: 'Contact', href: 'https://www.atlassynapseai.com/contact' },
]

export function SiteFooter() {
    return (
        <footer className="relative z-10 mt-auto border-t border-white/10 bg-black/20 backdrop-blur-xl">
            <div className="mx-auto grid max-w-6xl gap-8 px-6 py-10 md:grid-cols-[1.4fr_1fr_1fr] md:px-8">
                <div className="space-y-4">
                    <AtlasLogo href="/agents" />
                    <p className="max-w-md text-sm leading-relaxed text-white/55">
                        Atlas Synapse Agent Store gives your team production-ready AI agents for security,
                        legal, compliance, recruiting, fraud, and revenue workflows.
                    </p>
                    <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300">
                        <span className="h-2 w-2 rounded-full bg-cyan-300 animate-pulse" />
                        Premium workflow automation
                    </div>
                </div>

                <div>
                    <h3 className="mb-3 text-sm font-semibold text-white">Platform</h3>
                    <ul className="space-y-2 text-sm text-white/55">
                        {platformLinks.map((link) => (
                            <li key={link.href}>
                                <Link href={link.href} className="interactive-link">
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h3 className="mb-3 text-sm font-semibold text-white">Company</h3>
                    <ul className="space-y-2 text-sm text-white/55">
                        {companyLinks.map((link) => (
                            <li key={link.href}>
                                <Link href={link.href} className="interactive-link">
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="border-t border-white/5 px-6 py-4 md:px-8">
                <div className="mx-auto flex max-w-6xl flex-col gap-2 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
                    <span>© 2026 Atlas Synapse AI. All rights reserved.</span>
                    <span>Built for business-grade AI workflows.</span>
                </div>
            </div>
        </footer>
    )
}
