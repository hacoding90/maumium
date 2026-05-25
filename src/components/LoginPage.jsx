import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../firebase.js'

export default function LoginPage() {
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (e) {
      if (e.code === 'auth/popup-closed-by-user') return
      if (e.code === 'auth/popup-blocked') {
        alert('팝업이 차단되었습니다. 브라우저 설정에서 팝업을 허용해주세요.')
        return
      }
      alert('로그인에 실패했습니다: ' + e.message)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg,#fdf0f4,#f5e0ec,#fdf6f8)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div style={{
        background: '#fff', borderRadius: 28, padding: '48px 40px',
        maxWidth: 400, width: '100%', textAlign: 'center',
        boxShadow: '0 8px 48px rgba(180,80,100,0.15)',
        border: '1px solid #f5e0e8',
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🌸</div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#2d1a22', marginBottom: 8 }}>마음이음</h1>
        <p style={{ fontSize: 14, color: '#b08898', marginBottom: 36, lineHeight: 1.7 }}>
          소중한 인연을 이어드립니다<br />구글 계정으로 로그인해주세요
        </p>
        <button
          onClick={handleLogin}
          style={{
            width: '100%', padding: '14px', borderRadius: 14,
            border: '1.5px solid #e8e0e4', background: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
            fontSize: 15, fontWeight: 600, color: '#3a1e28', cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)', transition: 'all 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#fdf6f8'}
          onMouseLeave={e => e.currentTarget.style.background = '#fff'}
        >
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Google로 로그인
        </button>
        <p style={{ fontSize: 12, color: '#c0a0b0', marginTop: 24, lineHeight: 1.6 }}>
          로그인 시 팝업 창이 열립니다<br />팝업 차단을 해제해주세요
        </p>
      </div>
    </div>
  )
}
