export default function GenderSetup({ onSelect, loading }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg,#fdf0f4,#f5e0ec,#fdf6f8)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div style={{
        background: '#fff', borderRadius: 28, padding: '48px 40px',
        maxWidth: 400, width: '100%', textAlign: 'center',
        boxShadow: '0 8px 48px rgba(180,80,100,0.15)',
        border: '1px solid #f5e0e8',
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🌸</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#2d1a22', marginBottom: 8 }}>
          마음이음
        </h2>
        <p style={{ fontSize: 14, color: '#b08898', marginBottom: 36, lineHeight: 1.7 }}>
          이성 프로필만 볼 수 있도록<br />본인의 성별을 선택해주세요
        </p>

        <div style={{ display: 'flex', gap: 14 }}>
          {[
            { value: '여', emoji: '♀', label: '여성', desc: '남성 프로필을 봅니다' },
            { value: '남', emoji: '♂', label: '남성', desc: '여성 프로필을 봅니다' },
          ].map(g => (
            <button
              key={g.value}
              onClick={() => !loading && onSelect(g.value)}
              disabled={loading}
              style={{
                flex: 1, padding: '20px 16px', borderRadius: 16,
                border: '1.5px solid #f0dce6', background: '#fff',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                transition: 'all 0.15s', opacity: loading ? 0.6 : 1,
              }}
              onMouseEnter={e => {
                if (!loading) {
                  e.currentTarget.style.background = '#fdf0f4'
                  e.currentTarget.style.borderColor = '#e05a7a'
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#fff'
                e.currentTarget.style.borderColor = '#f0dce6'
              }}
            >
              <span style={{ fontSize: 28 }}>{g.emoji}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#2d1a22' }}>{g.label}</span>
              <span style={{ fontSize: 11, color: '#b08898' }}>{g.desc}</span>
            </button>
          ))}
        </div>

        {loading && (
          <div style={{ marginTop: 20, fontSize: 13, color: '#c97090' }}>⏳ 저장 중...</div>
        )}

        <p style={{ fontSize: 11, color: '#d0b0c0', marginTop: 24 }}>
          선택 후 변경이 어려우니 신중하게 선택해주세요
        </p>
      </div>
    </div>
  )
}
