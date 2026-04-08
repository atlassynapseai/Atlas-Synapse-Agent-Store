import { AuthForm } from '@/components/auth/auth-form'

export default async function AuthPage({
    searchParams,
}: {
    searchParams: Promise<{ mode?: string | string[]; next?: string | string[] }>
}) {
    const params = await searchParams
    const modeValue = Array.isArray(params.mode) ? params.mode[0] : params.mode
    const nextValue = Array.isArray(params.next) ? params.next[0] : params.next
    const mode = modeValue === 'signup' ? 'signup' : 'login'

    return <AuthForm mode={mode} nextPath={nextValue || '/agents'} />
}
