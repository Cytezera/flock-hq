import fs from 'fs'
import path from 'path'

const HOME = process.env.HOME || '/home/iris'
export const WORKSPACE = path.join(HOME, '.openclaw', 'workspace')
export const OPENCLAW = path.join(HOME, '.openclaw')

const AGENT_WORKSPACES = [
  { agentId: 'main', workspace: 'workspace', fallbackName: 'Sparrow' },
  { agentId: 'raven', workspace: 'workspace-raven', fallbackName: 'Raven' },
  { agentId: 'parrot', workspace: 'workspace-parrot', fallbackName: 'Parrot' },
  { agentId: 'bluejay', workspace: 'workspace-bluejay', fallbackName: 'Blue Jay' },
  { agentId: 'crow', workspace: 'workspace-crow', fallbackName: 'Crow' },
] as const

const AGENT_OVERRIDES: Record<string, Partial<Pick<TeamAgent, 'role' | 'project' | 'model' | 'responsibility' | 'accent' | 'deployed'>>> = {
  main: {
    model: 'openai-codex/gpt-5.5',
    responsibility: 'Chief-of-staff layer: routes work, keeps memory, coordinates agents, and flies between workspaces.',
    accent: '#7c5cfc',
  },
  parrot: {
    model: 'openai-codex/gpt-5.5',
    responsibility: 'Tech-news scout: scans public engineering sources and posts high-signal daily digests.',
    accent: '#f97316',
  },
  bluejay: {
    model: 'anthropic/claude-sonnet-4-6',
    responsibility: 'Peekabox developer: owns project context, implementation help, debugging, and code review.',
    accent: '#60a5fa',
  },
  raven: {
    model: 'openai-codex/gpt-5.5',
    responsibility: 'Flock HQ developer: edits and ships the dashboard for Ezra.',
    accent: '#8b5cf6',
  },
  crow: {
    role: 'Ops Watcher',
    project: 'Operations',
    model: 'openai-codex/gpt-5.5',
    responsibility: 'Navy-blue ops workspace: watches execution state, risks, and cross-agent follow-through.',
    accent: '#0f2a5f',
    deployed: true,
  },
}

function readFile(p: string): string | null {
  try { return fs.readFileSync(p, 'utf-8') } catch { return null }
}

function parseMdFields(content: string): Record<string, string> {
  const result: Record<string, string> = {}
  for (const line of content.split('\n')) {
    const m = line.match(/^-\s+\*\*(.+?)(?:\*\*:?|:\*\*)\s*(.*)$/)
    if (m) result[m[1].toLowerCase().trim()] = m[2].trim()
  }
  return result
}

export interface AgentIdentity {
  name: string
  vibe: string
  emoji: string
}

export interface TeamAgent extends AgentIdentity {
  agentId: string
  workspaceName: string
  role: string
  project: string | null
  model: string
  responsibility: string
  accent: string
  status: AgentStatus
  deployed: boolean
}

export interface UserProfile {
  name: string
  callName: string
  timezone: string
  notes: string
}

export interface Session {
  key: string
  sessionId: string
  status: string
  model: string
  chatType: string
  channel?: string
  groupChannel?: string
  lastInteractionAt?: number
  sessionStartedAt?: number
  endedAt?: number
  runtimeMs?: number
  inputTokens?: number
  outputTokens?: number
  cacheRead?: number
}

export interface AgentStatus {
  status: 'ONLINE' | 'STANDBY' | 'IDLE'
  lastSeen: number | null
  sessions: Session[]
}

export interface MemoryEntry {
  date: string
  content: string
  wordCount: number
  preview: string
}

export function getIdentity(): AgentIdentity {
  const content = readFile(path.join(WORKSPACE, 'IDENTITY.md'))
  if (!content) return { name: 'Sparrow', vibe: 'AI assistant', emoji: '🐦' }
  const f = parseMdFields(content)
  return {
    name: f['name'] || 'Sparrow',
    vibe: f['creature'] || f['vibe'] || 'AI assistant',
    emoji: f['emoji'] || '🐦',
  }
}

export function getUserProfile(): UserProfile {
  const content = readFile(path.join(WORKSPACE, 'USER.md'))
  if (!content) return { name: 'Ezra', callName: 'Ezra', timezone: 'GMT+8', notes: '' }
  const f = parseMdFields(content)
  return {
    name: f['name'] || 'Ezra',
    callName: f['what to call them'] || f['name'] || 'Ezra',
    timezone: f['timezone'] || 'GMT+8',
    notes: f['notes'] || '',
  }
}

function getAgentStatusById(agentId: string): AgentStatus {
  const raw = readFile(path.join(OPENCLAW, 'agents', agentId, 'sessions', 'sessions.json'))
  if (!raw) return { status: 'IDLE', lastSeen: null, sessions: [] }

  let data: Record<string, Record<string, unknown>>
  try { data = JSON.parse(raw) } catch { return { status: 'IDLE', lastSeen: null, sessions: [] } }

  const sessions: Session[] = Object.entries(data).map(([key, s]) => ({
    key,
    sessionId: s.sessionId as string,
    status: s.status as string,
    model: s.model as string,
    chatType: s.chatType as string,
    channel: s.channel as string | undefined,
    groupChannel: s.groupChannel as string | undefined,
    lastInteractionAt: s.lastInteractionAt as number | undefined,
    sessionStartedAt: s.sessionStartedAt as number | undefined,
    endedAt: s.endedAt as number | undefined,
    runtimeMs: s.runtimeMs as number | undefined,
    inputTokens: s.inputTokens as number | undefined,
    outputTokens: s.outputTokens as number | undefined,
    cacheRead: s.cacheRead as number | undefined,
  }))

  if (sessions.some(s => s.status === 'running')) {
    return { status: 'ONLINE', lastSeen: Date.now(), sessions }
  }

  const sorted = [...sessions].sort((a, b) => {
    const at = a.lastInteractionAt || a.endedAt || a.sessionStartedAt || 0
    const bt = b.lastInteractionAt || b.endedAt || b.sessionStartedAt || 0
    return bt - at
  })

  const lastSeen = sorted[0]
    ? (sorted[0].lastInteractionAt || sorted[0].endedAt || sorted[0].sessionStartedAt || null)
    : null

  const ageH = lastSeen ? (Date.now() - lastSeen) / 3_600_000 : Infinity
  return { status: ageH < 3 ? 'STANDBY' : 'IDLE', lastSeen, sessions }
}

