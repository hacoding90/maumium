import Avatar from './Avatar.jsx'

export default function ProfileModal({ profile, onClose, onLike, onDelete, isAdmin }) {
  if (!profile) return null

  const infoRows = [
    ['나이', `${profile.age}세`],
    ['키', `${profile.height}cm`],
    ['지역', profile.region],
    ['직업', profile.job],
    ['학력', profile.education],
    ['종교', profile.religion],
    ['음주', profile.drink],
    ['흡연', profile.smoke],
    profile.mbti ? ['MBTI', profile.mbti] : null,
  ].filter(Boolean)

  const handleDelete = () => {
    if (window.confirm(`${profile.name}님의 프로필을 삭제할까요?`)) {
      onDelete(profile.id)
      onClose()
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(40,15,25,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: 16,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 24, maxWidth: 480, width: '100%',
          maxHeight: '90vh', overflowY: 'auto',
          boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
        }}
      >
        <div style={{
          background: 'linear-gradient(135deg,#fdf0f4,#f0d8e8)',
          padding: '32px 24px 20px', borderRadius: '24px 24px 0 0',
          display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative',
        }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: 14, right: 14,
              background: 'rgba(255,255,255,0.7)', border: 'none', borderRadius: '50%',
              width: 32, height: 32, cursor: 'pointer', fontSize: 18, color: '#9c6278',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >×</button>
          <Avatar name={profile.name} size={100} />
          <div style={{ marginTop: 12, fontWeight: 700, fontSize: 20, color: '#2d1a22' }}>
            {profile.name}
          </div>
          <div style={{ fontSize: 14, color: '#9c6278', marginTop: 3 }}>
            {profile.gender === '남' ? '♂ 남성' : '♀ 여성'} · {profile.age}세 · {profile.region}
          </div>
          <button
            onClick={() => onLike(profile.id, profile.liked)}
            style={{
              marginTop: 14,
              background: profile.liked ? '#e05a7a' : '#fff',
              color: profile.liked ? '#fff' : '#e05a7a',
              border: '1.5px solid #e05a7a', borderRadius: 20,
              padding: '8px 24px', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            {profile.liked ? '❤️ 관심 취소' : '🤍 관심 표현'}
          </button>
        </div>

        <div style={{ padding: '20px 24px 28px' }}>
          {profile.intro && (
            <div style={{ background: '#fdf6f9', borderRadius: 14, padding: '14px 16px', marginBottom: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#c97090', letterSpacing: 0.5, marginBottom: 6 }}>자기소개</div>
              <p style={{ margin: 0, fontSize: 14, color: '#4a2535', lineHeight: 1.75 }}>{profile.intro}</p>
            </div>
          )}

          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#c97090', letterSpacing: 0.5, marginBottom: 10 }}>기본 정보</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 10px' }}>
              {infoRows.map(([k, v]) => (
                <div key={k} style={{ background: '#faf7f8', borderRadius: 10, padding: '8px 12px' }}>
                  <div style={{ fontSize: 11, color: '#b08898', marginBottom: 2 }}>{k}</div>
                  <div style={{ fontSize: 14, color: '#3a1e28', fontWeight: 600 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: '#fdf6f9', borderRadius: 14, padding: '14px 16px', marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#c97090', letterSpacing: 0.5, marginBottom: 10 }}>이상형</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 10px', marginBottom: 8 }}>
              {profile.idealAge && <div style={{ fontSize: 13, color: '#5a3040' }}><span style={{ color: '#c97090', fontWeight: 600 }}>나이 </span>{profile.idealAge}</div>}
              {profile.idealHeight && <div style={{ fontSize: 13, color: '#5a3040' }}><span style={{ color: '#c97090', fontWeight: 600 }}>키 </span>{profile.idealHeight}</div>}
            </div>
            {profile.idealJob && <div style={{ fontSize: 13, color: '#5a3040', marginBottom: 6 }}><span style={{ color: '#c97090', fontWeight: 600 }}>직업 </span>{profile.idealJob}</div>}
            {profile.idealDesc && (
              <p style={{ margin: 0, fontSize: 14, color: '#4a2535', lineHeight: 1.7, borderTop: '1px solid #f0dce6', paddingTop: 8, marginTop: 4 }}>
                {profile.idealDesc}
              </p>
            )}
          </div>

          {isAdmin && (
            <button
              onClick={handleDelete}
              style={{
                width: '100%', padding: '10px', borderRadius: 12,
                border: '1px solid #f0dce6', background: '#fff',
                color: '#c08898', fontSize: 13, cursor: 'pointer', fontWeight: 500,
              }}
            >
              🗑️ 프로필 삭제
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
