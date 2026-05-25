import { useState, useEffect, useRef } from 'react'
import { onAuthStateChanged, signOut, deleteUser } from 'firebase/auth'
import {
  collection, onSnapshot, addDoc, updateDoc, deleteDoc,
  doc, serverTimestamp, query, orderBy, setDoc, getDoc, writeBatch,
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
    <div style={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', background: '#2d1a22', color: '#fff', padding: '14px 28px', borderRadius: 20, fontSize: 14, fontWeight: 600, zIndex: 9999, whiteSpace: 'nowrap', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
      {msg}
    </div>
  )
}

function Loading({ text = '로딩 중...' }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fdf6f8' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🌸</div>
        <div style={{ fontSize: 14, color: '#b08898', fontWeight: 500 }}>{text}</div>
      </div>
    </div>
  )
}

export default function App() {
  // 인증 상태: loading | loggedOut | needConsent | needGender | ready
  const [authState, setAuthState]       = useState('loading')
  const [user, setUser]                 = useState(null)
  const [userRole, setUserRole]         = useState('일반인')
  const [userGender, setUserGender]     = useState(null)
  const [genderSaving, setGenderSaving] = useState(false)
  const [consentSaving, setConsentSaving] = useState(false)

  const [tab, setTab]                   = useState('profiles')
  const [showRegister, setShowRegister] = useState(false)
  const [editingProfile, setEditingProfile] = useState(null)
  const [profiles, setProfiles]         = useState([])
  const [matchings, setMatchings]       = useState([])
  const [selected, setSelected]         = useState(null)
  const [filterGender, setFilterGender] = useState('전체')
  const [search, setSearch]             = useState('')
  const [showHidden, setShowHidden]     = useState(false)
  const [formLoading, setFormLoading]   = useState(false)
  const [toast, setToast]               = useState(null)
  const [showWithdraw, setShowWithdraw] = useState(false)

  const unsubProfiles  = useRef(null)
  const unsubMatchings = useRef(null)

  const isAdmin  = isAdminRole(userRole)
  const canWrite = canWriteRole(userRole)

  // ── 인증 상태 감지 ──────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      unsubProfiles.current?.()
      unsubMatchings.current?.()

      if (!u) {
        setUser(null); setUserRole('일반인'); setUserGender(null)
        setAuthState('loggedOut'); return
      }

      setUser(u)
      setAuthState('loading')

      const adminByEmail = ADMIN_EMAILS.includes(u.email)

      try {
        // 사용자 문서 가져오기 (없으면 생성)
        const userRef = doc(db, 'users', u.uid)
        const snap = await getDoc(userRef)

        if (!snap.exists()) {
          // ── 첫 로그인: 문서 생성 ──
          const newData = {
            email: u.email,
            displayName: u.displayName || '',
            role: adminByEmail ? '짱' : '일반인',
            consented: false,
            createdAt: serverTimestamp(),
          }
          await setDoc(userRef, newData)
          setUserRole(newData.role)

          if (adminByEmail) {
            setAuthState('ready')
          } else {
            setAuthState('needConsent') // 동의 필요
          }
          return
        }

        // ── 기존 사용자 ──
        const data = snap.data()

        // 관리자 이메일이면 짱 권한 보장
        if (adminByEmail && data.role !== '짱') {
          await updateDoc(userRef, { role: '짱', email: u.email })
        }

        const role = adminByEmail ? '짱' : (data.role || '일반인')
        setUserRole(role)

        // 이름/이메일 최신화
        if (data.email !== u.email || (!data.displayName && u.displayName)) {
          await updateDoc(userRef, {
            email: u.email,
            displayName: data.displayName || u.displayName || '',
          })
        }

        if (adminByEmail) {
          setAuthState('ready'); return
        }

        // 동의 여부 확인
        if (!data.consented) {
          setAuthState('needConsent'); return
        }

        // 성별 확인
        if (!data.gender) {
          setAuthState('needGender'); return
        }

        setUserGender(data.gender)
        setAuthState('ready')

      } catch (err) {
        console.error('사용자 정보 처리 오류:', err.code, err.message)
        if (adminByEmail) {
          setUserRole('짱'); setAuthState('ready')
        } else {
          setAuthState('needConsent')
        }
      }
    })
    return unsub
  }, [])

  // ── 개인정보 동의 저장 ──────────────────────────
  const handleConsent = async () => {
    if (!user || consentSaving) return
    setConsentSaving(true)
    try {
      await updateDoc(doc(db, 'users', user.uid), { consented: true })
      setAuthState('needGender')
    } catch (err) {
      alert('동의 저장 실패: ' + err.message)
    } finally {
      setConsentSaving(false)
    }
  }

  // ── 성별 저장 ────────────────────────────────────
  const handleGenderSelect = async (gender) => {
    if (!user || genderSaving) return
    setGenderSaving(true)
    try {
      await updateDoc(doc(db, 'users', user.uid), { gender })
      setUserGender(gender)
      setAuthState('ready')
    } catch (err) {
      alert('성별 저장 실패: ' + err.message)
    } finally {
      setGenderSaving(false)
    }
  }

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
    if (authState !== 'ready' || !user || !canWrite) return
    const q = query(collection(db, 'matchings'), orderBy('createdAt', 'desc'))
    unsubMatchings.current = onSnapshot(q, snap => {
      setMatchings(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return () => unsubMatchings.current?.()
  }, [authState, user, canWrite])

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500) }

  // ── 관심 표현 ────────────────────────────────────
  const handleLike = async (id, currentLiked) => {
    try {
      await updateDoc(doc(db, 'profiles', id), { liked: !currentLiked })
      setSelected(prev => prev?.id === id ? { ...prev, liked: !currentLiked } : prev)
    } catch { showToast('❌ 오류가 발생했습니다.') }
  }

  // ── 프로필 액션 (삭제/숨김) ──────────────────────
  const handleProfileAction = async (id, action, value) => {
    try {
      if (action === 'delete') {
        await deleteDoc(doc(db, 'profiles', id))
        showToast('🗑️ 삭제되었습니다.')
      } else if (action === 'toggle') {
        await updateDoc(doc(db, 'profiles', id), { hidden: value })
        // selected 업데이트
        setSelected(prev => prev?.id === id ? { ...prev, hidden: value } : prev)
        showToast(value ? '🙈 숨김 처리됐습니다.' : '👁️ 다시 표시됐습니다.')
      }
    } catch (err) {
      showToast('❌ 처리 실패: ' + err.message)
    }
  }

  // ── 프로필 저장 ──────────────────────────────────
  const handleSubmit = async (formData) => {
    setFormLoading(true)
    try {
      if (editingProfile) {
        await updateDoc(doc(db, 'profiles', editingProfile.id), { ...formData, updatedAt: serverTimestamp() })
        showToast('✓ 프로필이 수정되었습니다!')
        setEditingProfile(null)
      } else {
        await addDoc(collection(db, 'profiles'), {
          ...formData, liked: false, hidden: false,
          registeredBy: user.uid,
          createdAt: serverTimestamp(),
        })
        showToast('✓ 프로필이 등록되었습니다! 💕')
      }
      setShowRegister(false)
    } catch (e) {
      showToast('❌ 저장 실패: ' + e.message)
    } finally {
      setFormLoading(false)
    }
  }

  // ── 프로필 수정 ──────────────────────────────────
  const handleEdit = (profile) => {
    setEditingProfile(profile)
    setShowRegister(true)
    setSelected(null)
  }

  // ── 로그아웃 ─────────────────────────────────────
  const handleLogout = async () => {
    unsubProfiles.current?.()
    unsubMatchings.current?.()
    await signOut(auth)
    setUser(null); setUserRole('일반인'); setUserGender(null)
    setAuthState('loggedOut')
    setProfiles([]); setMatchings([])
  }

  // ── 탈퇴 ─────────────────────────────────────────
  const handleWithdraw = async () => {
    if (!window.confirm('정말로 탈퇴하시겠어요?\n모든 정보가 삭제되며 복구할 수 없습니다.')) return
    try {
      // Firestore 사용자 문서 삭제
      await deleteDoc(doc(db, 'users', user.uid))
      // Firebase Auth 계정 삭제
      await deleteUser(auth.currentUser)
      showToast('탈퇴가 완료되었습니다.')
    } catch (err) {
      if (err.code === 'auth/requires-recent-login') {
        alert('보안을 위해 재로그인 후 탈퇴해주세요.\n로그아웃 후 다시 로그인하고 탈퇴를 시도해주세요.')
      } else {
        alert('탈퇴 실패: ' + err.message)
      }
    }
  }

  // ── 화면 분기 ────────────────────────────────────
  if (authState === 'loading')     return <Loading text={user ? '정보 확인 중...' : '로딩 중...'} />
  if (authState === 'loggedOut')   return <LoginPage />
  if (authState === 'needConsent') return (
    <ConsentModal onAgree={handleConsent} loading={consentSaving} />
  )
  if (authState === 'needGender')  return (
    <GenderSetup onSelect={handleGenderSelect} loading={genderSaving} />
  )

  // ── 메인 화면 ────────────────────────────────────
  const oppositeGender = userGender === '여' ? '남' : '여'

  const filtered = profiles.filter(p => {
    if (p.hidden && !canWrite) return false
    if (p.hidden && canWrite && !showHidden) return false
    if (!canWrite && p.gender !== oppositeGender) return false
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

  const roleBadge = isAdmin ? { label: '짱', bg: '#e05a7a', color: '#fff' }
    : userRole === '일진' ? { label: '일진', bg: '#3a6fa8', color: '#fff' }
    : { label: '일반인', bg: '#f0dce6', color: '#9c6278' }

  return (
    <div style={{ minHeight: '100vh', background: '#fdf6f8', maxWidth: 480, margin: '0 auto' }}>
      <style>{`* { -webkit-tap-highlight-color: transparent; }`}</style>

      {/* ── 헤더 ── */}
      <div style={{ background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #f5e0e8', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 20 }}>🌸</span>
            <span style={{ fontWeight: 800, fontSize: 16, color: '#c94070' }}>마음이음</span>
            <span style={{ fontSize: 10, color: roleBadge.color, background: roleBadge.bg, padding: '2px 7px', borderRadius: 8, fontWeight: 700 }}>{roleBadge.label}</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {!showRegister && (
              <button onClick={() => { setEditingProfile(null); setShowRegister(true) }} style={{ background: '#e05a7a', color: '#fff', border: 'none', borderRadius: 10, padding: '7px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                + 등록
              </button>
            )}
            {showRegister && (
              <button onClick={() => { setShowRegister(false); setEditingProfile(null) }} style={{ background: '#f5e0e8', color: '#c94070', border: 'none', borderRadius: 10, padding: '7px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                ← 목록
              </button>
            )}
            {user.photoURL
              ? <img src={user.photoURL} style={{ width: 32, height: 32, borderRadius: '50%' }} alt="" />
              : <Avatar name={user.displayName || '?'} size={32} />
            }
          </div>
        </div>

        {!showRegister && (
          <div style={{ display: 'flex', borderTop: '1px solid #f5e0e8' }}>
            {tabs.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} style={{ flex: 1, padding: '10px 0', background: 'none', border: 'none', borderBottom: tab === t.key ? '2.5px solid #e05a7a' : '2.5px solid transparent', color: tab === t.key ? '#e05a7a' : '#b08898', fontSize: 13, fontWeight: tab === t.key ? 700 : 500, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                <span style={{ fontSize: 16 }}>{t.label}</span>
                <span style={{ fontSize: 11 }}>{t.text}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── 본문 ── */}
      <div style={{ padding: '16px 14px', paddingBottom: 90 }}>

        {/* 등록/수정 폼 */}
        {showRegister && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 24, marginBottom: 4 }}>🌸</div>
              <div style={{ fontWeight: 700, fontSize: 17, color: '#2d1a22' }}>
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
            <div style={{ display: 'flex', gap: 8, marginBottom: 14, overflowX: 'auto', paddingBottom: 4 }}>
              {[
                { emoji: '💕', label: '전체', value: `${profiles.filter(p => !p.hidden).length}명` },
                { emoji: '❤️', label: '관심', value: `${likedCount}명` },
                ...(canWrite ? [
                  { emoji: '💝', label: '매칭', value: `${matchings.length}건` },
                  { emoji: '🙈', label: '숨김', value: `${hiddenCount}명` },
                ] : []),
              ].map(s => (
                <div key={s.label} style={{ background: '#fff', borderRadius: 12, padding: '9px 14px', border: '1px solid #f5e0e8', display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
                  <span style={{ fontSize: 16 }}>{s.emoji}</span>
                  <div>
                    <div style={{ fontSize: 10, color: '#b08898' }}>{s.label}</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#c94070', lineHeight: 1.2 }}>{s.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* 검색/필터 */}
            <div style={{ marginBottom: 12 }}>
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="🔍 이름, 직업, 지역 검색..."
                style={{ width: '100%', padding: '11px 14px', borderRadius: 12, border: '1.5px solid #f0dce6', fontSize: 14, color: '#3a1e28', outline: 'none', background: '#fff', boxSizing: 'border-box', marginBottom: 8 }}
              />
              {canWrite && (
                <div style={{ display: 'flex', gap: 8 }}>
                  {['전체', '여', '남'].map(g => (
                    <button key={g} onClick={() => setFilterGender(g)} style={{ flex: 1, padding: '9px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: `1.5px solid ${filterGender === g ? '#e05a7a' : '#f0dce6'}`, background: filterGender === g ? '#e05a7a' : '#fff', color: filterGender === g ? '#fff' : '#b08898' }}>
                      {g === '전체' ? '전체' : g === '여' ? '♀ 여성' : '♂ 남성'}
                    </button>
                  ))}
                  {hiddenCount > 0 && (
                    <button onClick={() => setShowHidden(h => !h)} style={{ padding: '9px 12px', borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: `1.5px solid ${showHidden ? '#9c6278' : '#f0dce6'}`, background: showHidden ? '#f5e0e8' : '#fff', color: showHidden ? '#9c6278' : '#b08898', whiteSpace: 'nowrap' }}>
                      {showHidden ? '🙈 숨김중' : '🙈 숨김보기'}
                    </button>
                  )}
                </div>
              )}
            </div>

            {!canWrite && (
              <div style={{ background: '#fdf6f9', borderRadius: 12, padding: '10px 14px', marginBottom: 12, fontSize: 12, color: '#9c6278', border: '1px solid #f5e0e8' }}>
                💡 {oppositeGender === '남' ? '남성' : '여성'} 프로필만 열람 가능합니다.
              </div>
            )}

            {filtered.length === 0
              ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#c0a0b0' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🌸</div>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>
                    {profiles.length === 0 ? '아직 등록된 프로필이 없어요' : '검색 결과가 없습니다'}
                  </div>
                </div>
              )
              : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {filtered.map(p => (
                    <div key={p.id} style={{ position: 'relative' }}>
                      {p.hidden && canWrite && (
                        <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(156,98,120,0.85)', color: '#fff', fontSize: 10, fontWeight: 700, borderRadius: 6, padding: '2px 7px', zIndex: 1 }}>🙈 숨김</div>
                      )}
                      <ProfileCard profile={p} onOpen={setSelected} onLike={handleLike} />
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
        />
      )}

      {/* ── 하단 바 ── */}
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 480,
        background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(12px)',
        borderTop: '1px solid #f5e0e8', padding: '10px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 99,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {user.photoURL
            ? <img src={user.photoURL} style={{ width: 26, height: 26, borderRadius: '50%' }} alt="" />
            : <Avatar name={user.displayName || '?'} size={26} />
          }
          <span style={{ fontSize: 12, color: '#6b4458', fontWeight: 500, maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user.displayName || user.email}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setShowWithdraw(true)}
            style={{ background: '#fff', color: '#c0a0b0', border: '1px solid #f0dce6', borderRadius: 10, padding: '7px 12px', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
          >
            탈퇴
          </button>
          <button
            onClick={handleLogout}
            style={{ background: '#f5e0e8', color: '#c94070', border: 'none', borderRadius: 10, padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
          >
            로그아웃
          </button>
        </div>
      </div>

      {/* 탈퇴 확인 모달 */}
      {showWithdraw && (
        <div onClick={() => setShowWithdraw(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(40,15,25,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 24 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, padding: '28px 24px', width: '100%', maxWidth: 340, textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>😢</div>
            <div style={{ fontWeight: 700, fontSize: 18, color: '#2d1a22', marginBottom: 8 }}>정말 탈퇴하시겠어요?</div>
            <div style={{ fontSize: 13, color: '#b08898', marginBottom: 24, lineHeight: 1.6 }}>
              탈퇴 시 계정 정보가 삭제됩니다.<br />
              등록하신 프로필은 별도로 삭제되지 않습니다.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowWithdraw(false)} style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1.5px solid #f0dce6', background: '#fff', color: '#b08898', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                취소
              </button>
              <button onClick={() => { setShowWithdraw(false); handleWithdraw() }} style={{ flex: 1, padding: '12px', borderRadius: 12, border: 'none', background: '#e05a7a', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                탈퇴하기
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast msg={toast} />
    </div>
  )
}
