import Image from 'next/image'
import Link from 'next/link'

const logoSrc = process.env.NEXT_PUBLIC_ASSET_PREFIX
    ? `${process.env.NEXT_PUBLIC_ASSET_PREFIX}/logo.png`
    : '/logo.png'

export function AtlasLogo({
    href = '/',
    showText = true,
    className = '',
}: {
    href?: string
    showText?: boolean
    className?: string
}) {
    return (
        <Link href={href} className={`flex items-center gap-3 ${className}`.trim()}>
            <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-cyan-400/30 bg-[#050d22] shadow-[0_0_20px_rgba(59,130,246,0.18)]">
                <Image
                    src={logoSrc}
                    alt="Atlas Synapse"
                    width={40}
                    height={40}
                    unoptimized
                    className="h-10 w-10 rounded-full object-cover"
                />
            </span>
            {showText && <span className="text-white font-semibold text-lg tracking-tight">Atlas Synapse</span>}
        </Link>
    )
}
