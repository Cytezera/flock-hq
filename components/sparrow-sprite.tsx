// Pixel art bird sprites — 16x16 grid, each cell = 3px (48x48 total)

const BIRD_PALETTES: Record<string, Record<number, string>> = {
  sparrow: {
    0: 'transparent',
    1: '#1a0f08',  // outline
    2: '#8B4513',  // chestnut
    3: '#C4956A',  // tan / wing detail
    4: '#F0DFB8',  // cream chest
    5: '#D4841A',  // beak orange
    6: '#FFFFFF',  // eye white
    7: '#5C2508',  // dark cap
  },
  raven: {
    0: 'transparent',
    1: '#05070c',
    2: '#151826',
    3: '#2f3655',
    4: '#454e78',
    5: '#272b38',
    6: '#d8dcff',
    7: '#090b12',
  },
  parrot: {
    0: 'transparent',
    1: '#082416',
    2: '#18a558',
    3: '#6ee7a8',
    4: '#f2e86d',
    5: '#f97316',
    6: '#ffffff',
    7: '#0f6b3c',
  },
  bluejay: {
    0: 'transparent',
    1: '#071426',
    2: '#2563eb',
    3: '#60a5fa',
    4: '#dbeafe',
    5: '#111827',
    6: '#ffffff',
    7: '#1e3a8a',
  },
  crow: {
    0: 'transparent',
    1: '#020617',
    2: '#0f2a5f',
    3: '#1e3a8a',
    4: '#334155',
    5: '#111827',
    6: '#dbeafe',
    7: '#071426',
  },
}

const PALETTE = BIRD_PALETTES.sparrow

// Sparrow — facing left, side profile
const SPARROW: number[][] = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0],
  [0,0,0,0,1,7,7,7,7,7,1,0,0,0,0,0],
  [0,0,0,1,7,7,1,1,7,7,2,1,0,0,0,0],
  [0,0,1,7,1,6,1,1,7,2,2,1,0,0,0,0],
  [0,5,5,1,1,1,1,2,2,2,1,0,0,0,0,0],
  [0,5,1,1,2,2,2,2,2,1,0,0,0,0,0,0],
  [0,0,1,2,2,2,2,2,1,0,0,0,0,0,0,0],
  [0,1,4,4,4,4,4,4,4,4,1,0,0,0,0,0],
  [1,2,2,2,2,2,2,2,2,2,2,1,0,0,0,0],
  [1,2,3,3,2,2,2,2,2,3,2,1,0,0,0,0],
  [0,1,2,3,3,2,2,2,3,3,1,0,0,0,0,0],
  [0,0,1,2,2,2,2,2,2,1,0,0,0,0,0,0],
  [0,0,0,1,2,2,2,2,1,0,0,0,0,0,0,0],
  [0,0,0,0,1,1,0,1,1,0,0,0,0,0,0,0],
  [0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0],
]


interface SpriteProps {
  size?: number  // pixel size multiplier (default 3 → 48x48)
  dim?: boolean
  variant?: string
}

function PixelGrid({ grid, palette, size }: { grid: number[][], palette: Record<number, string>, size: number }) {
  const w = 16 * size
  const rects: React.ReactElement[] = []

  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      const color = palette[grid[row][col]]
      if (!color || color === 'transparent') continue
      rects.push(
        <rect
          key={`${row}-${col}`}
          x={col * size}
          y={row * size}
          width={size}
          height={size}
          fill={color}
        />
      )
    }
  }

  return (
    <svg width={w} height={w} viewBox={`0 0 ${w} ${w}`} style={{ imageRendering: 'pixelated' }}>
      {rects}
    </svg>
  )
}

export function BirdSprite({ size = 3, dim = false, variant = 'sparrow' }: SpriteProps) {
  const basePalette = BIRD_PALETTES[variant] || PALETTE
  const palette = dim
    ? Object.fromEntries(Object.entries(basePalette).map(([k, v]) => [k, v === 'transparent' ? v : '#2a3048']))
    : basePalette
  return <PixelGrid grid={SPARROW} palette={palette} size={size} />
}

export function SparrowSprite(props: SpriteProps) {
  return <BirdSprite {...props} variant="sparrow" />
}

// Generic placeholder bird for undeployed agents
export function AgentPlaceholder({ initial, size = 3 }: { initial: string; size?: number }) {
  const w = 16 * size
  return (
    <div
      style={{ width: w, height: w, background: '#0f1220', border: '1px solid #1c2030', borderRadius: 4 }}
      className="flex items-center justify-center"
    >
      <span style={{ fontSize: size * 4, color: '#2a3555', fontWeight: 700 }}>{initial}</span>
    </div>
  )
}
