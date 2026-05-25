import { useState } from 'react'
import Avatar from './Avatar.jsx'

const currentYear = new Date().getFullYear()
const getAge = (p) => p.birthYear ? currentYear - p.birthYear : p.age

export default function ProfileCard({ profile, onOpen, onLike, isOwn }) {
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
        background: '#fff',
        borderRadius: 18,
        overflow: 'hidden',
        cursor: 'pointer',
        transform: pressed ? 'scale(0.98)' : 'scale(1)',
        transition: 'transform 0.12s ease',
        boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
        display: 'flex',
      }}
    >
      {/* 왼쪽 사진/아바타 */}
      <div style={{
        width: 88, flexShrink: 0,
        background: 'linear-gradient(145deg, #FFE4EE, #FFD0E3)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '16px 0', position: 'relative',
      }}>
        {mainPhoto
          ? <img src={mainPhoto} alt={profile.name} style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }} />
          : <Avatar name={profile.name} size={58} />
        }
        {isOwn && (
          <div style={{ position: 'absolute', top: 6, left: 6, background: '#FF3B7A', borderRadius: 6, padding: '2px 6px', fontSize: 9, fontWeight: 700, color: '#fff' }}>내 글</div>
        )}
        <div style={{ marginTop: 6, fontSize: 11, color: '#FF3B7A', fontWeight: 600 }}>
          {profile.gender === '남' ? '♂' : '♀'}
        </div>
        {profile.matchmakerName && (
          <div style={{ fontSize: 9, color: '#8e8e93', marginTop: 2, textAlign: 'center', padding: '0 4px' }}>
            💕{profile.matchmakerName}
          </div>
        )}
      </div>

      {/* 오른쪽 정보 */}
      <div style={{ flex: 1, padding: '14px 14px 14px 12px', display: 'flex', flexDirection: 'column', gap: 5, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 17, color: '#1c1c1e', letterSpacing: -0.3 }}>{profile.name}</div>
            <div style={{ fontSize: 13, color: '#8e8e93', marginTop: 2 }}>
              {profile.birthYear ? `${profile.birthYear}년생` : `${age}세`}
              {(profile.city || profile.region) && ` · ${profile.city || profile.region}`}
            </div>
          </div>
          <button
            onClick={e => { e.stopPropagation(); onLike(profile.id, profile.liked) }}
            style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', padding: '0 0 0 8px', lineHeight: 1, flexShrink: 0 }}
          >
            {profile.liked ? '❤️' : '🤍'}
          </button>
        </div>

        {/* 태그 */}
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {[
            profile.job && { text: profile.job, bg: '#F2F2F7', color: '#3a3a3c' },
            profile.heightRange && { text: `${profile.heightRange}cm`, bg: '#EDF3FF', color: '#1565C0' },
            profile.mbti && { text: profile.mbti, bg: '#F3EDFF', color: '#6A1B9A' },
          ].filter(Boolean).map((tag, i) => (
            <span key={i} style={{ display: 'inline-block', background: tag.bg, color: tag.color, borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600 }}>
              {tag.text}
            </span>
          ))}
        </div>

        {profile.workplace && (
          <div style={{ fontSize: 12, color: '#8e8e93' }}>🏢 {profile.workplace}</div>
        )}

        {profile.intro && (
          <p style={{ margin: 0, fontSize: 13, color: '#636366', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {profile.intro}
          </p>
        )}

        {profile.idealDesc && (
          <div style={{ paddingTop: 6, borderTop: '1px solid #f2f2f7', fontSize: 11, color: '#aeaeb2', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
            💝 {profile.idealDesc}
          </div>
        )}
      </div>
    </div>
  )
}
