import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function resolveNextPath(nextParam: string | null) {
    if (!nextParam || !nextParam.startsWith('/agents') || nextParam.startsWith('/agents/auth')) {
        return '/agents'
    }

    return nextParam
}

function resolvePublicOrigin(fallbackOrigin: string) {
    const configuredUrl = process.env.NEXT_PUBLIC_APP_URL

    if (!configuredUrl) {
        return fallbackOrigin
    }

    try {
        return new URL(configuredUrl).origin
    } catch {
        return fallbackOrigin
    }
}

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const next = resolveNextPath(requestUrl.searchParams.get('next'))
    const publicOrigin = resolvePublicOrigin(requestUrl.origin)

    const supabase = await createClient()
    if (!supabase) {
        return NextResponse.redirect(new URL('/agents/auth', publicOrigin))
    }

    if (code) {
        await supabase.auth.exchangeCodeForSession(code)
    }

    return NextResponse.redirect(new URL(next, publicOrigin))
}
