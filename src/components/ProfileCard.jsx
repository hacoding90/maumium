import { useState } from 'react'
import Avatar from './Avatar.jsx'

function Tag({ children, bg = '#f3e8ee', color = '#a0415d' }) {
  return (
    <span style={{ display: 'inline-block', background: bg, color, borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 500 }}>
      {children}
    </span>
  )
}

export default function ProfileCard({ profile, onOpen, onLike, isAdmin }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onClick={() => onOpen(profile)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff', borderRadius: 20,
        boxShadow: hovered ? '0 8px 32px rgba(180,80,100,0.16)' : '0 2px 16px rgba(180,80,100,0.08)',
        border: '1px solid #f5e0e8', cursor: 'pointer',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'all 0.18s', display: 'flex', flexDirection: 'column',
      }}
    >
      <div style={{
        position: 'relative', background: 'linear-gradient(135deg,#fdf0f4,#f5e0ec)',
        padding: '28px 0 16px', display: 'flex', flexDirection: 'column', alignItems: 'center',
        borderRadius: '20px 20px 0 0',
      }}>
        <Avatar name={profile.name} size={84} />
        <button
          onClick={e => { e.stopPropagation(); onLike(profile.id, profile.liked) }}
          style={{
            position: 'absolute', top: 12, right: 14,
            background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%',
            width: 34, height: 34, cursor: 'pointer', fontSize: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
          }}
        >
          {profile.liked ? '❤️' : '🤍'}
        </button>
        <div style={{ marginTop: 10, fontWeight: 700, fontSize: 17, color: '#2d1a22' }}>{profile.name}</div>
        <div style={{ fontSize: 13, color: '#9c6278', marginTop: 2 }}>
          {profile.gender === '남' ? '♂' : '♀'} {profile.age}세 · {profile.region}
        </div>
      </div>
      <div style={{ padding: '14px 18px 18px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <Tag>{profile.job}</Tag>
          <Tag bg="#e8f0fa" color="#2a4a7a">{profile.height}cm</Tag>
          {profile.mbti && <Tag bg="#ede8fa" color="#5a3a9a">{profile.mbti}</Tag>}
        </div>
        <p style={{ margin: 0, fontSize: 13, color: '#6b4458', lineHeight: 1.6, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {profile.intro || '소개글이 없습니다.'}
        </p>
        <div style={{ paddingTop: 10, borderTop: '1px solid #f5e0e8' }}>
          <div style={{ fontSize: 11, color: '#b08898', fontWeight: 600, marginBottom: 4 }}>이상형</div>
          <div style={{ fontSize: 12, color: '#7a4a5e', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {profile.idealDesc || '이상형 정보 없음'}
          </div>
        </div>
      </div>
    </div>
  )
}
