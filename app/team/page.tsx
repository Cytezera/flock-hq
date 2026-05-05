export const dynamic = 'force-dynamic'

import { getUserProfile, getTeamAgents, type TeamAgent } from '@/lib/workspace'
import { BirdSprite, AgentPlaceholder } from '@/components/sparrow-sprite'

const MISSION = "Give Ezra the leverage to run his life, school, and startup in parallel — with a crew of agents handling research, tasks, and daily ops so he can stay focused on what actually matters."

const UNDEPLOYED = [
  { name: 'Owl',      role: 'School Support',      initial: 'O', desc: 'Assignments, research, study help.' },
]

function timeAgo(ms: number | null): string {
  if (!ms) return 'never'
  const d = Date.now() - ms
  const m = Math.floor(d / 60_000)
  const h = Math.floor(d / 3_600_000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function compactNumber(n: number): string {
  return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(n)
}

function latestSessionTime(agent: TeamAgent): number | null {
  return agent.status.sessions.reduce<number | null>((latest, session) => {
    const stamp = session.lastInteractionAt || session.endedAt || session.sessionStartedAt || null
    if (!stamp) return latest
    return latest ? Math.max(latest, stamp) : stamp
  }, agent.status.lastSeen)
}

const STATUS_DOT_COLOR = {
  ONLINE:  '#22c55e',
  STANDBY: '#f97316',
  IDLE:    '#4b5563',
}

export default function TeamPage() {
  const user = getUserProfile()
  const agents = getTeamAgents()
  const deployedAgents = agents.filter(agent => agent.deployed)
  const reserveAgents = agents.filter(agent => !agent.deployed)
  const activeAgents = deployedAgents.filter(agent => agent.status.status !== 'IDLE')
  const totalSessions = deployedAgents.reduce((acc, agent) => acc + agent.status.sessions.length, 0)
  const totalTokens = deployedAgents.reduce(
    (acc, agent) => acc + agent.status.sessions.reduce((agentAcc, s) => agentAcc + (s.outputTokens || 0), 0),
    0,
  )

  return (
    <div style={{ maxWidth: 980, margin: '0 auto', padding: '40px 32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 24, alignItems: 'flex-end', marginBottom: 28, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: '#7c5cfc', marginBottom: 10 }}>
            FLOCK ROSTER
          </div>
          <h1 style={{ fontSize: 28, lineHeight: 1.1, fontWeight: 800, color: '#e2e4ec', margin: 0 }}>
            Team Command
          </h1>
          <p style={{ fontSize: 13, lineHeight: 1.6, color: '#6b7394', margin: '10px 0 0', maxWidth: 620 }}>
            A living view of Ezra’s activated crew — who is running, which model they use, and what each bird owns right now.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(72px, 1fr))', gap: 10, minWidth: 360 }}>
          <RosterStat label="deployed" value={String(deployedAgents.length)} />
          <RosterStat label="active" value={String(activeAgents.length)} />
          <RosterStat label="sessions" value={String(totalSessions)} />
          <RosterStat label="tokens" value={compactNumber(totalTokens)} />
        </div>
      </div>

      <div style={{
        background: 'linear-gradient(135deg, rgba(124,92,252,0.13), rgba(19,22,32,0.95))',
        border: '1px solid #242940', borderRadius: 14, padding: '22px 24px', marginBottom: 34,
        display: 'grid', gridTemplateColumns: '1.3fr 0.7fr', gap: 24,
      }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: '#9b8cff', marginBottom: 10 }}>
            MISSION
          </div>
          <blockquote style={{ fontSize: 15, lineHeight: 1.75, color: '#c3c7d8', margin: 0, fontStyle: 'italic' }}>
            &ldquo;{MISSION}&rdquo;
          </blockquote>
        </div>
        <div style={{ borderLeft: '1px solid #2a3048', paddingLeft: 22 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: '#3a4060', marginBottom: 12 }}>
            FOUNDER
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12, background: '#1c2030',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0,
            }}>
              🧑‍💻
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#e2e4ec' }}>{user.name}</div>
              <div style={{ fontSize: 12, color: '#6b7394', marginTop: 2 }}>Founder & Human · {user.timezone}</div>
              {user.notes && <div style={{ fontSize: 12, color: '#5a6278', marginTop: 2 }}>{user.notes}</div>}
            </div>
          </div>
        </div>
      </div>

      <SectionHeader eyebrow="AI CREW" title="Deployed birds" aside={`${activeAgents.length} active now`} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16, marginBottom: 38 }}>
        {deployedAgents.map(agent => <AgentCard key={agent.agentId} agent={agent} />)}
      </div>

      <SectionHeader eyebrow="RESERVE CREW" title="Next rooms to activate" aside="not yet deployed" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
        {[...reserveAgents, ...UNDEPLOYED].map(agent => (
          <div
            key={agent.name}
            style={{
              background: '#0f1220', border: '1px solid #161a26', borderRadius: 12,
              padding: '16px 18px', opacity: 0.68, display: 'flex', alignItems: 'flex-start', gap: 16,
            }}
          >
            <div style={{ flexShrink: 0, marginTop: 2 }}>
              <AgentPlaceholder initial={agent.name[0]} size={3} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#46506f', letterSpacing: '0.06em' }}>
                  {agent.name.toUpperCase()}
                </span>
                <span style={{ fontSize: 10, color: '#2f3a5d', background: '#0d1018', padding: '1px 7px', borderRadius: 10 }}>
                  {agent.role}
                </span>
              </div>
              <div style={{ fontSize: 12, color: '#2f3a5d', lineHeight: 1.5 }}>{'desc' in agent ? agent.desc : agent.vibe}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SectionHeader({ eyebrow, title, aside }: { eyebrow: string; title: string; aside: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 14 }}>
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: '#3a4060', marginBottom: 5 }}>
          {eyebrow}
        </div>
        <h2 style={{ fontSize: 16, fontWeight: 800, color: '#d7dbea', margin: 0 }}>{title}</h2>
      </div>
      <span style={{ fontSize: 10, color: '#4d5678', background: '#0f1220', padding: '4px 9px', borderRadius: 999, border: '1px solid #1c2030', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {aside}
      </span>
    </div>
  )
}

function RosterStat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: '#11141d', border: '1px solid #1c2030', borderRadius: 10, padding: '12px 14px' }}>
      <div style={{ fontSize: 10, color: '#3a4060', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 18, color: '#e2e4ec', fontWeight: 800, fontFamily: 'monospace' }}>{value}</div>
    </div>
  )
}

