import { useState, useEffect, useRef } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import {
  collection, onSnapshot, addDoc, updateDoc, deleteDoc,
  doc, serverTimestamp, query, orderBy, setDoc, getDoc,
} from 'firebase/firestore'
import { db, auth, ADMIN_EMAILS } from './firebase.js'
import LoginPage from './components/LoginPage.jsx'
import ProfileCard from './components/ProfileCard.jsx'
import ProfileModal from './components/ProfileModal.jsx'
import RegisterForm from './components/RegisterForm.jsx'
import MatchingTab from './components/MatchingTab.jsx'
import GenderSetup from './components/GenderSetup.jsx'
import RoleManager from './components/RoleManager.jsx'
import Avatar from './components/Avatar.jsx'

const JUSEONJA_ROLES = ['주선자1', '주선자2', '주선자3', '주선자4', '주선자5']

function Toast({ msg }) {
  if (!msg) return null
  return (
    <div style={{
      position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)',
      background: '#2d1a22', color: '#fff', padding: '12px 28px', borderRadius: 16,
      fontSize: 14, fontWeight: 600, zIndex: 9999,
    }}>
      {msg}
    </div>
  )
}

function Loading({ text = '로딩 중...' }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fdf6f8' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 40 }}>🌸</div>
        <div style={{ fontSize: 13, color: '#b08898', marginTop: 8 }}>{text}</div>
      </div>
    </div>
  )
}

