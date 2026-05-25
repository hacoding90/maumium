import { useState } from 'react'
import Avatar from './Avatar.jsx'

const REGIONS = ['서울','경기','인천','부산','대구','광주','대전','울산','세종','강원','충북','충남','전북','전남','경북','경남','제주']
const JOBS = ['회사원','공무원','교사/교수','의사/한의사','간호사','약사','치과의사','변호사/법조인','회계사/세무사','건축사/엔지니어','IT/개발자','금융/증권','경영/컨설팅','연구원','자영업','프리랜서','예술/창작','기타']
const EDUCATIONS = ['고졸','전문대졸','4년제 대학교','대학원(석사)','대학원(박사)']
const RELIGIONS = ['무교','기독교','천주교','불교','기타']
const DRINKS = ['전혀 안 함','가끔','즐겨 함']
const SMOKES = ['비흡연','흡연','금연 중']
const MBTI_LIST = ['INTJ','INTP','ENTJ','ENTP','INFJ','INFP','ENFJ','ENFP','ISTJ','ISFJ','ESTJ','ESFJ','ISTP','ISFP','ESTP','ESFP']
const AGE_RANGES = ['나이 무관','20-25세','26-30세','31-35세','36-40세','41세 이상']
const HEIGHT_RANGES = ['키 무관','150cm 이하','150-155cm','156-160cm','161-165cm','166-170cm','171-175cm','176-180cm','181cm 이상']

// 출생연도 목록 생성 (1960 ~ 2005)
const currentYear = new Date().getFullYear()
const BIRTH_YEARS = Array.from({ length: 46 }, (_, i) => 2005 - i)

// 출생연도 → 나이 계산
const calcAge = (birthYear) => birthYear ? currentYear - Number(birthYear) + 1 : null

