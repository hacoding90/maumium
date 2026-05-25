import { useState } from 'react'

const CONSENTS = [
  {
    id: 'privacy',
    title: '개인정보 수집 및 이용 동의',
    required: true,
    content: `수집 항목: 이름, 출생연도, 성별, 거주지역, 직업, 사진 등\n수집 목적: 소개팅 서비스 제공 및 이성 매칭\n보유 기간: 회원 탈퇴 시까지\n제3자 제공: 서비스 내 다른 회원에게 프로필 공개`,
  },
  {
    id: 'secret',
    title: '개인정보 비밀 유지 동의',
    required: true,
    content: `1. 타 회원의 개인정보를 외부에 무단 공유하지 않겠습니다.\n2. 취득한 개인정보를 소개팅 목적 외 사용하지 않겠습니다.\n3. 타 회원의 사진이나 정보를 캡처하여 외부에 게시하지 않겠습니다.\n4. 위반 시 민·형사상 책임을 집니다.`,
  },
  {
    id: 'terms',
    title: '서비스 이용약관 동의',
    required: true,
    content: `• 만 19세 이상 성인만 이용 가능합니다.\n• 허위 정보 등록, 타인 사진 도용, 사기 행위는 금지됩니다.\n• 운영자는 회원 간 분쟁에 대해 책임지지 않습니다.`,
  },
]

export default function ConsentModal({ onAgree, loading }) {
  const [agreed, setAgreed] = useState({})
  const [expanded, setExpanded] = useState({})

  const allAgreed = CONSENTS.every(c => agreed[c.id])

  const toggleAll = () => {
    if (allAgreed) setAgreed({})
    else {
      const all = {}
      CONSENTS.forEach(c => { all[c.id] = true })
      setAgreed(all)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      zIndex: 2000,
    }}>
      <div style={{
        background: '#f2f2f7', borderRadius: '20px 20px 0 0',
        width: '100%', maxWidth: 480, maxHeight: '88vh',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
      }}>
        {/* 헤더 */}
        <div style={{ background: '#fff', padding: '20px 20px 16px', borderBottom: '1px solid #e5e5ea' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: '#d1d1d6', margin: '0 auto 16px' }} />
          <div style={{ fontSize: 20, fontWeight: 700, color: '#1c1c1e', marginBottom: 4 }}>서비스 약관 동의</div>
          <div style={{ fontSize: 13, color: '#8e8e93' }}>마음이음 이용을 위해 아래 약관에 동의해주세요</div>
        </div>

        {/* 전체 동의 */}
        <div
          onClick={toggleAll}
          style={{
            background: '#fff', padding: '16px 20px', margin: '12px 16px 0',
            borderRadius: 14, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 14,
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}
        >
          <div style={{
            width: 24, height: 24, borderRadius: '50%',
            background: allAgreed ? '#FF3B7A' : '#e5e5ea',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            {allAgreed && <span style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>✓</span>}
          </div>
          <span style={{ fontSize: 16, fontWeight: 600, color: '#1c1c1e' }}>전체 동의</span>
        </div>

        {/* 개별 동의 */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '12px 16px' }}>
          <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            {CONSENTS.map((c, i) => (
              <div key={c.id} style={{ borderBottom: i < CONSENTS.length-1 ? '1px solid #f2f2f7' : 'none' }}>
                <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    onClick={() => setAgreed(a => ({ ...a, [c.id]: !a[c.id] }))}
                    style={{
                      width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                      background: agreed[c.id] ? '#FF3B7A' : '#e5e5ea',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                    }}
                  >
                    {agreed[c.id] && <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>✓</span>}
                  </div>
                  <span
                    onClick={() => setAgreed(a => ({ ...a, [c.id]: !a[c.id] }))}
                    style={{ fontSize: 14, color: '#1c1c1e', fontWeight: 500, flex: 1, cursor: 'pointer' }}
                  >
                    {c.title} <span style={{ color: '#FF3B7A', fontSize: 12 }}>(필수)</span>
                  </span>
                  <button
                    onClick={() => setExpanded(e => ({ ...e, [c.id]: !e[c.id] }))}
                    style={{ background: 'none', border: 'none', color: '#aeaeb2', fontSize: 12, cursor: 'pointer', padding: '2px 6px' }}
                  >
                    {expanded[c.id] ? '접기' : '보기'}
                  </button>
                </div>
                {expanded[c.id] && (
                  <div style={{ padding: '0 16px 14px 50px' }}>
                    <div style={{ background: '#f2f2f7', borderRadius: 10, padding: '12px', fontSize: 12, color: '#636366', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                      {c.content}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 동의 버튼 */}
        <div style={{ padding: '12px 16px 32px', background: '#f2f2f7' }}>
          <button
            onClick={() => allAgreed && !loading && onAgree()}
            disabled={!allAgreed || loading}
            style={{
              width: '100%', padding: '16px', borderRadius: 14, border: 'none',
              background: allAgreed ? '#FF3B7A' : '#d1d1d6',
              color: '#fff', fontSize: 16, fontWeight: 600,
              cursor: allAgreed ? 'pointer' : 'not-allowed',
            }}
          >
            {loading ? '처리 중...' : allAgreed ? '동의하고 시작하기' : '모든 항목에 동의해주세요'}
          </button>
        </div>
      </div>
    </div>
  )
}
