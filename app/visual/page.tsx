export const dynamic = 'force-dynamic'

import { getTeamAgents, type TeamAgent } from '@/lib/workspace'
import { BirdSprite, AgentPlaceholder } from '@/components/sparrow-sprite'

const EXTRA_ROOMS = [
  { name: 'Owl', role: 'School Support', initial: 'O' },
]

const STATUS_COLOR = {
  ONLINE:  '#22c55e',
  STANDBY: '#f97316',
  IDLE:    '#4b5563',
}

function roomAccent(agent: TeamAgent): string {
  return agent.accent
}

function activityLevel(agent: TeamAgent): number {
  if (agent.status.status === 'ONLINE') return 100
  if (agent.status.status === 'STANDBY') return 58
  return 18
}

function shortModel(agent: TeamAgent): string {
  return agent.status.sessions[0]?.model?.replace('claude-', '').replace('gpt-', '') || 'offline'
}

export default function VisualPage() {
  const agents = getTeamAgents()
  const deployed = agents.filter(agent => agent.deployed)
  const reserve = agents.filter(agent => !agent.deployed)
  const online = deployed.filter(agent => agent.status.status === 'ONLINE').length
  const standby = deployed.filter(agent => agent.status.status === 'STANDBY').length

  return (
    <div style={{ padding: '40px 32px', maxWidth: 1120, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 24, alignItems: 'flex-end', marginBottom: 28, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: '#7c5cfc', marginBottom: 10 }}>
            VISUAL OFFICE
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#e2e4ec', margin: 0, lineHeight: 1.1 }}>
            Flock floorplan
          </h1>
          <p style={{ fontSize: 13, color: '#6b7394', margin: '10px 0 0', lineHeight: 1.6, maxWidth: 650 }}>
            Multiple agent workspaces: active birds sit at lit desks, inactive rooms stay dim, and Sparrow loops around the floor checking on everyone.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <SignalPill label="online" value={online} color="#22c55e" />
          <SignalPill label="standby" value={standby} color="#f97316" />
          <SignalPill label="reserved" value={reserve.length + EXTRA_ROOMS.length} color="#4b5563" />
        </div>
      </div>

      <div style={{
        background: 'radial-gradient(circle at 50% 0%, rgba(124,92,252,0.14), transparent 34%), radial-gradient(circle at 72% 18%, rgba(249,115,22,0.10), transparent 28%), #04060c',
        border: '1px solid #121827', borderRadius: 18, padding: 18, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(#161a2640 1px, transparent 1px), linear-gradient(90deg, #161a2640 1px, transparent 1px)',
          backgroundSize: '28px 28px', opacity: 0.55, pointerEvents: 'none',
        }} />

        <FlyingSparrow />

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, position: 'relative' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16 }}>
            {deployed.map(agent => <DeskCard key={agent.agentId} agent={agent} />)}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <WarRoom deployed={deployed} />
            <ReserveStack rooms={[...reserve, ...EXTRA_ROOMS]} />
          </div>
        </div>
      </div>

      <div style={{ marginTop: 24, fontSize: 12, color: '#2f3858', textAlign: 'center' }}>
        {deployed.length} active desk{deployed.length !== 1 ? 's' : ''} · {reserve.length + EXTRA_ROOMS.length} reserved room{reserve.length + EXTRA_ROOMS.length !== 1 ? 's' : ''}
      </div>
    </div>
  )
}


function FlyingSparrow() {
  return (
    <div style={{ position: 'absolute', top: 24, left: '46%', zIndex: 2, transform: 'rotate(-8deg)', filter: 'drop-shadow(0 0 12px rgba(196,149,106,0.45))' }}>
      <div style={{ fontSize: 9, color: '#8b92ad', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 3, textAlign: 'center' }}>
        Sparrow patrol
      </div>
      <BirdSprite size={2} variant="sparrow" />
    </div>
  )
}

function SignalPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ background: '#11141d', border: '1px solid #1c2030', borderRadius: 999, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, boxShadow: `0 0 7px ${color}` }} />
      <span style={{ fontSize: 10, color: '#5a6278', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>{label}</span>
      <span style={{ fontSize: 12, color: '#d7dbea', fontFamily: 'monospace', fontWeight: 800 }}>{value}</span>
    </div>
  )
}

