import { useState, useEffect } from 'react'
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
import Avatar from './components/Avatar.jsx'

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

export default function App() {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [userGender, setUserGender] = useState(null)
  const [genderChecked, setGenderChecked] = useState(false)
  const [view, setView] = useState('browse')
  const [tab, setTab] = useState('profiles')
  const [profiles, setProfiles] = useState([])
  const [matchings, setMatchings] = useState([])
  const [selected, setSelected] = useState(null)
  const [filterGender, setFilterGender] = useState('전체')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async u => {
      if (!u) {
        setUser(null); setIsAdmin(false); setUserGender(null)
        setGenderChecked(false); setAuthLoading(false)
        return
      }
      setUser(u)
      const admin = ADMIN_EMAILS.includes(u.email)
      setIsAdmin(admin)
      if (admin) {
        setGenderChecked(true); setAuthLoading(false)
        return
      }
      // 일반 사용자 성별 확인
      try {
        const snap = await getDoc(doc(db, 'users', u.uid))
        if (snap.exists() && snap.data().gender) {
          setUserGender(snap.data().gender)
        } else {
          setUserGender(null) // 성별 선택 화면 표시
        }
      } finally {
        setGenderChecked(true)
        setAuthLoading(false)
      }
    })
    return unsub
  }, [])

  const handleGenderSelect = async (gender) => {
    if (!user) return
    await setDoc(doc(db, 'users', user.uid), {
      gender, email: user.email,
      displayName: user.displayName || '',
      createdAt: serverTimestamp(),
    })
    setUserGender(gender)
  }

  useEffect(() => {
    if (!user) return
    const q = query(collection(db, 'profiles'), orderBy('createdAt', 'desc'))
    return onSnapshot(q, snap => setProfiles(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
  }, [user])

  useEffect(() => {
    if (!user || !isAdmin) return
    const q = query(collection(db, 'matchings'), orderBy('createdAt', 'desc'))
    return onSnapshot(q, snap => setMatchings(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
  }, [user, isAdmin])

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(null), 2500) }

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
    setLoading(true)
    try {
      await addDoc(collection(db, 'profiles'), { ...formData, liked: false, createdAt: serverTimestamp() })
      showToast('✓ 프로필이 등록되었습니다! 💕'); setView('browse')
    } catch { showToast('❌ 등록 실패했습니다.') }
    finally { setLoading(false) }
  }

  const handleLogout = async () => {
    await signOut(auth)
    setUser(null); setIsAdmin(false); setUserGender(null); setGenderChecked(false)
  }

  // 화면 분기
  if (authLoading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fdf6f8' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 40 }}>🌸</div>
        <div style={{ fontSize: 13, color: '#b08898', marginTop: 8 }}>로딩 중...</div>
      </div>
    </div>
  )

  if (!user) return <LoginPage />

  if (!genderChecked) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fdf6f8' }}>
      <div style={{ fontSize: 40 }}>🌸</div>
    </div>
  )

  // 핵심: 일반 사용자이고 성별이 없으면 성별 선택 화면
  if (!isAdmin && !userGender) return <GenderSetup onSelect={handleGenderSelect} />

  const oppositeGender = userGender === '여' ? '남' : '여'
  const filtered = profiles.filter(p => {
    if (!isAdmin && p.gender !== oppositeGender) return false
    if (isAdmin && filterGender !== '전체' && p.gender !== filterGender) return false
    const q = search.trim()
    if (q && !p.name?.includes(q) && !p.job?.includes(q) && !p.region?.includes(q)) return false
    return true
  })
  const likedCount = profiles.filter(p => p.liked).length

  return (
    <div style={{ minHeight: '100vh', background: '#fdf6f8' }}>
      <div style={{ background: 'rgba(255,255,255,0.94)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #f5e0e8', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 22 }}>🌸</span>
            <span style={{ fontWeight: 800, fontSize: 18, color: '#c94070' }}>마음이음</span>
            {isAdmin && <span style={{ fontSize: 11, color: '#fff', background: '#e05a7a', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>관리자</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {view === 'browse' && isAdmin && tab === 'profiles' && (
              <button onClick={() => setView('register')} style={{ background: '#e05a7a', color: '#fff', border: 'none', borderRadius: 12, padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>+ 등록</button>
            )}
            {view === 'register' && (
              <button onClick={() => setView('browse')} style={{ background: 'none', border: 'none', color: '#b08898', fontSize: 13, cursor: 'pointer' }}>← 목록</button>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {user.photoURL ? <img src={user.photoURL} style={{ width: 32, height: 32, borderRadius: '50%' }} alt="프로필" /> : <Avatar name={user.displayName || '?'} size={32} />}
              <button onClick={handleLogout} style={{ background: 'none', border: '1px solid #f0dce6', borderRadius: 8, padding: '5px 10px', fontSize: 12, color: '#b08898', cursor: 'pointer' }}>로그아웃</button>
            </div>
          </div>
        </div>
        {view === 'browse' && (
          <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 20px', display: 'flex', borderTop: '1px solid #f5e0e8' }}>
            <button onClick={() => setTab('profiles')} style={{ padding: '12px 20px', background: 'none', border: 'none', borderBottom: tab === 'profiles' ? '2px solid #e05a7a' : '2px solid transparent', color: tab === 'profiles' ? '#e05a7a' : '#b08898', fontSize: 13, fontWeight: tab === 'profiles' ? 700 : 500, cursor: 'pointer' }}>💕 프로필</button>
            {isAdmin && <button onClick={() => setTab('matching')} style={{ padding: '12px 20px', background: 'none', border: 'none', borderBottom: tab === 'matching' ? '2px solid #e05a7a' : '2px solid transparent', color: tab === 'matching' ? '#e05a7a' : '#b08898', fontSize: 13, fontWeight: tab === 'matching' ? 700 : 500, cursor: 'pointer' }}>📋 매칭 이력</button>}
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
            <RegisterForm onSubmit={handleSubmit} onCancel={() => setView('browse')} loading={loading} />
          </div>
        )}

        {view === 'browse' && tab === 'profiles' && (
          <>
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
              {[
                { emoji: '💕', label: '전체 회원', value: `${profiles.length}명` },
                { emoji: '❤️', label: '관심 표현', value: `${likedCount}명` },
                isAdmin ? { emoji: '💝', label: '매칭 이력', value: `${matchings.length}건` } : null,
              ].filter(Boolean).map(s => (
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
              {isAdmin && ['전체', '여', '남'].map(g => (
                <button key={g} onClick={() => setFilterGender(g)} style={{ padding: '8px 18px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: `1.5px solid ${filterGender === g ? '#e05a7a' : '#f0dce6'}`, background: filterGender === g ? '#e05a7a' : '#fff', color: filterGender === g ? '#fff' : '#b08898' }}>
                  {g === '전체' ? '전체' : g === '여' ? '♀ 여성' : '♂ 남성'}
                </button>
              ))}
            </div>

            {!isAdmin && (
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
                  {filtered.map(p => <ProfileCard key={p.id} profile={p} onOpen={setSelected} onLike={handleLike} isAdmin={isAdmin} />)}
                </div>
            }
          </>
        )}

        {view === 'browse' && tab === 'matching' && isAdmin && (
          <MatchingTab profiles={profiles} matchings={matchings} isAdmin={isAdmin} />
        )}
      </div>

      {selected && <ProfileModal profile={selected} onClose={() => setSelected(null)} onLike={handleLike} onDelete={handleDelete} isAdmin={isAdmin} />}
      <Toast msg={toast} />
    </div>
  )
}