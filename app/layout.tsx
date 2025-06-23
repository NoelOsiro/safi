import type { Metadata } from 'next'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth/next'
import { SessionProvider } from '@/components/providers/session-provider'
import { SiteHeader } from '@/components/site-header'
import './globals.css'

export const metadata: Metadata = {
  title: 'v0 App',
  description: 'Created with v0',
  generator: 'v0.dev',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen flex flex-col bg-gray-50">
        <SessionProvider session={session}>
          <SiteHeader />
          <main className="flex-1">
            {children}
          </main>
        </SessionProvider>
      </body>
    </html>
  )
}
