import { AuthForm } from '@/components/auth/auth-form'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>
}) {
  const { next } = await searchParams
  const nextPath = Array.isArray(next) ? next[0] : next

  return <AuthForm mode="login" nextPath={nextPath || '/'} />
}