export default function App() {
  const [authState, setAuthState]       = useState('loading')
  const [user, setUser]                 = useState(null)
  const [isAdmin, setIsAdmin]           = useState(false)
  const [isJuseonja, setIsJuseonja]     = useState(false)
  const [userRole, setUserRole]         = useState(null)
  const [userGender, setUserGender]     = useState(null)
  const [genderSaving, setGenderSaving] = useState(false)

  const [view, setView]                 = useState('browse')
  const [tab, setTab]                   = useState('profiles')
  const [profiles, setProfiles]         = useState([])
  const [matchings, setMatchings]       = useState([])
  const [selected, setSelected]         = useState(null)
  const [filterGender, setFilterGender] = useState('전체')
  const [search, setSearch]             = useState('')
  const [formLoading, setFormLoading]   = useState(false)
  const [toast, setToast]               = useState(null)

  const unsubProfiles  = useRef(null)
  const unsubMatchings = useRef(null)

  // ── 인증 상태 감지 ──────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      unsubProfiles.current?.()
      unsubMatchings.current?.()

      if (!u) {
        setUser(null); setIsAdmin(false); setIsJuseonja(false)
        setUserRole(null); setUserGender(null)
        setAuthState('loggedOut')
        return
      }

      setUser(u)
      setAuthState('loading')

      const adminByEmail = ADMIN_EMAILS.includes(u.email)

      try {
        const snap = await getDoc(doc(db, 'users', u.uid))

        if (adminByEmail) {
          await setDoc(doc(db, 'users', u.uid), {
            role: 'admin', email: u.email,
            displayName: u.displayName || '',
            updatedAt: serverTimestamp(),
          }, { merge: true })
          setUserRole('admin')
          setIsAdmin(true)
          setIsJuseonja(false)
          setAuthState('ready')
          return
        }

        if (snap.exists() && snap.data()?.gender) {
          const data = snap.data()
          const role = data.role || null
          setUserRole(role)
          setIsAdmin(false)
          setIsJuseonja(JUSEONJA_ROLES.includes(role))
          setUserGender(data.gender)
          setAuthState('ready')
        } else {
          // 첫 로그인 또는 성별 미설정
          const role = snap.exists() ? snap.data()?.role || null : null
          setUserRole(role)
          setIsAdmin(false)
          setIsJuseonja(JUSEONJA_ROLES.includes(role))
          setAuthState('needGender')
        }
      } catch (err) {
        console.error('사용자 정보 로드 실패:', err)
        if (adminByEmail) {
          setIsAdmin(true)
          setAuthState('ready')
        } else {
          setAuthState('needGender')
        }
      }
    })
    return unsub
  }, [])

  // ── 프로필 구독 ──────────────────────────────────
  useEffect(() => {
    if (authState !== 'ready' || !user) return
    const q = query(collection(db, 'profiles'), orderBy('createdAt', 'desc'))
    unsubProfiles.current = onSnapshot(q, snap => {
      setProfiles(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return () => unsubProfiles.current?.()
  }, [authState, user])

  // ── 매칭 구독 ────────────────────────────────────
  useEffect(() => {
    if (authState !== 'ready' || !user) return
    if (!isAdmin && !isJuseonja) return
    const q = query(collection(db, 'matchings'), orderBy('createdAt', 'desc'))
    unsubMatchings.current = onSnapshot(q, snap => {
      setMatchings(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return () => unsubMatchings.current?.()
  }, [authState, user, isAdmin, isJuseonja])

  // ── 성별 저장 ────────────────────────────────────
  const handleGenderSelect = async (gender) => {
    if (!user || genderSaving) return
    setGenderSaving(true)
    try {
      await setDoc(doc(db, 'users', user.uid), {
        gender, email: user.email,
        displayName: user.displayName || '',
        role: null,
        createdAt: serverTimestamp(),
      }, { merge: true })
      setUserGender(gender)
      setAuthState('ready')
    } catch {
      alert('성별 저장에 실패했습니다.')
    } finally {
      setGenderSaving(false)
    }
  }

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500) }

  const handleLike = async (id, currentLiked) => {
    try {
      await updateDoc(doc(db, 'profiles', id), { liked: !currentLiked })
      setSelected(prev => prev?.id === id ? { ...prev, liked: !currentLiked } : prev)
    } catch { showToast('❌ 오류가 발생했습니다.') }
  }

  const handleDelete = async (id) => {
    try { await deleteDoc(doc(db, 'profiles', id)); showToast('🗑️ 삭제되었습니다.') }
    catch { showToast('❌ 삭제 실패했습니다.') }
  }

  const handleSubmit = async (formData) => {
    setFormLoading(true)
    try {
      await addDoc(collection(db, 'profiles'), { ...formData, liked: false, createdAt: serverTimestamp() })
      showToast('✓ 프로필이 등록되었습니다! 💕')
      setView('browse')
    } catch { showToast('❌ 등록 실패했습니다.') }
    finally { setFormLoading(false) }
  }

  const handleLogout = async () => {
    unsubProfiles.current?.(); unsubMatchings.current?.()
    await signOut(auth)
    setUser(null); setIsAdmin(false); setIsJuseonja(false)
    setUserRole(null); setUserGender(null)
    setAuthState('loggedOut')
    setProfiles([]); setMatchings([])
  }

  // ── 화면 분기 ────────────────────────────────────
  if (authState === 'loading')    return <Loading text={user ? '사용자 정보 확인 중...' : '로딩 중...'} />
  if (authState === 'loggedOut')  return <LoginPage />
  if (authState === 'needGender') return <GenderSetup onSelect={handleGenderSelect} loading={genderSaving} />

  const canWrite = isAdmin || isJuseonja
  const oppositeGender = userGender === '여' ? '남' : '여'

  const filtered = profiles.filter(p => {
    if (!canWrite && p.gender !== oppositeGender) return false
    if (canWrite && filterGender !== '전체' && p.gender !== filterGender) return false
    const q = search.trim()
    if (q && !p.name?.includes(q) && !p.job?.includes(q) && !p.region?.includes(q)) return false
    return true
  })

  const likedCount = profiles.filter(p => p.liked).length

  const tabs = [
    { key: 'profiles', label: '💕 프로필' },
    ...(canWrite ? [{ key: 'matching', label: '📋 매칭 이력' }] : []),
    ...(isAdmin ? [{ key: 'roles', label: '🔑 권한 관리' }] : []),
  ]

  const roleBadge = isAdmin
    ? { label: '관리자', bg: '#e05a7a', color: '#fff' }
    : isJuseonja ? { label: userRole, bg: '#3a6fa8', color: '#fff' }
    : null

  return (
    <div style={{ minHeight: '100vh', background: '#fdf6f8' }}>
      <div style={{ background: 'rgba(255,255,255,0.94)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #f5e0e8', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 22 }}>🌸</span>
            <span style={{ fontWeight: 800, fontSize: 18, color: '#c94070' }}>마음이음</span>
            {roleBadge && <span style={{ fontSize: 11, color: roleBadge.color, background: roleBadge.bg, padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>{roleBadge.label}</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {view === 'browse' && canWrite && tab === 'profiles' && (
              <button onClick={() => setView('register')} style={{ background: '#e05a7a', color: '#fff', border: 'none', borderRadius: 12, padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>+ 등록</button>
            )}
            {view === 'register' && (
              <button onClick={() => setView('browse')} style={{ background: 'none', border: 'none', color: '#b08898', fontSize: 13, cursor: 'pointer' }}>← 목록</button>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {user.photoURL ? <img src={user.photoURL} style={{ width: 32, height: 32, borderRadius: '50%' }} alt="" /> : <Avatar name={user.displayName || '?'} size={32} />}
              <span style={{ fontSize: 12, color: '#9c6278', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.displayName || user.email}</span>
              <button onClick={handleLogout} style={{ background: 'none', border: '1px solid #f0dce6', borderRadius: 8, padding: '5px 10px', fontSize: 12, color: '#b08898', cursor: 'pointer' }}>로그아웃</button>
            </div>
          </div>
        </div>
        {view === 'browse' && (
          <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 20px', display: 'flex', borderTop: '1px solid #f5e0e8' }}>
            {tabs.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} style={{ padding: '12px 20px', background: 'none', border: 'none', borderBottom: tab === t.key ? '2px solid #e05a7a' : '2px solid transparent', color: tab === t.key ? '#e05a7a' : '#b08898', fontSize: 13, fontWeight: tab === t.key ? 700 : 500, cursor: 'pointer' }}>
                {t.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 20px' }}>
        {view === 'register' && (
          <div style={{ maxWidth: 520, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🌸</div>
              <div style={{ fontWeight: 700, fontSize: 20, color: '#2d1a22', marginBottom: 6 }}>프로필 등록</div>
              <div style={{ fontSize: 13, color: '#b08898' }}>소중한 인연을 위해 정성껏 작성해 주세요</div>
            </div>
            <RegisterForm onSubmit={handleSubmit} onCancel={() => setView('browse')} loading={formLoading} />
          </div>
        )}

        {view === 'browse' && tab === 'profiles' && (
          <>
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
              {[
                { emoji: '💕', label: '전체 회원', value: `${profiles.length}명` },
                { emoji: '❤️', label: '관심 표현', value: `${likedCount}명` },
                ...(canWrite ? [{ emoji: '💝', label: '매칭 이력', value: `${matchings.length}건` }] : []),
              ].map(s => (
                <div key={s.label} style={{ background: '#fff', borderRadius: 14, padding: '10px 18px', border: '1px solid #f5e0e8', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 20 }}>{s.emoji}</span>
                  <div>
                    <div style={{ fontSize: 11, color: '#b08898' }}>{s.label}</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#c94070' }}>{s.value}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 이름, 직업, 지역 검색..." style={{ flex: 1, minWidth: 160, padding: '9px 14px', borderRadius: 12, border: '1.5px solid #f0dce6', fontSize: 13, color: '#3a1e28', outline: 'none', background: '#fff' }} />
              {canWrite && ['전체', '여', '남'].map(g => (
                <button key={g} onClick={() => setFilterGender(g)} style={{ padding: '8px 18px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: `1.5px solid ${filterGender === g ? '#e05a7a' : '#f0dce6'}`, background: filterGender === g ? '#e05a7a' : '#fff', color: filterGender === g ? '#fff' : '#b08898' }}>
                  {g === '전체' ? '전체' : g === '여' ? '♀ 여성' : '♂ 남성'}
                </button>
              ))}
            </div>
            {!canWrite && (
              <div style={{ background: '#fdf6f9', borderRadius: 12, padding: '10px 16px', marginBottom: 16, fontSize: 13, color: '#9c6278', border: '1px solid #f5e0e8' }}>
                💡 {oppositeGender === '남' ? '남성' : '여성'} 프로필만 열람 가능합니다.
              </div>
            )}
            {filtered.length === 0
              ? <div style={{ textAlign: 'center', padding: '80px 0', color: '#c0a0b0' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🌸</div>
                  <div style={{ fontSize: 16, fontWeight: 600 }}>{profiles.length === 0 ? '아직 등록된 프로필이 없어요' : '검색 결과가 없습니다'}</div>
                </div>
              : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 18 }}>
                  {filtered.map(p => <ProfileCard key={p.id} profile={p} onOpen={setSelected} onLike={handleLike} isAdmin={canWrite} />)}
                </div>
            }
          </>
        )}

        {view === 'browse' && tab === 'matching' && canWrite && (
          <MatchingTab profiles={profiles} matchings={matchings} isAdmin={canWrite} />
        )}
        {view === 'browse' && tab === 'roles' && isAdmin && <RoleManager />}
      </div>

      {selected && <ProfileModal profile={selected} onClose={() => setSelected(null)} onLike={handleLike} onDelete={handleDelete} isAdmin={canWrite} />}
      <Toast msg={toast} />
    </div>
  )
}