function AgentCard({ agent }: { agent: TeamAgent }) {
  const totalTokens = agent.status.sessions.reduce((acc, s) => acc + (s.outputTokens || 0), 0)
  const channels = [...new Set(agent.status.sessions.map(s => s.channel || s.groupChannel).filter(Boolean))]
  const lastSeen = latestSessionTime(agent)
  const description = agent.responsibility
  const active = agent.status.status !== 'IDLE'
  const accent = agent.accent

  return (
    <div style={{
      background: active ? '#131620' : '#10131c', border: `1px solid ${active ? `${accent}80` : '#181c29'}`, borderRadius: 14,
      padding: '22px', position: 'relative', overflow: 'hidden', minHeight: 250,
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, ${accent}, ${STATUS_DOT_COLOR[agent.status.status]}, transparent)`,
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18, marginBottom: 18 }}>
        <div style={{ flexShrink: 0 }}>
          <BirdSprite size={4} variant={agent.agentId === 'main' ? 'sparrow' : agent.agentId} dim={!active} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 17, fontWeight: 800, color: '#e2e4ec', letterSpacing: '0.04em' }}>
              {agent.emoji} {agent.name.toUpperCase()}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{
                width: 7, height: 7, borderRadius: '50%',
                background: STATUS_DOT_COLOR[agent.status.status],
                boxShadow: active ? `0 0 10px ${accent}` : 'none',
              }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', color: STATUS_DOT_COLOR[agent.status.status] }}>
                {agent.status.status}
              </span>
            </span>
          </div>

          <div style={{ fontSize: 12, color: '#7c5cfc', fontWeight: 700, marginBottom: 10 }}>
            {agent.role}
          </div>

          <div style={{ fontSize: 13, color: '#9aa0b8', lineHeight: 1.65 }}>
            {description}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
        <Stat label="model" value={agent.model} />
        <Stat label="sessions" value={String(agent.status.sessions.length)} />
        <Stat label="tokens out" value={compactNumber(totalTokens)} />
        <Stat label="last seen" value={timeAgo(lastSeen)} />
        {agent.project && <Stat label="project" value={agent.project} />}
        <Stat label="responsibility" value={agent.responsibility} />
        {channels.length > 0 && <Stat label="channels" value={channels.join(', ')} />}
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: '#0f1220', border: '1px solid #1c2030', borderRadius: 9, padding: '9px 10px', minWidth: 0 }}>
      <div style={{ fontSize: 9, color: '#3a4060', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 3 }}>
        {label}
      </div>
      <div style={{ fontSize: 12, color: '#7a83a5', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</div>
    </div>
  )
}
