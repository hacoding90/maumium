import { useState, useEffect } from 'react'
import { collection, onSnapshot, doc, updateDoc, query, orderBy } from 'firebase/firestore'
import { db } from '../firebase.js'
import Avatar from './Avatar.jsx'

const ROLES = ['일반회원', '주선자1', '주선자2', '주선자3', '주선자4', '주선자5']

const ROLE_COLORS = {
  'admin':  { bg: '#fde8ef', text: '#c94070', label: '관리자' },
  '주선자1': { bg: '#e8f0fa', text: '#2a5a9a', label: '주선자1' },
  '주선자2': { bg: '#ddf5e8', text: '#1a7a4a', label: '주선자2' },
  '주선자3': { bg: '#f5eddd', text: '#8a6010', label: '주선자3' },
  '주선자4': { bg: '#ecddf5', text: '#7a2a9a', label: '주선자4' },
  '주선자5': { bg: '#ddf0f5', text: '#1a6a7a', label: '주선자5' },
  '일반회원': { bg: '#f0f0f0', text: '#666666', label: '일반회원' },
}

function RoleBadge({ role }) {
  const c = ROLE_COLORS[role] || ROLE_COLORS['일반회원']
  return (
    <span style={{
      display: 'inline-block', background: c.bg, color: c.text,
      borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 700,
    }}>
      {c.label}
    </span>
  )
}

export default function RoleManager() {
  const [users, setUsers] = useState([])
  const [saving, setSaving] = useState(null) // 저장 중인 userId
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState(null)

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), snap => {
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [])

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2000)
  }

  const handleRoleChange = async (userId, newRole) => {
    setSaving(userId)
    try {
      const role = newRole === '일반회원' ? null : newRole
      await updateDoc(doc(db, 'users', userId), { role: role || null })
      showToast(`✓ 권한이 "${newRole}"로 변경되었습니다.`)
    } catch (e) {
      showToast('❌ 권한 변경에 실패했습니다.')
    } finally {
      setSaving(null)
    }
  }

  const filtered = users.filter(u => {
    const q = search.trim()
    return !q || u.displayName?.includes(q) || u.email?.includes(q)
  })

  // 역할 순서 정렬 (관리자 → 주선자 → 일반)
  const sorted = [...filtered].sort((a, b) => {
    const order = { admin: 0, 주선자1: 1, 주선자2: 2, 주선자3: 3, 주선자4: 4, 주선자5: 5 }
    return (order[a.role] ?? 99) - (order[b.role] ?? 99)
  })

  return (
    <div>
      {/* 안내 */}
      <div style={{ background: '#fdf6f9', borderRadius: 16, padding: '16px 20px', marginBottom: 24, border: '1px solid #f5e0e8' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#c97090', marginBottom: 8 }}>💡 권한 안내</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8 }}>
          {[
            { role: 'admin', desc: '모든 권한' },
            { role: '주선자1', desc: '프로필 등록/수정/삭제 + 매칭' },
            { role: '주선자2', desc: '프로필 등록/수정/삭제 + 매칭' },
            { role: '주선자3', desc: '프로필 등록/수정/삭제 + 매칭' },
            { role: '일반회원', desc: '이성 프로필 열람만 가능' },
          ].map(r => (
            <div key={r.role} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <RoleBadge role={r.role} />
              <span style={{ fontSize: 11, color: '#9c6278' }}>{r.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 검색 */}
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="🔍 이름 또는 이메일 검색..."
        style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1.5px solid #f0dce6', fontSize: 13, color: '#3a1e28', outline: 'none', background: '#fff', marginBottom: 16, boxSizing: 'border-box' }}
      />

      {/* 사용자 목록 */}
      <div style={{ fontSize: 13, fontWeight: 700, color: '#9c6278', marginBottom: 12 }}>
        👥 가입 사용자 ({users.length}명)
      </div>

      {sorted.length === 0
        ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#c0a0b0' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>👥</div>
            <div style={{ fontSize: 14 }}>아직 가입한 사용자가 없습니다</div>
          </div>
        )
        : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {sorted.map(u => (
              <div key={u.id} style={{
                background: '#fff', borderRadius: 16, padding: '14px 18px',
                border: '1px solid #f5e0e8', display: 'flex', alignItems: 'center', gap: 14,
                boxShadow: '0 2px 8px rgba(180,80,100,0.05)',
              }}>
                <Avatar name={u.displayName || u.email || '?'} size={44} />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#2d1a22', marginBottom: 2 }}>
                    {u.displayName || '이름 없음'}
                  </div>
                  <div style={{ fontSize: 12, color: '#b08898', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {u.email}
                  </div>
                  <div style={{ marginTop: 4 }}>
                    <RoleBadge role={u.role || '일반회원'} />
                    {u.gender && (
                      <span style={{ fontSize: 11, color: '#b08898', marginLeft: 8 }}>
                        {u.gender === '여' ? '♀ 여성' : '♂ 남성'}
                      </span>
                    )}
                  </div>
                </div>

                {/* 관리자는 역할 변경 불가 */}
                {u.role === 'admin'
                  ? <div style={{ fontSize: 12, color: '#c97090', fontWeight: 600 }}>관리자</div>
                  : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {saving === u.id && (
                        <span style={{ fontSize: 12, color: '#c97090' }}>저장 중...</span>
                      )}
                      <select
                        value={u.role || '일반회원'}
                        onChange={e => handleRoleChange(u.id, e.target.value)}
                        disabled={saving === u.id}
                        style={{
                          padding: '7px 12px', borderRadius: 10, border: '1.5px solid #f0dce6',
                          fontSize: 13, color: '#3a1e28', background: '#fff', cursor: 'pointer',
                          outline: 'none', fontWeight: 600,
                        }}
                      >
                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                  )
                }
              </div>
            ))}
          </div>
        )
      }

      {/* 토스트 */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)',
          background: '#2d1a22', color: '#fff', padding: '12px 24px', borderRadius: 16,
          fontSize: 14, fontWeight: 600, zIndex: 9999,
        }}>
          {toast}
        </div>
      )}
    </div>
  )
}
