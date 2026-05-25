const COLORS = [
  { bg: '#FFD6E0', text: '#C2185B' },
  { bg: '#D6E4FF', text: '#1565C0' },
  { bg: '#D6F5E3', text: '#1B5E20' },
  { bg: '#FFF3D6', text: '#E65100' },
  { bg: '#EDD6FF', text: '#6A1B9A' },
  { bg: '#D6F0FF', text: '#01579B' },
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
      fontSize: size * 0.4, fontWeight: 600, flexShrink: 0,
      userSelect: 'none', letterSpacing: -0.5,
    }}>
      {(name || '?')[0]}
    </div>
  )
}