const sanitize = str => String(str || '').replace(/[<>"']/g, '').trim().slice(0, 500)

const inputStyle = { width: '100%', padding: '10px 13px', borderRadius: 10, border: '1.5px solid #f0dce6', fontSize: 14, color: '#3a1e28', background: '#fff', outline: 'none', boxSizing: 'border-box' }
const selectStyle = { ...inputStyle, cursor: 'pointer' }
const labelStyle = { fontSize: 12, fontWeight: 700, color: '#9c6278', marginBottom: 5, display: 'block' }

function Field({ label, children, full }) {
  return (
    <div style={{ gridColumn: full ? 'span 2' : 'span 1' }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  )
}

export default function RegisterForm({ onSubmit, onCancel, loading }) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    name: '', gender: '여', birthYear: '', height: '',
    region: '서울', job: '회사원', workplace: '', education: '4년제 대학교',
    religion: '무교', drink: '가끔', smoke: '비흡연', mbti: '', intro: '',
    idealAge: '나이 무관', idealHeight: '키 무관', idealJob: '', idealDesc: '',
  })
  const [errors, setErrors] = useState({})

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })) }

  const age = calcAge(form.birthYear)

  const validateStep1 = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = '이름을 입력해주세요'
    if (!form.birthYear) errs.birthYear = '출생연도를 선택해주세요'
    if (!form.height || form.height < 140 || form.height > 220) errs.height = '키를 올바르게 입력해주세요 (140-220)'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return
    setStep(s => s + 1)
  }

  const handleSubmit = () => {
    onSubmit({
      name: sanitize(form.name),
      gender: form.gender,
      birthYear: Number(form.birthYear),
      age: age, // 계산된 나이도 함께 저장
      height: Number(form.height),
      region: form.region,
      job: form.job,
      workplace: sanitize(form.workplace),
      education: form.education,
      religion: form.religion,
      drink: form.drink,
      smoke: form.smoke,
      mbti: form.mbti,
      intro: sanitize(form.intro),
      idealAge: form.idealAge,
      idealHeight: form.idealHeight,
      idealJob: sanitize(form.idealJob),
      idealDesc: sanitize(form.idealDesc),
    })
  }

  return (
    <div style={{ background: '#fff', borderRadius: 24, maxWidth: 520, width: '100%', margin: '0 auto', boxShadow: '0 4px 32px rgba(180,80,100,0.1)', border: '1px solid #f5e0e8' }}>
      {/* 헤더 */}
      <div style={{ background: 'linear-gradient(135deg,#fdf0f4,#f0d8e8)', padding: '24px 28px 20px', borderRadius: '24px 24px 0 0' }}>
        <div style={{ fontSize: 12, color: '#b08898', fontWeight: 600, marginBottom: 8 }}>STEP {step} / 3</div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
          {[1, 2, 3].map(s => <div key={s} style={{ flex: 1, height: 4, borderRadius: 4, background: s <= step ? '#e05a7a' : '#f0d0dc', transition: 'background 0.3s' }} />)}
        </div>
        <div style={{ fontWeight: 700, fontSize: 18, color: '#2d1a22' }}>
          {['기본 정보 입력', '자기소개 & 생활', '이상형 정보'][step - 1]}
        </div>
      </div>

      <div style={{ padding: '24px 28px' }}>

        {/* ── Step 1: 기본정보 ── */}
        {step === 1 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 14px' }}>
            <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'center' }}>
              <Avatar name={form.name || '?'} size={80} />
            </div>

            <Field label="이름 *" full>
              <input
                style={{ ...inputStyle, borderColor: errors.name ? '#e05a7a' : '#f0dce6' }}
                value={form.name} onChange={e => set('name', e.target.value)}
                placeholder="홍길동" maxLength={20}
              />
              {errors.name && <div style={{ fontSize: 11, color: '#e05a7a', marginTop: 4 }}>{errors.name}</div>}
            </Field>

            <Field label="성별 *" full>
              <div style={{ display: 'flex', gap: 8 }}>
                {['여', '남'].map(g => (
                  <button key={g} onClick={() => set('gender', g)} style={{ flex: 1, padding: '9px', borderRadius: 10, fontSize: 14, fontWeight: 700, border: `1.5px solid ${form.gender === g ? '#e05a7a' : '#f0dce6'}`, background: form.gender === g ? '#fdf0f4' : '#fff', color: form.gender === g ? '#e05a7a' : '#b08898', cursor: 'pointer' }}>
                    {g === '여' ? '♀ 여성' : '♂ 남성'}
                  </button>
                ))}
              </div>
            </Field>

            {/* 출생연도 선택 */}
            <Field label="출생연도 *">
              <select
                style={{ ...selectStyle, borderColor: errors.birthYear ? '#e05a7a' : '#f0dce6' }}
                value={form.birthYear}
                onChange={e => set('birthYear', e.target.value)}
              >
                <option value="">연도 선택</option>
                {BIRTH_YEARS.map(y => <option key={y} value={y}>{y}년</option>)}
              </select>
              {errors.birthYear && <div style={{ fontSize: 11, color: '#e05a7a', marginTop: 4 }}>{errors.birthYear}</div>}
            </Field>

            {/* 계산된 나이 표시 */}
            <Field label="나이 (자동계산)">
              <div style={{ ...inputStyle, background: '#faf7f8', color: age ? '#c94070' : '#b08898', fontWeight: age ? 700 : 400, display: 'flex', alignItems: 'center' }}>
                {age ? `만 ${age}세` : '연도를 선택하면 자동입력'}
              </div>
            </Field>

            <Field label="키 (cm) *">
              <input
                style={{ ...inputStyle, borderColor: errors.height ? '#e05a7a' : '#f0dce6' }}
                type="number" value={form.height}
                onChange={e => set('height', e.target.value)}
                placeholder="165" min="140" max="220"
              />
              {errors.height && <div style={{ fontSize: 11, color: '#e05a7a', marginTop: 4 }}>{errors.height}</div>}
            </Field>

            <Field label="거주 지역">
              <select style={selectStyle} value={form.region} onChange={e => set('region', e.target.value)}>
                {REGIONS.map(r => <option key={r}>{r}</option>)}
              </select>
            </Field>

            <Field label="직업">
              <select style={selectStyle} value={form.job} onChange={e => set('job', e.target.value)}>
                {JOBS.map(j => <option key={j}>{j}</option>)}
              </select>
            </Field>

            {/* 직장명 */}
            <Field label="직장명" full>
              <input
                style={inputStyle}
                value={form.workplace}
                onChange={e => set('workplace', e.target.value)}
                placeholder="예: 삼성전자, 경남테크노파크 (선택사항)"
                maxLength={50}
              />
            </Field>

            <Field label="학력" full>
              <select style={selectStyle} value={form.education} onChange={e => set('education', e.target.value)}>
                {EDUCATIONS.map(e => <option key={e}>{e}</option>)}
              </select>
            </Field>
          </div>
        )}

        {/* ── Step 2: 자기소개 & 생활 ── */}
        {step === 2 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 14px' }}>
            <Field label="종교">
              <select style={selectStyle} value={form.religion} onChange={e => set('religion', e.target.value)}>
                {RELIGIONS.map(r => <option key={r}>{r}</option>)}
              </select>
            </Field>
            <Field label="MBTI">
              <select style={selectStyle} value={form.mbti} onChange={e => set('mbti', e.target.value)}>
                <option value="">선택 안 함</option>
                {MBTI_LIST.map(m => <option key={m}>{m}</option>)}
              </select>
            </Field>
            <Field label="음주">
              <select style={selectStyle} value={form.drink} onChange={e => set('drink', e.target.value)}>
                {DRINKS.map(d => <option key={d}>{d}</option>)}
              </select>
            </Field>
            <Field label="흡연">
              <select style={selectStyle} value={form.smoke} onChange={e => set('smoke', e.target.value)}>
                {SMOKES.map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="자기소개" full>
              <textarea
                style={{ ...inputStyle, height: 120, resize: 'vertical', lineHeight: 1.65 }}
                value={form.intro} onChange={e => set('intro', e.target.value)}
                placeholder="나를 한마디로 표현하자면..." maxLength={500}
              />
              <div style={{ fontSize: 11, color: '#b08898', textAlign: 'right', marginTop: 4 }}>{form.intro.length}/500</div>
            </Field>
          </div>
        )}

        {/* ── Step 3: 이상형 ── */}
        {step === 3 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 14px' }}>
            <Field label="선호 나이대">
              <select style={selectStyle} value={form.idealAge} onChange={e => set('idealAge', e.target.value)}>
                {AGE_RANGES.map(a => <option key={a}>{a}</option>)}
              </select>
            </Field>
            <Field label="선호 키">
              <select style={selectStyle} value={form.idealHeight} onChange={e => set('idealHeight', e.target.value)}>
                {HEIGHT_RANGES.map(h => <option key={h}>{h}</option>)}
              </select>
            </Field>
            <Field label="직업 관련 선호" full>
              <input style={inputStyle} value={form.idealJob} onChange={e => set('idealJob', e.target.value)} placeholder="예: 안정적인 직업이면 좋겠어요" maxLength={100} />
            </Field>
            <Field label="이상형 한 줄 소개" full>
              <textarea
                style={{ ...inputStyle, height: 100, resize: 'vertical', lineHeight: 1.65 }}
                value={form.idealDesc} onChange={e => set('idealDesc', e.target.value)}
                placeholder="예: 유머 감각 있고 가족을 소중히 여기는 분" maxLength={300}
              />
              <div style={{ fontSize: 11, color: '#b08898', textAlign: 'right', marginTop: 4 }}>{form.idealDesc.length}/300</div>
            </Field>
          </div>
        )}

        {/* 버튼 */}
        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          <button
            onClick={step === 1 ? onCancel : () => setStep(s => s - 1)}
            style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1.5px solid #f0dce6', background: '#fff', color: '#b08898', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
          >
            {step === 1 ? '취소' : '← 이전'}
          </button>
          {step < 3
            ? <button onClick={handleNext} style={{ flex: 2, padding: '12px', borderRadius: 12, border: 'none', background: '#e05a7a', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>다음 →</button>
            : <button onClick={handleSubmit} disabled={loading} style={{ flex: 2, padding: '12px', borderRadius: 12, border: 'none', background: loading ? '#f0dce6' : '#e05a7a', color: '#fff', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}>
                {loading ? '⏳ 저장 중...' : '✓ 프로필 등록'}
              </button>
          }
        </div>
      </div>
    </div>
  )
}
