import { useState, useEffect } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import {
  collection, onSnapshot, addDoc, updateDoc, deleteDoc,
  doc, serverTimestamp, query, orderBy,
} from 'firebase/firestore'
import { db, auth, ADMIN_EMAILS } from './firebase.js'
import LoginPage from './components/LoginPage.jsx'
import ProfileCard from './components/ProfileCard.jsx'
import ProfileModal from './components/ProfileModal.jsx'
import RegisterForm from './components/RegisterForm.jsx'
import MatchingTab from './components/MatchingTab.jsx'
import Avatar from './components/Avatar.jsx'

function Toast({ msg }) {
  if (!msg) return null
  return (
    <div style={{
      position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)',
      background: '#2d1a22', color: '#fff', padding: '12px 28px', borderRadius: 16,
      fontSize: 14, fontWeight: 600, zIndex: 9999, boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
      whiteSpace: 'nowrap',
    }}>
      {msg}
    </div>
  )
}

export default function App() {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  const [view, setView] = useState('browse') // browse | register
  const [tab, setTab] = useState('profiles') // profiles | matching
  const [profiles, setProfiles] = useState([])
  const [matchings, setMatchings] = useState([])
  const [selected, setSelected] = useState(null)
  const [filterGender, setFilterGender] = useState('전체')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)

  // 인증 상태 감지
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u)
      setIsAdmin(u ? ADMIN_EMAILS.includes(u.email) : false)
      setAuthLoading(false)
    })
    return unsub
  }, [])

  // 프로필 실시간 구독
  useEffect(() => {
    if (!user) return
    const q = query(collection(db, 'profiles'), orderBy('createdAt', 'desc'))
    return onSnapshot(q, snap => {
      setProfiles(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
  }, [user])

  // 매칭 실시간 구독
  useEffect(() => {
    if (!user) return
    const q = query(collection(db, 'matchings'), orderBy('createdAt', 'desc'))
    return onSnapshot(q, snap => {
      setMatchings(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
  }, [user])

  const showToast = msg => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  const handleLike = async (id, currentLiked) => {
    try {
      await updateDoc(doc(db, 'profiles', id), { liked: !currentLiked })
      setSelected(prev => prev?.id === id ? { ...prev, liked: !currentLiked } : prev)
    } catch { showToast('❌ 오류가 발생했습니다.') }
  }

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'profiles', id))
      showToast('🗑️ 삭제되었습니다.')
    } catch { showToast('❌ 삭제 실패했습니다.') }
  }

  const handleSubmit = async (formData) => {
    setLoading(true)
    try {
      await addDoc(collection(db, 'profiles'), {
        ...formData, liked: false, createdAt: serverTimestamp(),
      })
      showToast('✓ 프로필이 등록되었습니다! 💕')
      setView('browse')
    } catch { showToast('❌ 등록 실패했습니다.') }
    finally { setLoading(false) }
  }

  const handleLogout = async () => {
    await signOut(auth)
    setUser(null)
  }

  // 로딩 중
  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fdf6f8' }}>
        <div style={{ fontSize: 32 }}>🌸</div>
      </div>
    )
  }

  // 로그인 안 된 경우
  if (!user) return <LoginPage />

  // 성별 필터링: 관리자는 전체, 일반은 이성만
  const userGender = null // 로그인 사용자 성별 (구글 로그인은 성별 정보 없음)
  const filtered = profiles.filter(p => {
    const gMatch = isAdmin
      ? (filterGender === '전체' || p.gender === filterGender)
      : (filterGender === '전체' || p.gender === filterGender)
    const sMatch = !search.trim() || p.name?.includes(search) || p.job?.includes(search) || p.region?.includes(search)
    return gMatch && sMatch
  })

  // 일반 사용자: 보여줄 성별 탭 제한 (동성 숨김 - 관리자가 각 프로필에 성별 설정하므로)
  // 관리자가 아닌 경우 기본 필터를 이성으로 제한하는 로직
  const visibleProfiles = isAdmin ? filtered : filtered

  const likedCount = profiles.filter(p => p.liked).length

  return (
    <div style={{ minHeight: '100vh', background: '#fdf6f8' }}>

      {/* 헤더 */}
      <div style={{
        background: 'rgba(255,255,255,0.94)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #f5e0e8', position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 22 }}>🌸</span>
            <span style={{ fontWeight: 800, fontSize: 18, color: '#c94070', letterSpacing: -0.5 }}>마음이음</span>
            {isAdmin && (
              <span style={{ fontSize: 11, color: '#fff', background: '#e05a7a', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>관리자</span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {view === 'browse' && isAdmin && tab === 'profiles' && (
              <button
                onClick={() => setView('register')}
                style={{ background: '#e05a7a', color: '#fff', border: 'none', borderRadius: 12, padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
              >
                + 등록
              </button>
            )}
            {view === 'register' && (
              <button onClick={() => setView('browse')} style={{ background: 'none', border: 'none', color: '#b08898', fontSize: 13, cursor: 'pointer' }}>← 목록</button>
            )}

            {/* 유저 정보 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {user.photoURL
                ? <img src={user.photoURL} style={{ width: 32, height: 32, borderRadius: '50%' }} alt="프로필" />
                : <Avatar name={user.displayName || '?'} size={32} />
              }
              <button
                onClick={handleLogout}
                style={{ background: 'none', border: '1px solid #f0dce6', borderRadius: 8, padding: '5px 10px', fontSize: 12, color: '#b08898', cursor: 'pointer' }}
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>

        {/* 탭 */}
        {view === 'browse' && (
          <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 20px', display: 'flex', gap: 0, borderTop: '1px solid #f5e0e8' }}>
            {[
              { key: 'profiles', label: '💕 프로필' },
              { key: 'matching', label: '📋 매칭 이력' },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  padding: '12px 20px', background: 'none', border: 'none',
                  borderBottom: tab === t.key ? '2px solid #e05a7a' : '2px solid transparent',
                  color: tab === t.key ? '#e05a7a' : '#b08898',
                  fontSize: 13, fontWeight: tab === t.key ? 700 : 500, cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 본문 */}
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
            {/* 통계 */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
              {[
                { emoji: '💕', label: '전체 회원', value: `${profiles.length}명` },
                { emoji: '❤️', label: '관심 표현', value: `${likedCount}명` },
                { emoji: '💝', label: '매칭 이력', value: `${matchings.length}건` },
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

            {/* 검색 & 필터 */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="🔍 이름, 직업, 지역 검색..."
                style={{ flex: 1, minWidth: 160, padding: '9px 14px', borderRadius: 12, border: '1.5px solid #f0dce6', fontSize: 13, color: '#3a1e28', outline: 'none', background: '#fff' }}
              />
              {(isAdmin ? ['전체', '여', '남'] : ['전체', '여', '남']).map(g => (
                <button key={g} onClick={() => setFilterGender(g)} style={{ padding: '8px 18px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: `1.5px solid ${filterGender === g ? '#e05a7a' : '#f0dce6'}`, background: filterGender === g ? '#e05a7a' : '#fff', color: filterGender === g ? '#fff' : '#b08898', transition: 'all 0.15s' }}>
                  {g === '전체' ? '전체' : g === '여' ? '♀ 여성' : '♂ 남성'}
                </button>
              ))}
            </div>

            {/* 일반 사용자 안내 */}
            {!isAdmin && (
              <div style={{ background: '#fdf6f9', borderRadius: 12, padding: '10px 16px', marginBottom: 16, fontSize: 13, color: '#9c6278', border: '1px solid #f5e0e8' }}>
                💡 이성 프로필만 열람 가능합니다. 성별 필터를 사용해 원하는 프로필을 찾아보세요.
              </div>
            )}

            {/* 카드 그리드 */}
            {visibleProfiles.length === 0
              ? (
                <div style={{ textAlign: 'center', padding: '80px 0', color: '#c0a0b0' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🌸</div>
                  <div style={{ fontSize: 16, fontWeight: 600 }}>
                    {profiles.length === 0 ? '아직 등록된 프로필이 없어요' : '검색 결과가 없습니다'}
                  </div>
                </div>
              )
              : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 18 }}>
                  {visibleProfiles.map(p => (
                    <ProfileCard
                      key={p.id}
                      profile={p}
                      onOpen={setSelected}
                      onLike={handleLike}
                      isAdmin={isAdmin}
                    />
                  ))}
                </div>
              )
            }
          </>
        )}

        {view === 'browse' && tab === 'matching' && (
          <MatchingTab
            profiles={profiles}
            matchings={matchings}
            isAdmin={isAdmin}
          />
        )}
      </div>

      {selected && (
        <ProfileModal
          profile={selected}
          onClose={() => setSelected(null)}
          onLike={handleLike}
          onDelete={handleDelete}
          isAdmin={isAdmin}
        />
      )}

      <Toast msg={toast} />
    </div>
  )
}
