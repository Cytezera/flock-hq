export const dynamic = 'force-dynamic'

import { getMemoryEntries, getLongTermMemory } from '@/lib/workspace'
import { MemoryViewer } from '@/components/memory-viewer'

export default function MemoryPage() {
  const entries = getMemoryEntries()
  const longTerm = getLongTermMemory()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header */}
      <div style={{ padding: '28px 32px 0', flexShrink: 0 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#e2e4ec', margin: 0, marginBottom: 4 }}>
          Memory
        </h1>
        <p style={{ fontSize: 13, color: '#3a4060', margin: 0 }}>
          {entries.length > 0
            ? `${entries.length} daily log${entries.length !== 1 ? 's' : ''} · ${entries.reduce((a, e) => a + e.wordCount, 0).toLocaleString()} total words`
            : "Sparrow's brain — daily logs and long-term context"}
        </p>
      </div>

      {/* Viewer (takes remaining height) */}
      <div style={{ flex: 1, overflow: 'hidden', marginTop: 20 }}>
        <MemoryViewer entries={entries} longTerm={longTerm} />
      </div>
    </div>
  )
}