function DeskCard({ agent }: { agent: TeamAgent }) {
  const active = agent.status.status !== 'IDLE'
  const accent = roomAccent(agent)
  const level = activityLevel(agent)
  const sessions = agent.status.sessions.length

  return (
    <div
      style={{
        background: active ? 'rgba(10,14,26,0.96)' : 'rgba(4,6,12,0.92)',
        border: `1px solid ${active ? `${accent}70` : '#151a28'}`,
        borderRadius: 16,
        padding: '24px 22px',
        position: 'relative',
        overflow: 'hidden',
        minHeight: 260,
        boxShadow: active ? `0 0 34px ${accent}35, inset 0 0 26px ${accent}12` : 'inset 0 0 28px rgba(0,0,0,0.42)',
      }}
    >
      <div style={{
        position: 'absolute', inset: 0,
        background: active ? `radial-gradient(ellipse at 50% 100%, ${accent}22 0%, transparent 68%)` : 'transparent',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: 0, left: 18, right: 18, height: 2,
        background: active ? `linear-gradient(90deg, transparent, ${accent}, transparent)` : 'linear-gradient(90deg, transparent, #1c2030, transparent)',
      }} />

      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 13 }}>
        <div style={{ width: 104, height: 92, borderRadius: '50% 50% 10px 10px', background: active ? `${accent}20` : '#070912', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: active ? `0 -18px 40px ${accent}30` : 'none' }}>
          <BirdSprite size={4} variant={agent.agentId === 'main' ? 'sparrow' : agent.agentId} dim={!active} />
        </div>

        <div style={{ width: '88%', height: 9, background: '#1c2030', borderRadius: 3, border: '1px solid #29304a', boxShadow: active ? `0 0 12px ${accent}45` : 'none' }} />
        <div style={{ width: '62%', height: 20, background: '#111520', border: '1px solid #202842', borderRadius: '0 0 9px 9px' }} />

        <div style={{ textAlign: 'center', width: '100%' }}>
          <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.09em', color: '#d7dbea', marginBottom: 4 }}>
            {agent.name.toUpperCase()}
          </div>
          <div style={{ fontSize: 10, color: '#6b7394', lineHeight: 1.4 }}>
            {agent.role}
          </div>
          <div style={{ fontSize: 9, color: active ? '#8b92ad' : '#303956', lineHeight: 1.45, marginTop: 6 }}>
            {active ? agent.responsibility : 'Room dimmed — agent not currently running.'}
          </div>
          {agent.project && (
            <div style={{ fontSize: 9, color: accent, marginTop: 5, fontWeight: 800, letterSpacing: '0.08em' }}>
              {agent.project.toUpperCase()}
            </div>
          )}
        </div>

        <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 4 }}>
          <DeskMetric label="model" value={agent.model || shortModel(agent)} />
          <DeskMetric label="sessions" value={String(sessions)} />
        </div>

        <div style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
            <span style={{ fontSize: 9, color: '#3a4060', letterSpacing: '0.08em', textTransform: 'uppercase' }}>activity</span>
            <span style={{ fontSize: 9, color: STATUS_COLOR[agent.status.status], fontWeight: 800 }}>{agent.status.status}</span>
          </div>
          <div style={{ height: 5, background: '#111520', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ width: `${level}%`, height: '100%', background: `linear-gradient(90deg, ${STATUS_COLOR[agent.status.status]}, ${accent})`, borderRadius: 99 }} />
          </div>
        </div>
      </div>
    </div>
  )
}

function DeskMetric({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: '#0b0e14', border: '1px solid #161b2a', borderRadius: 8, padding: '7px 8px', minWidth: 0 }}>
      <div style={{ fontSize: 8, color: '#303956', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 11, color: '#737c9e', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</div>
    </div>
  )
}

function WarRoom({ deployed }: { deployed: TeamAgent[] }) {
  return (
    <div style={{ background: 'rgba(15,18,32,0.86)', border: '1px solid #202842', borderRadius: 16, padding: 18, minHeight: 210 }}>
      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', color: '#7c5cfc', marginBottom: 14 }}>
        OPS TABLE
      </div>
      <div style={{ width: '100%', height: 88, borderRadius: 999, background: 'radial-gradient(circle, rgba(124,92,252,0.22), #111520 62%)', border: '1px solid #2a3048', boxShadow: '0 0 24px rgba(124,92,252,0.12)', marginBottom: 16 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {deployed.map(agent => (
          <div key={agent.agentId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <span style={{ fontSize: 11, color: '#8b92ad', fontWeight: 700 }}>{agent.emoji} {agent.name}</span>
            <span style={{ fontSize: 9, color: STATUS_COLOR[agent.status.status], letterSpacing: '0.08em', fontWeight: 800 }}>{agent.status.status}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ReserveStack({ rooms }: { rooms: Array<{ name: string; role: string; initial?: string; vibe?: string }> }) {
  return (
    <div style={{ background: 'rgba(9,11,16,0.86)', border: '1px solid #151a28', borderRadius: 16, padding: 18 }}>
      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', color: '#303956', marginBottom: 14 }}>
        RESERVED ROOMS
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
        {rooms.map(room => (
          <div key={room.name} style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: 0.55, background: '#090b10', border: '1px solid #111520', borderRadius: 10, padding: 10 }}>
            <AgentPlaceholder initial={room.name[0]} size={2} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', color: '#354061' }}>{room.name.toUpperCase()}</div>
              <div style={{ fontSize: 10, color: '#242b42', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{room.role}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
