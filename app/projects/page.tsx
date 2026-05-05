export default function ProjectsPage() {
  return (
    <div style={{ padding: '40px 32px', maxWidth: 780, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#e2e4ec', margin: 0, marginBottom: 4 }}>
          Projects
        </h1>
        <p style={{ fontSize: 13, color: '#3a4060', margin: 0 }}>
          Active work streams and what moves them forward today.
        </p>
      </div>

      <div style={{
        border: '1px dashed #1c2030', borderRadius: 12, padding: '60px 40px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>🗂</div>
        <div style={{ fontSize: 15, color: '#3a4060', fontWeight: 600, marginBottom: 8 }}>
          No projects defined yet
        </div>
        <div style={{ fontSize: 13, color: '#2a3048', lineHeight: 1.7 }}>
          Projects will live in <code style={{ color: '#7c5cfc', fontSize: 12 }}>~/.openclaw/workspace/projects/</code>
          <br />
          Ask Sparrow to create a project file and it will appear here.
        </div>
      </div>
    </div>
  )
}
