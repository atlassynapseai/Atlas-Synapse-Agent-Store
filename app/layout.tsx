import type { Session } from '@supabase/supabase-js'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { AuthProvider } from '@/components/auth/auth-provider'
import { createClient } from '@/lib/supabase/server'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const iconUrl = process.env.NEXT_PUBLIC_ASSET_PREFIX
  ? `${process.env.NEXT_PUBLIC_ASSET_PREFIX}/favicon.ico`
  : '/favicon.ico'

export const metadata: Metadata = {
  title: 'Atlas Synapse Agent Store',
  description: 'Run production-ready AI agents for cybersecurity, contracts, compliance, HR, fraud, and sales workflows.',
  icons: {
    icon: iconUrl,
    shortcut: iconUrl,
    apple: iconUrl,
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  let initialSession: Session | null = null

  const supabase = await createClient()
  if (supabase) {
    const { data } = await supabase.auth.getSession()
    initialSession = data.session
  }

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider initialSession={initialSession}>{children}</AuthProvider>
      </body>
    </html>
  )
}