export function getAgentStatus(): AgentStatus {
  return getAgentStatusById('main')
}

function getIdentityFromWorkspace(workspaceName: string, fallbackName: string): AgentIdentity {
  const content = readFile(path.join(OPENCLAW, workspaceName, 'IDENTITY.md'))
  if (!content) return { name: fallbackName, vibe: 'AI agent', emoji: '🐦' }
  const f = parseMdFields(content)
  return {
    name: f['name'] || fallbackName,
    vibe: f['creature'] || f['vibe'] || 'AI agent',
    emoji: f['emoji'] || '🐦',
  }
}

function missionField(content: string, label: string): string | null {
  const match = content.match(new RegExp(`^## ${label}\\s*\\n+([\\s\\S]*?)(?=^## |\\z)`, 'm'))
  return match?.[1]?.trim() || null
}

function getProjectFromMission(content: string | null): string | null {
  if (!content) return null
  const match = content.match(/Current Project:\s*([^\n#]+)/i) || content.match(/assigned you to \*\*([^*]+)\*\*/i)
  return match?.[1]?.replace(/[.\s]+$/, '').trim() || null
}

function getRole(agentId: string, identity: AgentIdentity, mission: string | null, project: string | null): string {
  if (agentId === 'main') return 'Chief of Staff'
  if (project) return `${project} owner`
  const who = mission ? missionField(mission, 'Who You Are') : null
  const firstSentence = who?.split('\n').find(line => line.trim() && !line.startsWith('#'))?.replace(/^You are\s+/i, '')
  return firstSentence?.replace(/[.\s]+$/, '') || identity.vibe
}

export function getTeamAgents(): TeamAgent[] {
  return AGENT_WORKSPACES.map(({ agentId, workspace, fallbackName }) => {
    const workspacePath = path.join(OPENCLAW, workspace)
    const override = AGENT_OVERRIDES[agentId] || {}
    const deployed = override.deployed ?? fs.existsSync(workspacePath)
    const identity = getIdentityFromWorkspace(workspace, fallbackName)
    const mission = readFile(path.join(workspacePath, 'MISSION.md'))
    const project = getProjectFromMission(mission)
    const realStatus = getAgentStatusById(agentId)
    const status: AgentStatus = deployed && realStatus.status === 'IDLE' && ['parrot', 'bluejay', 'crow'].includes(agentId)
      ? { ...realStatus, status: 'STANDBY', lastSeen: realStatus.lastSeen || Date.now() }
      : realStatus
    const latestModel = status.sessions.find(session => session.model)?.model
    const role = override.role || getRole(agentId, identity, mission, project)
    return {
      ...identity,
      agentId,
      workspaceName: workspace,
      role,
      project: override.project ?? project,
      model: override.model || latestModel || 'not configured',
      responsibility: override.responsibility || (project ? `Owns ${project}: implementation, debugging, and project-specific context.` : identity.vibe),
      accent: override.accent || '#7c5cfc',
      status,
      deployed,
    }
  })
}

export function getMemoryEntries(): MemoryEntry[] {
  const dir = path.join(WORKSPACE, 'memory')
  try {
    if (!fs.existsSync(dir)) return []
    return fs.readdirSync(dir)
      .filter(f => /^\d{4}-\d{2}-\d{2}\.md$/.test(f))
      .sort().reverse()
      .map(f => {
        const content = fs.readFileSync(path.join(dir, f), 'utf-8')
        const wordCount = content.trim().split(/\s+/).length
        const preview = content.split('\n').filter(l => l.trim() && !l.startsWith('#')).slice(0, 2).join(' ').slice(0, 120)
        return { date: f.replace('.md', ''), content, wordCount, preview }
      })
  } catch { return [] }
}

export function getLongTermMemory(): string | null {
  return readFile(path.join(WORKSPACE, 'MEMORY.md'))
}

export function getSoulContent(): string | null {
  return readFile(path.join(WORKSPACE, 'SOUL.md'))
}

export interface ManualTask {
  text: string
  section: string
}

export function getManualTasks(): ManualTask[] {
  const content = readFile(path.join(WORKSPACE, 'TASKS.md'))
  if (!content) return []
  const tasks: ManualTask[] = []
  let section = 'Backlog'
  for (const line of content.split('\n')) {
    const sectionMatch = line.match(/^##\s+(.+)/)
    if (sectionMatch) { section = sectionMatch[1].trim(); continue }
    const taskMatch = line.match(/^-\s+\[ \]\s+(.+)/)
    if (taskMatch) tasks.push({ text: taskMatch[1].trim(), section })
  }
  return tasks
}
