export default function GenderSetup({ onSelect, loading }) {
  return (
    <div style={{
      minHeight: '100vh', background: '#f2f2f7',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>👤</div>
        <h2 style={{ fontSize: 28, fontWeight: 700, color: '#1c1c1e', marginBottom: 8, letterSpacing: -0.5 }}>성별을 선택해주세요</h2>
        <p style={{ fontSize: 15, color: '#8e8e93', lineHeight: 1.5 }}>이성 프로필만 열람할 수 있습니다</p>
      </div>

      <div style={{ width: '100%', maxWidth: 360, display: 'flex', gap: 12 }}>
        {[
          { value: '여', emoji: '♀', label: '여성', sub: '남성 프로필 열람' },
          { value: '남', emoji: '♂', label: '남성', sub: '여성 프로필 열람' },
        ].map(g => (
          <button
            key={g.value}
            onClick={() => !loading && onSelect(g.value)}
            disabled={loading}
            style={{
              flex: 1, padding: '28px 16px', borderRadius: 16,
              border: 'none', background: '#fff',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
              boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
              opacity: loading ? 0.6 : 1,
            }}
          >
            <span style={{ fontSize: 36 }}>{g.emoji}</span>
            <span style={{ fontSize: 18, fontWeight: 700, color: '#1c1c1e' }}>{g.label}</span>
            <span style={{ fontSize: 12, color: '#8e8e93' }}>{g.sub}</span>
          </button>
        ))}
      </div>

      {loading && (
        <div style={{ marginTop: 20, fontSize: 14, color: '#8e8e93' }}>저장 중...</div>
      )}
    </div>
  )
}
