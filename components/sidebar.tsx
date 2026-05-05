'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CheckSquare, FolderOpen, Brain, Users, Grid2X2 } from 'lucide-react'

interface SidebarProps {
  agentName: string
  agentStatus: 'ONLINE' | 'STANDBY' | 'IDLE'
}

const NAV = [
  { href: '/tasks',    icon: CheckSquare, label: 'Tasks' },
  { href: '/projects', icon: FolderOpen,  label: 'Projects' },
  { href: '/memory',   icon: Brain,       label: 'Memory' },
  { href: '/team',     icon: Users,       label: 'Team' },
  { href: '/visual',   icon: Grid2X2,     label: 'Visual' },
]

const STATUS_COLOR = {
  ONLINE:  '#22c55e',
  STANDBY: '#f97316',
  IDLE:    '#4b5563',
}

const STATUS_LABEL = {
  ONLINE:  'ONLINE',
  STANDBY: 'STANDBY',
  IDLE:    'IDLE',
}

export function Sidebar({ agentName, agentStatus }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      style={{ background: 'var(--sidebar)', borderRight: '1px solid var(--border)', width: 200, minHeight: '100vh' }}
      className="flex flex-col flex-shrink-0"
    >
      {/* Header */}
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: '#e2e4ec' }}>
          MISSION CONTROL
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span
            style={{
              width: 7, height: 7, borderRadius: '50%',
              background: STATUS_COLOR[agentStatus],
              boxShadow: `0 0 6px ${STATUS_COLOR[agentStatus]}`,
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', color: STATUS_COLOR[agentStatus] }}>
            {agentName.toUpperCase()} {STATUS_LABEL[agentStatus]}
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col" style={{ padding: '8px 0', flex: 1 }}>
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 16px',
                fontSize: 13,
                fontWeight: active ? 600 : 400,
                color: active ? '#e2e4ec' : '#5a6278',
                background: active ? 'rgba(124,92,252,0.08)' : 'transparent',
                borderLeft: active ? '2px solid #7c5cfc' : '2px solid transparent',
                textDecoration: 'none',
                transition: 'all 0.15s',
              }}
            >
              <Icon size={14} strokeWidth={active ? 2.5 : 1.8} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
        <div style={{ fontSize: 10, color: '#2a3048' }}>flock hq v0.1</div>
      </div>
    </aside>
  )
}
