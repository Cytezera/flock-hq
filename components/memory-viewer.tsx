'use client'

import { useState } from 'react'
import type { MemoryEntry } from '@/lib/workspace'

interface MemoryViewerProps {
  entries: MemoryEntry[]
  longTerm: string | null
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

function renderMarkdown(md: string): string {
  return md
    .replace(/^### (.+)$/gm, '<h3 style="font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#3a4060;margin:20px 0 8px">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="font-size:14px;font-weight:700;color:#9aa0b8;margin:24px 0 10px">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="font-size:18px;font-weight:700;color:#e2e4ec;margin:0 0 20px">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#c8ccdc">$1</strong>')
    .replace(/^- (.+)$/gm, '<li style="color:#9aa0b8;font-size:13px;line-height:1.7;margin-bottom:3px">$1</li>')
    .replace(/(<li[^>]*>.*<\/li>\n?)+/g, m => `<ul style="padding-left:20px;margin:8px 0">${m}</ul>`)
    .replace(/^(?!<[hul]|$)(.+)$/gm, '<p style="color:#9aa0b8;font-size:13px;line-height:1.7;margin:6px 0">$1</p>')
    .replace(/\n{2,}/g, '\n')
}

export function MemoryViewer({ entries, longTerm }: MemoryViewerProps) {
  const [tab, setTab] = useState<'daily' | 'longterm'>('daily')
  const [selectedDate, setSelectedDate] = useState<string>(entries[0]?.date || '')

  const selected = entries.find(e => e.date === selectedDate)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Tab bar */}
      <div style={{ borderBottom: '1px solid #1c2030', padding: '0 32px', display: 'flex', gap: 0 }}>
        {[
          { key: 'daily', label: 'Daily Log' },
          { key: 'longterm', label: 'Long-term' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as 'daily' | 'longterm')}
            style={{
              padding: '14px 20px',
              fontSize: 13,
              fontWeight: tab === t.key ? 600 : 400,
              color: tab === t.key ? '#e2e4ec' : '#5a6278',
              background: 'none',
              border: 'none',
              borderBottom: tab === t.key ? '2px solid #7c5cfc' : '2px solid transparent',
              cursor: 'pointer',
              marginBottom: -1,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'daily' ? (
        entries.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>📭</div>
              <div style={{ fontSize: 14, color: '#3a4060', fontWeight: 600 }}>No daily logs yet</div>
              <div style={{ fontSize: 12, color: '#2a3048', marginTop: 6 }}>Sparrow will write here after each session.</div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            {/* Date list */}
            <div style={{
              width: 220, flexShrink: 0, borderRight: '1px solid #1c2030',
              overflowY: 'auto', padding: '16px 0',
            }}>
              {entries.map(e => (
                <button
                  key={e.date}
                  onClick={() => setSelectedDate(e.date)}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '12px 20px', background: 'none', border: 'none', cursor: 'pointer',
                    borderLeft: e.date === selectedDate ? '2px solid #7c5cfc' : '2px solid transparent',
                    backgroundColor: e.date === selectedDate ? 'rgba(124,92,252,0.06)' : 'transparent',
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: e.date === selectedDate ? 600 : 400, color: e.date === selectedDate ? '#e2e4ec' : '#6b7394', fontFamily: 'monospace', marginBottom: 3 }}>
                    {e.date}
                  </div>
                  <div style={{ fontSize: 11, color: '#3a4060', marginBottom: 4 }}>
                    {e.wordCount.toLocaleString()} words
                  </div>
                  <div style={{ fontSize: 11, color: '#2a3555', lineHeight: 1.5, whiteSpace: 'normal' }}>
                    {e.preview.slice(0, 80)}{e.preview.length > 80 ? '…' : ''}
                  </div>
                </button>
              ))}
            </div>

            {/* Content pane */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '28px 36px' }}>
              {selected ? (
                <div>
                  <div style={{ fontSize: 11, color: '#3a4060', marginBottom: 4, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    {formatDate(selected.date)}
                  </div>
                  <div
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(selected.content) }}
                  />
                </div>
              ) : (
                <div style={{ color: '#3a4060', fontSize: 13 }}>Select a date to read.</div>
              )}
            </div>
          </div>
        )
      ) : (
        /* Long-term memory */
        <div style={{ flex: 1, overflowY: 'auto', padding: '28px 36px' }}>
          {longTerm ? (
            <div dangerouslySetInnerHTML={{ __html: renderMarkdown(longTerm) }} />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>🧠</div>
                <div style={{ fontSize: 14, color: '#3a4060', fontWeight: 600 }}>No long-term memory yet</div>
                <div style={{ fontSize: 12, color: '#2a3048', marginTop: 6 }}>
                  Sparrow will build MEMORY.md as sessions accumulate.
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
