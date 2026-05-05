export const dynamic = 'force-dynamic'

import { getTasks } from '@/lib/database'
import { getManualTasks } from '@/lib/workspace'

function statusColor(status: string) {
  switch (status?.toLowerCase()) {
    case 'succeeded': return '#22c55e'
    case 'running':   return '#7c5cfc'
    case 'failed':    return '#ef4444'
    case 'pending':   return '#f97316'
    default:          return '#4b5563'
  }
}

function formatTs(ms: number | null): string {
  if (!ms) return '—'
  return new Date(ms).toLocaleString('en-US', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function duration(start: number | null, end: number | null): string {
  if (!start || !end) return ''
  const s = Math.round((end - start) / 1000)
  if (s < 60) return `${s}s`
  return `${Math.floor(s / 60)}m ${s % 60}s`
}

export default function TasksPage() {
  const tasks = getTasks()
  const manualTasks = getManualTasks()

  const running = tasks.filter(t => t.status?.toLowerCase() === 'running')
  const pending = tasks.filter(t => t.status?.toLowerCase() === 'pending')
  const done    = tasks.filter(t => ['succeeded', 'done'].includes(t.status?.toLowerCase()))
  const failed  = tasks.filter(t => t.status?.toLowerCase() === 'failed')

  return (
    <div style={{ padding: '40px 32px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#e2e4ec', margin: 0, marginBottom: 4 }}>
          Tasks
        </h1>
        <p style={{ fontSize: 13, color: '#3a4060', margin: 0 }}>
          {tasks.length === 0 && manualTasks.length === 0
            ? 'No tasks yet — ask Sparrow to add some.'
            : `${manualTasks.length} queued · ${tasks.length} agent run${tasks.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
        {/* Manual tasks column from TASKS.md */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: '#60a5fa' }}>
              TO BE STARTED
            </span>
            <span style={{
              fontSize: 10, color: '#2a3555', background: '#0f1220',
              padding: '1px 6px', borderRadius: 10, border: '1px solid #1c2030',
            }}>
              {manualTasks.length}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {manualTasks.length === 0 ? (
              <div style={{
                border: '1px dashed #161a26', borderRadius: 8, padding: '20px',
                textAlign: 'center', fontSize: 12, color: '#2a3048',
              }}>
                Empty
              </div>
            ) : manualTasks.map((t, i) => (
              <div key={i} style={{
                background: '#131620', border: '1px solid #1c2030', borderRadius: 8,
                padding: '14px 16px',
              }}>
                <div style={{ fontSize: 13, color: '#c8ccdc', lineHeight: 1.55, fontWeight: 500 }}>
                  {t.text}
                </div>
                <div style={{ marginTop: 8 }}>
                  <span style={{
                    fontSize: 9, fontWeight: 700, letterSpacing: '0.1em',
                    color: '#60a5fa', background: '#60a5fa20',
                    padding: '2px 7px', borderRadius: 4,
                  }}>
                    {t.section.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Agent task run columns */}
        {[
            { label: 'RUNNING', items: running, accent: '#7c5cfc' },
            { label: 'PENDING', items: pending, accent: '#f97316' },
            { label: 'DONE',    items: done,    accent: '#22c55e' },
            { label: 'FAILED',  items: failed,  accent: '#ef4444' },
          ].map(col => (
            <div key={col.label} style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: col.accent }}>
                  {col.label}
                </span>
                <span style={{
                  fontSize: 10, color: '#2a3555', background: '#0f1220',
                  padding: '1px 6px', borderRadius: 10, border: '1px solid #1c2030',
                }}>
                  {col.items.length}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {col.items.length === 0 ? (
                  <div style={{
                    border: '1px dashed #161a26', borderRadius: 8, padding: '20px',
                    textAlign: 'center', fontSize: 12, color: '#2a3048',
                  }}>
                    Empty
                  </div>
                ) : col.items.map(task => {
                  const taskText = task.task || task.label || task.task_id
                  const dur = duration(task.started_at, task.ended_at)

                  return (
                    <div
                      key={task.task_id}
                      style={{
                        background: '#131620', border: '1px solid #1c2030', borderRadius: 8,
                        padding: '14px 16px',
                      }}
                    >
                      {/* Task text — the actual instruction */}
                      <div style={{
                        fontSize: 13, color: '#c8ccdc', lineHeight: 1.55,
                        marginBottom: 10, fontWeight: 500,
                      }}>
                        {taskText}
                      </div>

                      {/* Outcome / summary */}
                      {task.terminal_summary && task.terminal_summary !== 'completed' && (
                        <div style={{
                          fontSize: 11, color: '#5a6278', marginBottom: 10,
                          lineHeight: 1.5, borderLeft: '2px solid #1c2030', paddingLeft: 8,
                        }}>
                          {task.terminal_summary}
                        </div>
                      )}

                      {/* Meta row */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{
                          fontSize: 9, fontWeight: 700, letterSpacing: '0.1em',
                          color: statusColor(task.status),
                          background: statusColor(task.status) + '20',
                          padding: '2px 7px', borderRadius: 4,
                        }}>
                          {task.status.toUpperCase()}
                        </span>

                        {task.source && (
                          <span style={{
                            fontSize: 10, color: '#3a4060',
                            background: '#0f1220', padding: '1px 6px',
                            borderRadius: 4, border: '1px solid #1c2030',
                          }}>
                            {task.source}
                          </span>
                        )}

                        <span style={{ fontSize: 10, color: '#2a3048', fontFamily: 'monospace' }}>
                          {formatTs(task.created_at)}
                        </span>

                        {dur && (
                          <span style={{ fontSize: 10, color: '#2a3048' }}>· {dur}</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}
