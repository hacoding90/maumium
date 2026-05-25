import { useState, useEffect, useRef } from 'react'
import { onAuthStateChanged, signOut, deleteUser } from 'firebase/auth'
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
import ConsentModal from './components/ConsentModal.jsx'
import Avatar from './components/Avatar.jsx'

const isAdminRole  = (r) => r === '짱'
const canWriteRole = (r) => r === '짱' || r === '일진'

function Toast({ msg }) {
  if (!msg) return null
  return (
    <div style={{
      position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)',
      background: 'rgba(28,28,30,0.9)', backdropFilter: 'blur(20px)',
      color: '#fff', padding: '12px 20px', borderRadius: 12,
      fontSize: 14, fontWeight: 500, zIndex: 9999, whiteSpace: 'nowrap',
    }}>
      {msg}
    </div>
  )
}

function Loading({ text = '로딩 중...' }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f2f2f7' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 44, marginBottom: 14 }}>🌸</div>
        <div style={{ fontSize: 14, color: '#8e8e93' }}>{text}</div>
      </div>
    </div>
  )
}

export default function App() {
  const [authState, setAuthState]         = useState('loading')
  const [user, setUser]                   = useState(null)
  const [userRole, setUserRole]           = useState('일반인')
  const [userGender, setUserGender]       = useState(null)
  const [genderSaving, setGenderSaving]   = useState(false)
  const [consentSaving, setConsentSaving] = useState(false)

  const [tab, setTab]                     = useState('profiles')
  const [showRegister, setShowRegister]   = useState(false)
  const [editingProfile, setEditingProfile] = useState(null)
  const [profiles, setProfiles]           = useState([])
  const [matchings, setMatchings]         = useState([])
  const [selected, setSelected]           = useState(null)
  const [filterGender, setFilterGender]   = useState('전체')
  const [search, setSearch]               = useState('')
  const [showHidden, setShowHidden]       = useState(false)
  const [formLoading, setFormLoading]     = useState(false)
  const [toast, setToast]                 = useState(null)
  const [showWithdraw, setShowWithdraw]   = useState(false)

  const unsubProfiles  = useRef(null)
  const unsubMatchings = useRef(null)

  const isAdmin  = isAdminRole(userRole)
  const canWrite = canWriteRole(userRole)

  // ── 인증 감지 ──────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      unsubProfiles.current?.()
      unsubMatchings.current?.()

      if (!u) {
        setUser(null); setUserRole('일반인'); setUserGender(null)
        setAuthState('loggedOut'); return
      }

      setUser(u); setAuthState('loading')
      const adminByEmail = ADMIN_EMAILS.includes(u.email)

      try {
        const userRef = doc(db, 'users', u.uid)
        const snap = await getDoc(userRef)

        if (!snap.exists()) {
          // 첫 로그인: 문서 생성
          await setDoc(userRef, {
            email: u.email,
            displayName: u.displayName || '',
            role: adminByEmail ? '짱' : '일반인',
            consented: adminByEmail, // 관리자는 동의 스킵
            createdAt: serverTimestamp(),
          })
          setUserRole(adminByEmail ? '짱' : '일반인')
          setAuthState(adminByEmail ? 'ready' : 'needConsent')
          return
        }

        const data = snap.data()

        if (adminByEmail && data.role !== '짱') {
          await updateDoc(userRef, { role: '짱', consented: true })
        }

        const role = adminByEmail ? '짱' : (data.role || '일반인')
        setUserRole(role)

        if (adminByEmail) { setAuthState('ready'); return }

        if (!data.consented) { setAuthState('needConsent'); return }
        if (!data.gender)    { setAuthState('needGender');  return }

        setUserGender(data.gender)
        setAuthState('ready')

      } catch (err) {
        console.error('Auth error:', err.code, err.message)
        if (adminByEmail) { setUserRole('짱'); setAuthState('ready') }
        else setAuthState('needConsent')
      }
    })
    return unsub
  }, [])

  const handleConsent = async () => {
    if (!user || consentSaving) return
    setConsentSaving(true)
    try {
      await updateDoc(doc(db, 'users', user.uid), { consented: true })
      setAuthState('needGender')
    } catch (err) { alert('오류: ' + err.message) }
    finally { setConsentSaving(false) }
  }

  const handleGenderSelect = async (gender) => {
    if (!user || genderSaving) return
    setGenderSaving(true)
    try {
      await updateDoc(doc(db, 'users', user.uid), { gender })
      setUserGender(gender); setAuthState('ready')
    } catch (err) { alert('오류: ' + err.message) }
    finally { setGenderSaving(false) }
  }

  useEffect(() => {
    if (authState !== 'ready' || !user) return
    const q = query(collection(db, 'profiles'), orderBy('createdAt', 'desc'))
    unsubProfiles.current = onSnapshot(q, snap => {
      setProfiles(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return () => unsubProfiles.current?.()
  }, [authState, user])

  useEffect(() => {
    if (authState !== 'ready' || !user || !canWrite) return
    const q = query(collection(db, 'matchings'), orderBy('createdAt', 'desc'))
    unsubMatchings.current = onSnapshot(q, snap => {
      setMatchings(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return () => unsubMatchings.current?.()
  }, [authState, user, canWrite])

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500) }

  const handleLike = async (id, currentLiked) => {
    try {
      await updateDoc(doc(db, 'profiles', id), { liked: !currentLiked })
      setSelected(prev => prev?.id === id ? { ...prev, liked: !currentLiked } : prev)
    } catch { showToast('오류가 발생했습니다.') }
  }

  const handleProfileAction = async (id, action, value) => {
    try {
      if (action === 'delete') {
        await deleteDoc(doc(db, 'profiles', id))
        showToast('삭제되었습니다.')
      } else if (action === 'toggle') {
        await updateDoc(doc(db, 'profiles', id), { hidden: value })
        setSelected(prev => prev?.id === id ? { ...prev, hidden: value } : prev)
        showToast(value ? '숨김 처리됐습니다.' : '다시 표시됩니다.')
      }
    } catch (err) { showToast('처리 실패: ' + err.message) }
  }

  const handleSubmit = async (formData) => {
    setFormLoading(true)
    try {
      if (editingProfile) {
        await updateDoc(doc(db, 'profiles', editingProfile.id), { ...formData, updatedAt: serverTimestamp() })
        showToast('프로필이 수정되었습니다.')
        setEditingProfile(null)
      } else {
        await addDoc(collection(db, 'profiles'), {
          ...formData, liked: false, hidden: false,
          registeredBy: user.uid,
          createdAt: serverTimestamp(),
        })
        showToast('프로필이 등록되었습니다! 💕')
      }
      setShowRegister(false)
    } catch (e) { showToast('저장 실패: ' + e.message) }
    finally { setFormLoading(false) }
  }

  const handleEdit = (profile) => {
    setEditingProfile(profile); setShowRegister(true); setSelected(null)
  }

  const handleLogout = async () => {
    unsubProfiles.current?.(); unsubMatchings.current?.()
    await signOut(auth)
    setUser(null); setUserRole('일반인'); setUserGender(null)
    setAuthState('loggedOut'); setProfiles([]); setMatchings([])
  }

  const handleWithdraw = async () => {
    try {
      await deleteDoc(doc(db, 'users', user.uid))
      await deleteUser(auth.currentUser)
    } catch (err) {
      if (err.code === 'auth/requires-recent-login') {
        alert('보안을 위해 재로그인 후 탈퇴해주세요.')
      } else {
        alert('탈퇴 실패: ' + err.message)
      }
    }
  }

  if (authState === 'loading')     return <Loading text={user ? '정보 확인 중...' : '로딩 중...'} />
  if (authState === 'loggedOut')   return <LoginPage />
  if (authState === 'needConsent') return <ConsentModal onAgree={handleConsent} loading={consentSaving} />
  if (authState === 'needGender')  return <GenderSetup onSelect={handleGenderSelect} loading={genderSaving} />

  const oppositeGender = userGender === '여' ? '남' : '여'

  // 본인이 등록한 프로필 ID 목록
  const myProfileIds = new Set(profiles.filter(p => p.registeredBy === user.uid).map(p => p.id))

  const filtered = profiles.filter(p => {
    if (p.hidden && !canWrite) return false
    if (p.hidden && canWrite && !showHidden) return false
    // 일반인: 이성만 + 본인 등록 프로필
    if (!canWrite && p.gender !== oppositeGender && !myProfileIds.has(p.id)) return false
    // 짱/일진: 성별 필터
    if (canWrite && filterGender !== '전체' && p.gender !== filterGender) return false
    const q = search.trim()
    if (q && !p.name?.includes(q) && !p.job?.includes(q) && !p.region?.includes(q) && !p.city?.includes(q)) return false
    return true
  })

  const hiddenCount = profiles.filter(p => p.hidden).length
  const likedCount  = profiles.filter(p => p.liked).length

  const tabs = [
    { key: 'profiles', label: '💕', text: '프로필' },
    ...(canWrite ? [{ key: 'matching', label: '📋', text: '매칭' }] : []),
    ...(isAdmin  ? [{ key: 'roles',   label: '🔑', text: '권한' }] : []),
  ]

  const roleBadgeStyle = isAdmin
    ? { label: '짱', bg: '#FF3B7A', color: '#fff' }
    : userRole === '일진'
      ? { label: '일진', bg: '#007AFF', color: '#fff' }
      : { label: '일반인', bg: '#e5e5ea', color: '#8e8e93' }

  return (
    <div style={{ minHeight: '100vh', background: '#f2f2f7', maxWidth: 480, margin: '0 auto' }}>
      <style>{`
        * { -webkit-tap-highlight-color: transparent; }
        input:focus, select:focus, textarea:focus { outline: none; border-color: #FF3B7A !important; }
      `}</style>

      {/* ── 네비게이션 바 ── */}
      <div style={{
        background: 'rgba(242,242,247,0.92)', backdropFilter: 'blur(20px)',
        borderBottom: '0.5px solid rgba(0,0,0,0.1)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18 }}>🌸</span>
            <span style={{ fontWeight: 700, fontSize: 17, color: '#1c1c1e', letterSpacing: -0.3 }}>마음이음</span>
            <span style={{
              fontSize: 10, color: roleBadgeStyle.color, background: roleBadgeStyle.bg,
              padding: '2px 8px', borderRadius: 20, fontWeight: 700,
            }}>{roleBadgeStyle.label}</span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {!showRegister && (
              <button
                onClick={() => { setEditingProfile(null); setShowRegister(true) }}
                style={{
                  background: '#FF3B7A', color: '#fff', border: 'none',
                  borderRadius: 20, padding: '7px 16px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                }}
              >
                + 등록
              </button>
            )}
            {showRegister && (
              <button
                onClick={() => { setShowRegister(false); setEditingProfile(null) }}
                style={{ background: 'none', border: 'none', color: '#FF3B7A', fontSize: 14, fontWeight: 600, cursor: 'pointer', padding: '7px 4px' }}
              >
                ← 목록
              </button>
            )}
            {user.photoURL
              ? <img src={user.photoURL} style={{ width: 30, height: 30, borderRadius: '50%' }} alt="" />
              : <Avatar name={user.displayName || '?'} size={30} />
            }
          </div>
        </div>

        {/* 탭 바 */}
        {!showRegister && (
          <div style={{ display: 'flex', borderTop: '0.5px solid rgba(0,0,0,0.08)' }}>
            {tabs.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} style={{
                flex: 1, padding: '8px 0 10px', background: 'none', border: 'none',
                borderBottom: tab === t.key ? '2px solid #FF3B7A' : '2px solid transparent',
                color: tab === t.key ? '#FF3B7A' : '#8e8e93',
                fontSize: 12, fontWeight: tab === t.key ? 600 : 400, cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              }}>
                <span style={{ fontSize: 18 }}>{t.label}</span>
                <span>{t.text}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── 본문 ── */}
      <div style={{ padding: '14px 14px', paddingBottom: 100 }}>

        {/* 등록/수정 폼 */}
        {showRegister && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#1c1c1e', letterSpacing: -0.5 }}>
                {editingProfile ? '프로필 수정' : '프로필 등록'}
              </div>
            </div>
            <RegisterForm
              onSubmit={handleSubmit}
              onCancel={() => { setShowRegister(false); setEditingProfile(null) }}
              loading={formLoading}
              initialData={editingProfile}
              matchmakerName={canWrite ? (user.displayName || user.email) : undefined}
            />
          </div>
        )}

        {/* 프로필 목록 */}
        {!showRegister && tab === 'profiles' && (
          <>
            {/* 통계 */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 14, overflowX: 'auto' }}>
              {[
                { emoji: '💕', label: '전체', value: `${profiles.filter(p => !p.hidden).length}명` },
                { emoji: '❤️', label: '관심', value: `${likedCount}명` },
                ...(canWrite ? [
                  { emoji: '💝', label: '매칭', value: `${matchings.length}건` },
                  hiddenCount > 0 ? { emoji: '🙈', label: '숨김', value: `${hiddenCount}명` } : null,
                ].filter(Boolean) : []),
              ].map(s => (
                <div key={s.label} style={{
                  background: '#fff', borderRadius: 14, padding: '10px 14px',
                  display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                }}>
                  <span style={{ fontSize: 18 }}>{s.emoji}</span>
                  <div>
                    <div style={{ fontSize: 10, color: '#8e8e93', fontWeight: 500 }}>{s.label}</div>
                    <div style={{ fontSize: 17, fontWeight: 700, color: '#1c1c1e', lineHeight: 1.2 }}>{s.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* 검색/필터 */}
            <div style={{ marginBottom: 14 }}>
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="이름, 직업, 지역 검색..."
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: 12,
                  border: '1.5px solid #e5e5ea', fontSize: 15, color: '#1c1c1e',
                  background: '#fff', boxSizing: 'border-box', marginBottom: 10,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                }}
              />
              {canWrite && (
                <div style={{ display: 'flex', gap: 8 }}>
                  {['전체', '여', '남'].map(g => (
                    <button key={g} onClick={() => setFilterGender(g)} style={{
                      flex: 1, padding: '10px', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                      border: 'none',
                      background: filterGender === g ? '#FF3B7A' : '#fff',
                      color: filterGender === g ? '#fff' : '#8e8e93',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                    }}>
                      {g === '전체' ? '전체' : g === '여' ? '♀ 여성' : '♂ 남성'}
                    </button>
                  ))}
                  {hiddenCount > 0 && (
                    <button onClick={() => setShowHidden(h => !h)} style={{
                      padding: '10px 12px', borderRadius: 12, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none',
                      background: showHidden ? '#f5e0e8' : '#fff', color: showHidden ? '#FF3B7A' : '#8e8e93',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.06)', whiteSpace: 'nowrap',
                    }}>
                      {showHidden ? '🙈 숨김중' : '🙈 숨김'}
                    </button>
                  )}
                </div>
              )}
            </div>

            {!canWrite && (
              <div style={{ background: '#fff', borderRadius: 12, padding: '10px 14px', marginBottom: 12, fontSize: 13, color: '#8e8e93', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                💡 {oppositeGender === '남' ? '남성' : '여성'} 프로필과 내가 등록한 프로필을 볼 수 있습니다.
              </div>
            )}

            {filtered.length === 0
              ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#aeaeb2' }}>
                  <div style={{ fontSize: 48, marginBottom: 14 }}>🌸</div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: '#8e8e93' }}>
                    {profiles.length === 0 ? '아직 등록된 프로필이 없어요' : '검색 결과가 없습니다'}
                  </div>
                </div>
              )
              : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {filtered.map(p => (
                    <div key={p.id} style={{ position: 'relative' }}>
                      {p.hidden && canWrite && (
                        <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(142,142,147,0.85)', color: '#fff', fontSize: 10, fontWeight: 700, borderRadius: 6, padding: '2px 7px', zIndex: 1 }}>🙈 숨김</div>
                      )}
                      <ProfileCard
                        profile={p}
                        onOpen={setSelected}
                        onLike={handleLike}
                        isOwn={myProfileIds.has(p.id)}
                      />
                    </div>
                  ))}
                </div>
              )
            }
          </>
        )}

        {!showRegister && tab === 'matching' && canWrite && (
          <MatchingTab profiles={profiles.filter(p => !p.hidden)} matchings={matchings} isAdmin={canWrite} />
        )}
        {!showRegister && tab === 'roles' && isAdmin && <RoleManager />}
      </div>

      {/* 프로필 모달 */}
      {selected && (
        <ProfileModal
          profile={selected}
          onClose={() => setSelected(null)}
          onLike={handleLike}
          onDelete={handleProfileAction}
          onEdit={handleEdit}
          canWrite={canWrite}
          isOwn={myProfileIds.has(selected.id)}
        />
      )}

      {/* ── 하단 바 ── */}
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 480,
        background: 'rgba(242,242,247,0.92)', backdropFilter: 'blur(20px)',
        borderTop: '0.5px solid rgba(0,0,0,0.1)',
        padding: '10px 16px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 99,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {user.photoURL
            ? <img src={user.photoURL} style={{ width: 28, height: 28, borderRadius: '50%' }} alt="" />
            : <Avatar name={user.displayName || '?'} size={28} />
          }
          <span style={{ fontSize: 13, color: '#3a3a3c', fontWeight: 500, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user.displayName || user.email}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {/* 탈퇴 - 작고 덜 눈에 띄게 */}
          <button
            onClick={() => setShowWithdraw(true)}
            style={{ background: 'none', border: 'none', color: '#c7c7cc', fontSize: 11, cursor: 'pointer', padding: '4px' }}
          >
            탈퇴
          </button>
          <button
            onClick={handleLogout}
            style={{ background: '#fff', color: '#FF3B7A', border: '1px solid #FFD0DF', borderRadius: 20, padding: '7px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          >
            로그아웃
          </button>
        </div>
      </div>

      {/* 탈퇴 확인 모달 */}
      {showWithdraw && (
        <div onClick={() => setShowWithdraw(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 24 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, padding: '28px 24px', width: '100%', maxWidth: 320, textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>😢</div>
            <div style={{ fontWeight: 700, fontSize: 19, color: '#1c1c1e', marginBottom: 8, letterSpacing: -0.3 }}>탈퇴하시겠어요?</div>
            <div style={{ fontSize: 14, color: '#8e8e93', marginBottom: 24, lineHeight: 1.6 }}>계정 정보가 삭제됩니다.</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowWithdraw(false)} style={{ flex: 1, padding: '13px', borderRadius: 12, border: 'none', background: '#f2f2f7', color: '#1c1c1e', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
                취소
              </button>
              <button onClick={() => { setShowWithdraw(false); handleWithdraw() }} style={{ flex: 1, padding: '13px', borderRadius: 12, border: 'none', background: '#FF3B7A', color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
                탈퇴
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast msg={toast} />
    </div>
  )
}
