export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import './globals.css'
import { Sidebar } from '@/components/sidebar'
import { getAgentStatus, getIdentity } from '@/lib/workspace'

export const metadata: Metadata = {
  title: 'Flock HQ — Mission Control',
  description: 'Mission Control for the Flock agent crew',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const identity = getIdentity()
  const status = getAgentStatus()

  return (
    <html lang="en" style={{ height: '100%' }}>
      <body style={{ height: '100%', margin: 0, display: 'flex' }}>
        <Sidebar agentName={identity.name} agentStatus={status.status} />
        <main style={{ flex: 1, overflowY: 'auto', minHeight: '100vh' }}>
          {children}
        </main>
      </body>
    </html>
  )
}
