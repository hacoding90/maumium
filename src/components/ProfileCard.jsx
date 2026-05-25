import { useState } from 'react'
import Avatar from './Avatar.jsx'

function Tag({ children, bg = '#f3e8ee', color = '#a0415d' }) {
  return (
    <span style={{ display: 'inline-block', background: bg, color, borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600 }}>
      {children}
    </span>
  )
}

const currentYear = new Date().getFullYear()
const getAge = (p) => p.birthYear ? currentYear - p.birthYear : p.age

export default function ProfileCard({ profile, onOpen, onLike }) {
  const [pressed, setPressed] = useState(false)
  const age = getAge(profile)
  const mainPhoto = profile.photos?.[0]

  return (
    <div
      onClick={() => onOpen(profile)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      style={{
        background: '#fff', borderRadius: 18,
        boxShadow: pressed ? '0 1px 6px rgba(180,80,100,0.1)' : '0 4px 20px rgba(180,80,100,0.1)',
        border: '1px solid #f5e0e8', cursor: 'pointer',
        transform: pressed ? 'scale(0.98)' : 'scale(1)',
        transition: 'all 0.15s', overflow: 'hidden',
        display: 'flex', flexDirection: 'row',
      }}
    >
      {/* 왼쪽 사진/아바타 */}
      <div style={{
        background: 'linear-gradient(160deg,#fdf0f4,#f5d8e8)',
        width: 90, flexShrink: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '16px 0',
      }}>
        {mainPhoto
          ? <img src={mainPhoto} alt={profile.name} style={{ width: 70, height: 70, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.8)' }} />
          : <Avatar name={profile.name} size={60} />
        }
        <div style={{ marginTop: 6, fontSize: 11, color: '#9c6278', fontWeight: 600 }}>
          {profile.gender === '남' ? '♂ 남성' : '♀ 여성'}
        </div>
        {profile.matchmakerName && (
          <div style={{ fontSize: 9, color: '#c97090', marginTop: 2, background: '#fde8ef', padding: '1px 6px', borderRadius: 6, fontWeight: 600 }}>
            💕{profile.matchmakerName}
          </div>
        )}
      </div>

      {/* 오른쪽 정보 */}
      <div style={{ flex: 1, padding: '14px 14px 14px 12px', display: 'flex', flexDirection: 'column', gap: 5, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: '#2d1a22' }}>{profile.name}</div>
            <div style={{ fontSize: 12, color: '#9c6278', marginTop: 1 }}>
              {profile.birthYear ? `${profile.birthYear}년생` : `${age}세`}
              {profile.city ? ` · ${profile.city}` : profile.region ? ` · ${profile.region}` : ''}
            </div>
          </div>
          <button
            onClick={e => { e.stopPropagation(); onLike(profile.id, profile.liked) }}
            style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', padding: '2px', lineHeight: 1, flexShrink: 0 }}
          >
            {profile.liked ? '❤️' : '🤍'}
          </button>
        </div>

        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          <Tag>{profile.job}</Tag>
          {profile.heightRange && <Tag bg="#e8f0fa" color="#2a4a7a">{profile.heightRange}cm</Tag>}
          {profile.mbti && <Tag bg="#ede8fa" color="#5a3a9a">{profile.mbti}</Tag>}
        </div>

        {profile.workplace && (
          <div style={{ fontSize: 12, color: '#9c6278' }}>🏢 {profile.workplace}</div>
        )}

        {profile.intro && (
          <p style={{ margin: 0, fontSize: 12, color: '#7a4a5e', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {profile.intro}
          </p>
        )}

        {profile.idealDesc && (
          <div style={{ paddingTop: 5, borderTop: '1px solid #f5e0e8', fontSize: 11, color: '#b08898', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
            💝 {profile.idealDesc}
          </div>
        )}
      </div>
    </div>
  )
}
