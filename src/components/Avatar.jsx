const COLORS = [
  { bg: '#fde8ef', text: '#c94070' },
  { bg: '#dce8f5', text: '#2a5a9a' },
  { bg: '#ddf5e8', text: '#1a7a4a' },
  { bg: '#f5eddd', text: '#8a6010' },
  { bg: '#ecddf5', text: '#7a2a9a' },
  { bg: '#ddf0f5', text: '#1a6a7a' },
]

function getColor(name = '') {
  let hash = 0
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) % COLORS.length
  return COLORS[hash]
}

export default function Avatar({ name = '?', size = 84 }) {
  const { bg, text } = getColor(name)
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: bg, color: text,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 700, flexShrink: 0,
      userSelect: 'none', border: '2px solid rgba(255,255,255,0.8)',
    }}>
      {(name || '?')[0]}
    </div>
  )
}
