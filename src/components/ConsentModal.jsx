import { useState } from 'react'

const CONSENTS = [
  {
    id: 'privacy',
    title: '개인정보 수집 및 이용 동의 (필수)',
    content: `수집 항목: 이름, 출생연도, 성별, 거주지역, 직업, 사진 등 프로필 정보\n수집 목적: 소개팅 서비스 제공 및 이성 매칭\n보유 기간: 회원 탈퇴 시까지 (탈퇴 후 즉시 삭제)\n제3자 제공: 서비스 내 다른 회원에게 프로필 공개 (동의 범위 내)\n\n위 항목에 동의하지 않으실 경우 서비스 이용이 제한됩니다.`,
  },
  {
    id: 'secret',
    title: '개인정보 비밀 유지 동의 (필수)',
    content: `본 서비스는 지인 소개팅 서비스로, 회원 간 신뢰를 기반으로 운영됩니다.\n\n1. 서비스 내 타 회원의 개인정보(사진, 연락처, 직장 등)를 외부에 무단 공유하거나 유포하지 않겠습니다.\n2. 취득한 개인정보를 소개팅 목적 외 다른 용도로 사용하지 않겠습니다.\n3. 타 회원의 사진이나 정보를 캡처하여 SNS 등 외부에 게시하지 않겠습니다.\n4. 위반 시 민·형사상 책임을 질 수 있음을 인지합니다.\n\n개인정보 보호법 및 관련 법령을 준수하겠습니다.`,
  },
  {
    id: 'terms',
    title: '서비스 이용약관 동의 (필수)',
    content: `제1조 (목적): 본 약관은 마음이음 소개팅 서비스 이용에 관한 조건 및 절차를 규정합니다.\n\n제2조 (이용 자격): 만 19세 이상의 성인만 이용 가능합니다.\n\n제3조 (금지 행위):\n- 허위 정보 등록\n- 타인의 사진 무단 도용\n- 사기, 기망 행위\n- 욕설, 성희롱 등 불건전한 행위\n\n제4조 (책임 제한): 운영자는 회원 간 발생한 분쟁에 대해 책임지지 않습니다.\n\n제5조 (서비스 중단): 운영자는 사전 통지 없이 서비스를 변경하거나 중단할 수 있습니다.`,
  },
]

export default function ConsentModal({ onAgree }) {
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
      position: 'fixed', inset: 0, background: 'rgba(40,15,25,0.7)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      zIndex: 2000,
    }}>
      <div style={{
        background: '#fff', borderRadius: '24px 24px 0 0',
        width: '100%', maxWidth: 480, maxHeight: '90vh',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
      }}>
        {/* 헤더 */}
        <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid #f5e0e8' }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#2d1a22', marginBottom: 6 }}>
            🌸 마음이음 서비스 동의
          </div>
          <div style={{ fontSize: 13, color: '#b08898', lineHeight: 1.5 }}>
            서비스 이용을 위해 아래 약관에 동의해주세요.<br/>
            회원님의 소중한 개인정보를 안전하게 보호합니다.
          </div>
        </div>

        {/* 전체 동의 */}
        <div
          onClick={toggleAll}
          style={{
            padding: '14px 20px', background: allAgreed ? '#fdf0f4' : '#fafafa',
            borderBottom: '1px solid #f5e0e8', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 12,
          }}
        >
          <div style={{
            width: 22, height: 22, borderRadius: '50%',
            background: allAgreed ? '#e05a7a' : '#fff',
            border: `2px solid ${allAgreed ? '#e05a7a' : '#d0c0c8'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            {allAgreed && <span style={{ color: '#fff', fontSize: 13 }}>✓</span>}
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: allAgreed ? '#c94070' : '#2d1a22' }}>
            전체 동의하기
          </span>
        </div>

        {/* 개별 동의 */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {CONSENTS.map(c => (
            <div key={c.id} style={{ borderBottom: '1px solid #f5e0e8' }}>
              <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  onClick={() => setAgreed(a => ({ ...a, [c.id]: !a[c.id] }))}
                  style={{
                    width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                    background: agreed[c.id] ? '#e05a7a' : '#fff',
                    border: `2px solid ${agreed[c.id] ? '#e05a7a' : '#d0c0c8'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  }}
                >
                  {agreed[c.id] && <span style={{ color: '#fff', fontSize: 13 }}>✓</span>}
                </div>
                <span
                  onClick={() => setAgreed(a => ({ ...a, [c.id]: !a[c.id] }))}
                  style={{ fontSize: 14, color: '#3a1e28', fontWeight: 500, flex: 1, cursor: 'pointer' }}
                >
                  {c.title}
                </span>
                <button
                  onClick={() => setExpanded(e => ({ ...e, [c.id]: !e[c.id] }))}
                  style={{ background: 'none', border: 'none', color: '#b08898', fontSize: 12, cursor: 'pointer', padding: '4px 8px', flexShrink: 0 }}
                >
                  {expanded[c.id] ? '접기 ▲' : '보기 ▼'}
                </button>
              </div>
              {expanded[c.id] && (
                <div style={{ padding: '0 20px 14px 54px' }}>
                  <div style={{ background: '#fdf6f9', borderRadius: 10, padding: '12px 14px', fontSize: 12, color: '#6b4458', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                    {c.content}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 동의 버튼 */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid #f5e0e8' }}>
          <button
            onClick={() => allAgreed && onAgree()}
            disabled={!allAgreed}
            style={{
              width: '100%', padding: '15px', borderRadius: 14, border: 'none',
              background: allAgreed ? '#e05a7a' : '#f0dce6',
              color: allAgreed ? '#fff' : '#c0a0b0',
              fontSize: 16, fontWeight: 700,
              cursor: allAgreed ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
            }}
          >
            {allAgreed ? '동의하고 시작하기 🌸' : '모든 항목에 동의해주세요'}
          </button>
        </div>
      </div>
    </div>
  )
}
