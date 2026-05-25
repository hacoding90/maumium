import { useState } from 'react'
import Avatar from './Avatar.jsx'

const currentYear = new Date().getFullYear()
const getAge = (p) => p.birthYear ? currentYear - p.birthYear : p.age

export default function ProfileModal({ profile, onClose, onLike, onDelete, onEdit, canWrite }) {
  const [photoIdx, setPhotoIdx] = useState(0)
  if (!profile) return null

  const age = getAge(profile)
  const photos = profile.photos || []

  const infoRows = [
    ['출생연도', profile.birthYear ? `${profile.birthYear}년생` : '-'],
    ['만 나이', `만 ${age}세`],
    ['키', profile.heightRange ? `${profile.heightRange}cm` : '-'],
    ['지역', [profile.city, profile.region].filter(Boolean).join(', ') || '-'],
    ['직업', profile.job],
    profile.workplace ? ['직장', profile.workplace] : null,
    ['학력', profile.education],
    ['종교', profile.religion],
    ['음주', profile.drink],
    ['흡연', profile.smoke],
    profile.mbti ? ['MBTI', profile.mbti] : null,
    profile.instagram ? ['인스타', `@${profile.instagram}`] : null,
    profile.matchmakerName ? ['주선자', profile.matchmakerName] : null,
  ].filter(Boolean)

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(40,15,25,0.6)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 1000 }}>
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: '24px 24px 0 0', width: '100%', maxWidth: 480, maxHeight: '92vh', overflowY: 'auto' }}
      >
        {/* 사진 슬라이더 */}
        {photos.length > 0 ? (
          <div style={{ position: 'relative', background: '#f5e0e8' }}>
            <img src={photos[photoIdx]} alt={profile.name} style={{ width: '100%', height: 300, objectFit: 'cover' }} />
            {photos.length > 1 && (
              <>
                <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
                  {photos.map((_, i) => (
                    <div key={i} onClick={() => setPhotoIdx(i)} style={{ width: i === photoIdx ? 20 : 6, height: 6, borderRadius: 3, background: i === photoIdx ? '#fff' : 'rgba(255,255,255,0.5)', transition: 'all 0.2s', cursor: 'pointer' }} />
                  ))}
                </div>
                {photoIdx > 0 && <button onClick={() => setPhotoIdx(i => i-1)} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.7)', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', fontSize: 16 }}>‹</button>}
                {photoIdx < photos.length-1 && <button onClick={() => setPhotoIdx(i => i+1)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.7)', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', fontSize: 16 }}>›</button>}
              </>
            )}
            <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
          </div>
        ) : (
          <div style={{ background: 'linear-gradient(135deg,#fdf0f4,#f0d8e8)', padding: '32px 0 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
            <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 14, background: 'rgba(255,255,255,0.7)', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            <Avatar name={profile.name} size={90} />
          </div>
        )}

        <div style={{ padding: '20px 20px 32px' }}>
          {/* 이름/기본 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 22, color: '#2d1a22' }}>{profile.name}</div>
              <div style={{ fontSize: 14, color: '#9c6278', marginTop: 3 }}>
                {profile.gender === '남' ? '♂ 남성' : '♀ 여성'} · {profile.birthYear ? `${profile.birthYear}년생` : `${age}세`}
                {profile.city ? ` · ${profile.city}` : profile.region ? ` · ${profile.region}` : ''}
              </div>
              {profile.matchmakerName && (
                <div style={{ fontSize: 12, color: '#c97090', marginTop: 4 }}>💕 주선자: {profile.matchmakerName}</div>
              )}
            </div>
            <button onClick={() => onLike(profile.id, profile.liked)} style={{ background: profile.liked ? '#fde8ef' : '#fafafa', border: `1.5px solid ${profile.liked ? '#e05a7a' : '#f0dce6'}`, borderRadius: 12, padding: '8px 14px', fontSize: 20, cursor: 'pointer' }}>
              {profile.liked ? '❤️' : '🤍'}
            </button>
          </div>

          {/* 자기소개 */}
          {profile.intro && (
            <div style={{ background: '#fdf6f9', borderRadius: 14, padding: '12px 14px', marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#c97090', marginBottom: 5 }}>자기소개</div>
              <p style={{ margin: 0, fontSize: 14, color: '#4a2535', lineHeight: 1.75 }}>{profile.intro}</p>
            </div>
          )}

          {/* 기본정보 그리드 */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#c97090', marginBottom: 10 }}>기본 정보</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 10px' }}>
              {infoRows.map(([k, v]) => (
                <div key={k} style={{ background: '#faf7f8', borderRadius: 10, padding: '8px 12px', gridColumn: (k==='직장'||k==='주선자'||k==='인스타') ? 'span 2' : 'span 1' }}>
                  <div style={{ fontSize: 11, color: '#b08898', marginBottom: 2 }}>{k}</div>
                  <div style={{ fontSize: 13, color: '#3a1e28', fontWeight: 600 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 이상형 */}
          {(profile.idealDesc || profile.idealAge || profile.idealHeight) && (
            <div style={{ background: '#fdf6f9', borderRadius: 14, padding: '12px 14px', marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#c97090', marginBottom: 8 }}>이상형</div>
              <div style={{ display: 'flex', gap: 16, marginBottom: 6 }}>
                {profile.idealAge && <div style={{ fontSize: 13, color: '#5a3040' }}><span style={{ color: '#c97090', fontWeight: 600 }}>나이 </span>{profile.idealAge}</div>}
                {profile.idealHeight && <div style={{ fontSize: 13, color: '#5a3040' }}><span style={{ color: '#c97090', fontWeight: 600 }}>키 </span>{profile.idealHeight}</div>}
              </div>
              {profile.idealJob && <div style={{ fontSize: 13, color: '#5a3040', marginBottom: 4 }}><span style={{ color: '#c97090', fontWeight: 600 }}>직업 </span>{profile.idealJob}</div>}
              {profile.idealDesc && <p style={{ margin: 0, fontSize: 13, color: '#4a2535', lineHeight: 1.7 }}>{profile.idealDesc}</p>}
            </div>
          )}

          {/* 관리자/일진 버튼 */}
          {canWrite && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => onEdit(profile)}
                style={{ flex: 1, padding: '11px', borderRadius: 12, border: '1.5px solid #e05a7a', background: '#fff', color: '#e05a7a', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
              >
                ✏️ 프로필 수정
              </button>
              <button
                onClick={async () => {
                  const action = profile.hidden ? '다시 표시' : '숨김 처리'
                  if (window.confirm(`${profile.name}님을 ${action}하시겠어요?`)) {
                    onDelete(profile.id, 'toggle', !profile.hidden)
                    onClose()
                  }
                }}
                style={{ flex: 1, padding: '11px', borderRadius: 12, border: '1.5px solid #f0dce6', background: '#fff', color: '#b08898', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
              >
                {profile.hidden ? '👁️ 다시 표시' : '🙈 숨김 (애인 생김)'}
              </button>
            </div>
          )}

          {canWrite && (
            <button
              onClick={() => { if (window.confirm(`${profile.name}님의 프로필을 삭제할까요?`)) { onDelete(profile.id, 'delete'); onClose() } }}
              style={{ width: '100%', padding: '10px', borderRadius: 12, border: '1px solid #fde8ef', background: '#fff', color: '#e05a7a', fontSize: 13, cursor: 'pointer', fontWeight: 500, marginTop: 8 }}
            >
              🗑️ 프로필 삭제
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
