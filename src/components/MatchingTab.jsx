import { useState } from 'react'
import { collection, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../firebase.js'
import Avatar from './Avatar.jsx'

export default function MatchingTab({ profiles, matchings, isAdmin }) {
  const [draggedProfile, setDraggedProfile] = useState(null)
  const [dropTargetId, setDropTargetId] = useState(null)
  const [saving, setSaving] = useState(false)

  const handleDragStart = (e, profile) => {
    setDraggedProfile(profile)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDrop = async (e, targetProfile) => {
    e.preventDefault()
    setDropTargetId(null)
    if (!draggedProfile || draggedProfile.id === targetProfile.id) return

    const alreadyMatched = matchings.some(m =>
      (m.fromId === draggedProfile.id && m.toId === targetProfile.id) ||
      (m.fromId === targetProfile.id && m.toId === draggedProfile.id)
    )
    if (alreadyMatched) { alert('이미 매칭된 이력이 있습니다!'); setDraggedProfile(null); return }
    if (!window.confirm(`${draggedProfile.name} ↔ ${targetProfile.name} 매칭 이력을 등록할까요?`)) { setDraggedProfile(null); return }

    setSaving(true)
    try {
      await addDoc(collection(db, 'matchings'), {
        fromId: draggedProfile.id, fromName: draggedProfile.name, fromGender: draggedProfile.gender,
        toId: targetProfile.id, toName: targetProfile.name, toGender: targetProfile.gender,
        createdAt: serverTimestamp(),
      })
    } catch { alert('매칭 등록에 실패했습니다.') }
    finally { setSaving(false); setDraggedProfile(null) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('이 매칭 이력을 삭제할까요?')) return
    try { await deleteDoc(doc(db, 'matchings', id)) }
    catch { alert('삭제에 실패했습니다.') }
  }

  if (!isAdmin) return (
    <div style={{ textAlign: 'center', padding: '80px 0', color: '#c0a0b0' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
      <div style={{ fontSize: 15 }}>관리자만 접근 가능합니다</div>
    </div>
  )

  return (
    <div>
      <div style={{ background: '#fdf6f9', borderRadius: 16, padding: '16px 20px', marginBottom: 24, border: '1px solid #f5e0e8' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#c97090', marginBottom: 6 }}>💡 매칭 방법</div>
        <div style={{ fontSize: 13, color: '#7a4a5e', lineHeight: 1.7 }}>카드를 <strong>드래그</strong>해서 다른 카드 위에 <strong>드롭</strong>하면 매칭 이력이 등록됩니다.</div>
      </div>

      {/* 드래그 영역 */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#9c6278', marginBottom: 12 }}>👥 프로필 목록</div>
        {saving && <div style={{ textAlign: 'center', padding: 12, color: '#c97090', fontSize: 13 }}>⏳ 매칭 등록 중...</div>}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10 }}>
          {profiles.map(p => (
            <div
              key={p.id}
              draggable
              onDragStart={e => handleDragStart(e, p)}
              onDragOver={e => { e.preventDefault(); if (draggedProfile?.id !== p.id) setDropTargetId(p.id) }}
              onDragLeave={() => setDropTargetId(null)}
              onDrop={e => handleDrop(e, p)}
              style={{
                background: dropTargetId === p.id ? '#fdf0f4' : '#fff',
                border: dropTargetId === p.id ? '2px dashed #e05a7a' : '1.5px solid #f5e0e8',
                borderRadius: 14, padding: '12px 10px', cursor: 'grab',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                opacity: draggedProfile?.id === p.id ? 0.4 : 1, transition: 'all 0.15s',
              }}
            >
              <Avatar name={p.name} size={44} />
              <div style={{ fontSize: 13, fontWeight: 700, color: '#2d1a22' }}>{p.name}</div>
              <div style={{ fontSize: 11, color: '#9c6278' }}>{p.gender === '남' ? '♂' : '♀'} {p.age}세</div>
              {dropTargetId === p.id && <div style={{ fontSize: 10, color: '#e05a7a', fontWeight: 700 }}>드롭!</div>}
            </div>
          ))}
        </div>
      </div>

      {/* 매칭 이력 */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#9c6278', marginBottom: 12 }}>💕 소개팅 이력 ({matchings.length}건)</div>
        {matchings.length === 0
          ? <div style={{ textAlign: 'center', padding: '48px 0', color: '#c0a0b0' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>💝</div>
              <div style={{ fontSize: 14 }}>아직 매칭 이력이 없습니다</div>
            </div>
          : <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {matchings.map(m => (
                <div key={m.id} style={{ background: '#fff', borderRadius: 16, padding: '16px 20px', border: '1px solid #f5e0e8', display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                    <Avatar name={m.fromName} size={44} />
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#2d1a22' }}>{m.fromName}</div>
                      <div style={{ fontSize: 12, color: '#9c6278' }}>{m.fromGender === '남' ? '♂' : '♀'}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 20 }}>💕</div>
                    <div style={{ fontSize: 10, color: '#c97090', fontWeight: 600 }}>소개팅</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, justifyContent: 'flex-end' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#2d1a22' }}>{m.toName}</div>
                      <div style={{ fontSize: 12, color: '#9c6278' }}>{m.toGender === '남' ? '♂' : '♀'}</div>
                    </div>
                    <Avatar name={m.toName} size={44} />
                  </div>
                  <button onClick={() => handleDelete(m.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d0a0b0', fontSize: 16 }}>🗑️</button>
                </div>
              ))}
            </div>
        }
      </div>
    </div>
  )
}
