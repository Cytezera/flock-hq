import path from 'path'

const HOME = process.env.HOME || '/home/iris'
const DB_PATH = path.join(HOME, '.openclaw', 'tasks', 'runs.sqlite')

export interface TaskRun {
  task_id: string
  task: string | null
  label: string | null
  status: string
  task_kind: string | null
  requester_session_key: string | null
  created_at: number
  started_at: number | null
  ended_at: number | null
  terminal_summary: string | null
  terminal_outcome: string | null
  error: string | null
  progress_summary: string | null
}

function parseSource(sessionKey: string | null): string {
  if (!sessionKey) return 'unknown'
  if (sessionKey.includes('discord:channel')) return 'discord #general'
  if (sessionKey.includes('discord:direct')) return 'discord DM'
  if (sessionKey.includes(':main')) return 'webchat'
  return sessionKey.split(':').pop() || 'unknown'
}

export function getTasks(): (TaskRun & { source: string })[] {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Database = require('better-sqlite3')
    const db = new Database(DB_PATH, { readonly: true })
    const rows = db.prepare(
      `SELECT task_id, task, label, status, task_kind, requester_session_key,
              created_at, started_at, ended_at,
              terminal_summary, terminal_outcome, error, progress_summary
       FROM task_runs ORDER BY created_at DESC`
    ).all() as TaskRun[]
    db.close()
    return rows.map(r => ({ ...r, source: parseSource(r.requester_session_key) }))
  } catch {
    return []
  }
}
