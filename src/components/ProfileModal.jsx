import { useState } from 'react'
import Avatar from './Avatar.jsx'

const currentYear = new Date().getFullYear()
const getAge = (p) => p.birthYear ? currentYear - p.birthYear : p.age

export default function ProfileModal({ profile, onClose, onLike, onDelete, onEdit, canWrite, isOwn }) {
  const [photoIdx, setPhotoIdx] = useState(0)
  if (!profile) return null

  const age = getAge(profile)
  const photos = profile.photos || []
  const canManage = canWrite || isOwn

  const infoRows = [
    ['출생연도', profile.birthYear ? `${profile.birthYear}년생` : '-'],
    ['만 나이', `만 ${age}세`],
    ['키', profile.heightRange ? `${profile.heightRange}cm` : '-'],
    ['지역', [profile.city, profile.region].filter(Boolean).join(' ') || '-'],
    ['직업', profile.job || '-'],
    profile.workplace ? ['직장', profile.workplace] : null,
    ['학력', profile.education || '-'],
    ['종교', profile.religion || '-'],
    ['음주', profile.drink || '-'],
    ['흡연', profile.smoke || '-'],
    profile.mbti ? ['MBTI', profile.mbti] : null,
    profile.instagram ? ['인스타', `@${profile.instagram}`] : null,
    profile.matchmakerName ? ['주선자', profile.matchmakerName] : null,
  ].filter(Boolean)

  const inputStyle = {
    label: { fontSize: 11, color: '#8e8e93', marginBottom: 2, fontWeight: 500 },
    value: { fontSize: 14, color: '#1c1c1e', fontWeight: 600 },
    box: { background: '#f2f2f7', borderRadius: 12, padding: '10px 14px' },
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 1000 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#f2f2f7', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 480, maxHeight: '94vh', overflowY: 'auto' }}>

        {/* 드래그 핸들 */}
        <div style={{ padding: '12px 0 0', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: '#d1d1d6' }} />
        </div>

        {/* 사진 영역 */}
        {photos.length > 0 ? (
          <div style={{ position: 'relative', margin: '12px 16px 0', borderRadius: 16, overflow: 'hidden' }}>
            <img src={photos[photoIdx]} alt={profile.name} style={{ width: '100%', height: 280, objectFit: 'cover', display: 'block' }} />
            {photos.length > 1 && (
              <>
                <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 5 }}>
                  {photos.map((_, i) => (
                    <div key={i} onClick={() => setPhotoIdx(i)} style={{ width: i === photoIdx ? 18 : 5, height: 5, borderRadius: 3, background: i === photoIdx ? '#fff' : 'rgba(255,255,255,0.5)', transition: 'all 0.2s', cursor: 'pointer' }} />
                  ))}
                </div>
                {photoIdx > 0 && <button onClick={() => setPhotoIdx(i => i-1)} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>}
                {photoIdx < photos.length-1 && <button onClick={() => setPhotoIdx(i => i+1)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>}
              </>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12 }}>
            <Avatar name={profile.name} size={90} />
          </div>
        )}

        <div style={{ padding: '16px 16px 40px' }}>

          {/* 이름 카드 */}
          <div style={{ background: '#fff', borderRadius: 16, padding: '16px', marginBottom: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#1c1c1e', letterSpacing: -0.5 }}>{profile.name}</div>
                <div style={{ fontSize: 14, color: '#8e8e93', marginTop: 4 }}>
                  {profile.gender === '남' ? '♂ 남성' : '♀ 여성'} · {profile.birthYear ? `${profile.birthYear}년생` : `${age}세`}
                  {(profile.city || profile.region) && ` · ${profile.city || profile.region}`}
                </div>
                {profile.matchmakerName && <div style={{ fontSize: 12, color: '#FF3B7A', marginTop: 4, fontWeight: 500 }}>💕 주선자: {profile.matchmakerName}</div>}
              </div>
              <button
                onClick={() => onLike(profile.id, profile.liked)}
                style={{ background: profile.liked ? '#FFF0F5' : '#f2f2f7', border: 'none', borderRadius: 12, padding: '10px 14px', fontSize: 20, cursor: 'pointer' }}
              >
                {profile.liked ? '❤️' : '🤍'}
              </button>
            </div>
          </div>

          {/* 자기소개 */}
          {profile.intro && (
            <div style={{ background: '#fff', borderRadius: 16, padding: '16px', marginBottom: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#FF3B7A', marginBottom: 8 }}>자기소개</div>
              <p style={{ margin: 0, fontSize: 14, color: '#1c1c1e', lineHeight: 1.7 }}>{profile.intro}</p>
            </div>
          )}

          {/* 기본정보 */}
          <div style={{ background: '#fff', borderRadius: 16, padding: '16px', marginBottom: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#FF3B7A', marginBottom: 12 }}>기본 정보</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {infoRows.map(([k, v]) => (
                <div key={k} style={{ ...inputStyle.box, gridColumn: (k==='직장'||k==='주선자'||k==='인스타') ? 'span 2' : 'span 1' }}>
                  <div style={inputStyle.label}>{k}</div>
                  <div style={inputStyle.value}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 이상형 */}
          {(profile.idealDesc || profile.idealAge || profile.idealHeight) && (
            <div style={{ background: '#fff', borderRadius: 16, padding: '16px', marginBottom: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#FF3B7A', marginBottom: 12 }}>이상형</div>
              <div style={{ display: 'flex', gap: 16, marginBottom: profile.idealDesc ? 8 : 0 }}>
                {profile.idealAge && <div style={{ fontSize: 13, color: '#1c1c1e' }}><span style={{ color: '#FF3B7A', fontWeight: 600 }}>나이 </span>{profile.idealAge}</div>}
                {profile.idealHeight && <div style={{ fontSize: 13, color: '#1c1c1e' }}><span style={{ color: '#FF3B7A', fontWeight: 600 }}>키 </span>{profile.idealHeight}</div>}
              </div>
              {profile.idealJob && <div style={{ fontSize: 13, color: '#1c1c1e', marginBottom: 6 }}><span style={{ color: '#FF3B7A', fontWeight: 600 }}>직업 </span>{profile.idealJob}</div>}
              {profile.idealDesc && <p style={{ margin: 0, fontSize: 14, color: '#1c1c1e', lineHeight: 1.6 }}>{profile.idealDesc}</p>}
            </div>
          )}

          {/* 관리 버튼 */}
          {canManage && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                onClick={() => onEdit(profile)}
                style={{ width: '100%', padding: '14px', borderRadius: 14, border: 'none', background: '#FF3B7A', color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}
              >
                ✏️ 프로필 수정
              </button>
              {canWrite && (
                <button
                  onClick={() => {
                    const action = profile.hidden ? '다시 표시' : '숨김 처리'
                    if (window.confirm(`${profile.name}님을 ${action}하시겠어요?`)) {
                      onDelete(profile.id, 'toggle', !profile.hidden)
                      onClose()
                    }
                  }}
                  style={{ width: '100%', padding: '14px', borderRadius: 14, border: 'none', background: '#f2f2f7', color: '#636366', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}
                >
                  {profile.hidden ? '👁️ 다시 표시하기' : '🙈 숨김 처리 (애인 생김)'}
                </button>
              )}
              {canWrite && (
                <button
                  onClick={() => { if (window.confirm(`${profile.name}님 프로필을 삭제할까요?`)) { onDelete(profile.id, 'delete'); onClose() } }}
                  style={{ width: '100%', padding: '14px', borderRadius: 14, border: 'none', background: '#fff0f5', color: '#FF3B7A', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}
                >
                  🗑️ 프로필 삭제
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
