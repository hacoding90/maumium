import { useState, useEffect } from 'react'
import { collection, onSnapshot, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore'
import { db } from '../firebase.js'
import Avatar from './Avatar.jsx'

// 역할 체계: 짱 > 일진 > 일반인
const ROLES = ['일반인', '일진', '짱']
const ROLE_STYLE = {
  '짱':   { bg: '#fde8ef', text: '#c94070', desc: '모든 권한' },
  '일진': { bg: '#e8f0fa', text: '#2a5a9a', desc: '프로필 등록/수정/삭제 + 매칭' },
  '일반인': { bg: '#f0f0f0', text: '#666', desc: '프로필 등록 + 이성 열람' },
}

function RoleBadge({ role }) {
  const s = ROLE_STYLE[role] || ROLE_STYLE['일반인']
  return (
    <span style={{ display: 'inline-block', background: s.bg, color: s.text, borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 700 }}>
      {role || '일반인'}
    </span>
  )
}

export default function RoleManager() {
  const [users, setUsers] = useState([])
  const [saving, setSaving] = useState(null)
  const [editingName, setEditingName] = useState(null)
  const [newName, setNewName] = useState('')
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState(null)

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), snap => {
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [])

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2000) }

  const handleRoleChange = async (userId, newRole) => {
    setSaving(userId)
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole === '일반인' ? null : newRole })
      showToast(`✓ 권한이 "${newRole}"로 변경됐습니다.`)
    } catch { showToast('❌ 변경 실패') }
    finally { setSaving(null) }
  }

  const handleNameSave = async (userId) => {
    if (!newName.trim()) return
    setSaving(userId)
    try {
      await updateDoc(doc(db, 'users', userId), { displayName: newName.trim() })
      showToast('✓ 이름이 수정됐습니다.')
      setEditingName(null)
    } catch { showToast('❌ 수정 실패') }
    finally { setSaving(null) }
  }

  const handleDelete = async (user) => {
    if (!window.confirm(`${user.displayName || user.email}님을 삭제하시겠어요?\n해당 사용자의 가입 정보가 삭제됩니다.`)) return
    try {
      await deleteDoc(doc(db, 'users', user.id))
      showToast('🗑️ 삭제됐습니다.')
    } catch { showToast('❌ 삭제 실패') }
  }

  const filtered = users.filter(u => {
    const q = search.trim()
    return !q || u.displayName?.includes(q) || u.email?.includes(q)
  })

  const sorted = [...filtered].sort((a, b) => {
    const order = { '짱': 0, '일진': 1 }
    return (order[a.role] ?? 99) - (order[b.role] ?? 99)
  })

  return (
    <div>
      {/* 권한 안내 */}
      <div style={{ background: '#fdf6f9', borderRadius: 14, padding: '14px 16px', marginBottom: 20, border: '1px solid #f5e0e8' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#c97090', marginBottom: 10 }}>💡 권한 안내</div>
        {Object.entries(ROLE_STYLE).map(([role, s]) => (
          <div key={role} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <RoleBadge role={role} />
            <span style={{ fontSize: 12, color: '#9c6278' }}>{s.desc}</span>
          </div>
        ))}
      </div>

      {/* 검색 */}
      <input
        value={search} onChange={e => setSearch(e.target.value)}
        placeholder="🔍 이름 또는 이메일 검색..."
        style={{ width: '100%', padding: '11px 14px', borderRadius: 12, border: '1.5px solid #f0dce6', fontSize: 14, color: '#3a1e28', outline: 'none', background: '#fff', marginBottom: 14, boxSizing: 'border-box' }}
      />

      <div style={{ fontSize: 13, fontWeight: 700, color: '#9c6278', marginBottom: 12 }}>👥 가입 사용자 ({users.length}명)</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {sorted.map(u => (
          <div key={u.id} style={{ background: '#fff', borderRadius: 16, padding: '14px 16px', border: '1px solid #f5e0e8', boxShadow: '0 2px 8px rgba(180,80,100,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Avatar name={u.displayName || u.email || '?'} size={40} />
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* 이름 수정 */}
                {editingName === u.id ? (
                  <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
                    <input
                      value={newName} onChange={e => setNewName(e.target.value)}
                      style={{ flex: 1, padding: '6px 10px', borderRadius: 8, border: '1.5px solid #e05a7a', fontSize: 13, outline: 'none' }}
                      autoFocus
                    />
                    <button onClick={() => handleNameSave(u.id)} style={{ padding: '6px 12px', borderRadius: 8, border: 'none', background: '#e05a7a', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>저장</button>
                    <button onClick={() => setEditingName(null)} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #f0dce6', background: '#fff', color: '#b08898', fontSize: 12, cursor: 'pointer' }}>취소</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: '#2d1a22' }}>{u.displayName || '이름 없음'}</span>
                    <button
                      onClick={() => { setEditingName(u.id); setNewName(u.displayName || '') }}
                      style={{ background: 'none', border: 'none', color: '#c0a0b0', fontSize: 11, cursor: 'pointer', padding: '2px 4px' }}
                    >✏️</button>
                  </div>
                )}
                <div style={{ fontSize: 11, color: '#b08898', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</div>
                <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <RoleBadge role={u.role || '일반인'} />
                  {u.gender && <span style={{ fontSize: 11, color: '#b08898' }}>{u.gender === '여' ? '♀' : '♂'}</span>}
                </div>
              </div>

              {/* 권한 변경 + 삭제 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                {u.role !== '짱' && (
                  <select
                    value={u.role || '일반인'}
                    onChange={e => handleRoleChange(u.id, e.target.value)}
                    disabled={saving === u.id}
                    style={{ padding: '6px 10px', borderRadius: 8, border: '1.5px solid #f0dce6', fontSize: 12, color: '#3a1e28', background: '#fff', cursor: 'pointer', outline: 'none' }}
                  >
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                )}
                <button
                  onClick={() => handleDelete(u)}
                  style={{ background: 'none', border: '1px solid #fde8ef', borderRadius: 8, padding: '4px 10px', color: '#e05a7a', fontSize: 11, cursor: 'pointer' }}
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {toast && (
        <div style={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', background: '#2d1a22', color: '#fff', padding: '12px 24px', borderRadius: 16, fontSize: 14, fontWeight: 600, zIndex: 9999 }}>
          {toast}
        </div>
      )}
    </div>
  )
}
