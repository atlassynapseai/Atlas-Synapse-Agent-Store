import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

const AUTH_PAGES = ['/auth', '/auth/login', '/auth/signup', '/agents/auth']

function resolvePublicOrigin(request: NextRequest) {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL

  if (!configuredUrl) {
    return request.nextUrl.origin
  }

  try {
    return new URL(configuredUrl).origin
  } catch {
    return request.nextUrl.origin
  }
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return response
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isAuthPage = AUTH_PAGES.includes(pathname) || pathname.startsWith('/agents/auth')

  if (user && isAuthPage) {
    const nextParam = request.nextUrl.searchParams.get('next')
    const nextPath = nextParam && nextParam.startsWith('/agents') && !nextParam.startsWith('/agents/auth')
      ? nextParam
      : '/agents'
    const publicOrigin = resolvePublicOrigin(request)

    return NextResponse.redirect(new URL(nextPath, publicOrigin))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
