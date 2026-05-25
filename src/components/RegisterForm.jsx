import { useState } from 'react'
import Avatar from './Avatar.jsx'
import ImageUploader from './ImageUploader.jsx'

const REGIONS = ['서울','경기','인천','부산','대구','광주','대전','울산','세종','강원','충북','충남','전북','전남','경북','경남','제주']
const JOBS = ['회사원','공무원','교사/교수','의사/한의사','간호사','약사','치과의사','변호사/법조인','회계사/세무사','건축사/엔지니어','IT/개발자','금융/증권','경영/컨설팅','연구원','자영업','프리랜서','예술/창작','기타']
const EDUCATIONS = ['고졸','전문대졸','4년제 대학교','대학원(석사)','대학원(박사)']
const RELIGIONS = ['무교','기독교','천주교','불교','기타']
const DRINKS = ['전혀 안 함','가끔','즐겨 함']
const SMOKES = ['비흡연','흡연','금연 중']
const MBTI_LIST = ['INTJ','INTP','ENTJ','ENTP','INFJ','INFP','ENFJ','ENFP','ISTJ','ISFJ','ESTJ','ESFJ','ISTP','ISFP','ESTP','ESFP']
const AGE_RANGES = ['나이 무관','20-25세','26-30세','31-35세','36-40세','41세 이상']

// 키 범위 (5cm 단위)
const HEIGHT_RANGES = ['키 무관','150cm 이하','150~155cm','155~160cm','160~165cm','165~170cm','170~175cm','175~180cm','180~185cm','185cm 이상']

// 실제 키 선택 (5cm 단위)
const HEIGHT_VALUES = ['150 이하','150~155','155~160','160~165','165~170','170~175','175~180','180~185','185 이상']

const currentYear = new Date().getFullYear()
const BIRTH_YEARS = Array.from({ length: 46 }, (_, i) => 2005 - i)
const calcAge = (birthYear) => birthYear ? currentYear - Number(birthYear) : null

const sanitize = str => String(str || '').replace(/[<>"']/g, '').trim().slice(0, 500)

const inputStyle = { width: '100%', padding: '11px 13px', borderRadius: 10, border: '1.5px solid #f0dce6', fontSize: 14, color: '#3a1e28', background: '#fff', outline: 'none', boxSizing: 'border-box' }
const selectStyle = { ...inputStyle, cursor: 'pointer' }
const labelStyle = { fontSize: 12, fontWeight: 700, color: '#9c6278', marginBottom: 5, display: 'block' }

function Field({ label, children, full, hint }) {
  return (
    <div style={{ gridColumn: full ? 'span 2' : 'span 1' }}>
      <label style={labelStyle}>{label}</label>
      {children}
      {hint && <div style={{ fontSize: 11, color: '#b08898', marginTop: 3 }}>{hint}</div>}
    </div>
  )
}

export default function RegisterForm({ onSubmit, onCancel, loading, initialData, matchmakerName }) {
  const isEdit = !!initialData
  const [step, setStep] = useState(1)
  const [photos, setPhotos] = useState(initialData?.photos || [])
  const [form, setForm] = useState({
    name: initialData?.name || '',
    gender: initialData?.gender || '여',
    birthYear: initialData?.birthYear || '',
    heightRange: initialData?.heightRange || '165~170',
    region: initialData?.region || '서울',
    city: initialData?.city || '',
    job: initialData?.job || '회사원',
    workplace: initialData?.workplace || '',
    education: initialData?.education || '4년제 대학교',
    religion: initialData?.religion || '무교',
    drink: initialData?.drink || '가끔',
    smoke: initialData?.smoke || '비흡연',
    mbti: initialData?.mbti || '',
    instagram: initialData?.instagram || '',
    intro: initialData?.intro || '',
    idealAge: initialData?.idealAge || '나이 무관',
    idealHeight: initialData?.idealHeight || '키 무관',
    idealJob: initialData?.idealJob || '',
    idealDesc: initialData?.idealDesc || '',
  })
  const [errors, setErrors] = useState({})

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })) }

  const age = calcAge(form.birthYear)

  const validateStep1 = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = '이름을 입력해주세요'
    if (!form.birthYear) errs.birthYear = '출생연도를 선택해주세요'
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
      age: age,
      heightRange: form.heightRange,
      region: form.region,
      city: sanitize(form.city),
      job: form.job,
      workplace: sanitize(form.workplace),
      education: form.education,
      religion: form.religion,
      drink: form.drink,
      smoke: form.smoke,
      mbti: form.mbti,
      instagram: sanitize(form.instagram).replace('@',''),
      intro: sanitize(form.intro),
      idealAge: form.idealAge,
      idealHeight: form.idealHeight,
      idealJob: sanitize(form.idealJob),
      idealDesc: sanitize(form.idealDesc),
      photos,
      matchmakerName: matchmakerName || '',
    })
  }

  const STEPS = ['기본 정보', '자기소개 & 생활', '이상형']

  return (
    <div style={{ background: '#fff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 24px rgba(180,80,100,0.1)', border: '1px solid #f5e0e8' }}>
      {/* 헤더 */}
      <div style={{ background: 'linear-gradient(135deg,#fdf0f4,#f0d8e8)', padding: '20px 20px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{ fontSize: 11, fontWeight: i+1 === step ? 700 : 400, color: i+1 === step ? '#e05a7a' : '#c0a0b0' }}>
              {i+1}. {s}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[1,2,3].map(s => <div key={s} style={{ flex: 1, height: 4, borderRadius: 4, background: s <= step ? '#e05a7a' : '#f0d0dc', transition: 'background 0.3s' }} />)}
        </div>
      </div>

      <div style={{ padding: '20px' }}>

        {/* STEP 1 */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* 사진 업로드 */}
            <div>
              <label style={labelStyle}>사진 (최대 5장)</label>
              <ImageUploader photos={photos} onChange={setPhotos} />
            </div>

            {/* 이름 */}
            <div>
              <label style={labelStyle}>이름 *</label>
              <input style={{ ...inputStyle, borderColor: errors.name ? '#e05a7a' : '#f0dce6' }} value={form.name} onChange={e => set('name', e.target.value)} placeholder="홍길동" maxLength={20} />
              {errors.name && <div style={{ fontSize: 11, color: '#e05a7a', marginTop: 3 }}>{errors.name}</div>}
            </div>

            {/* 성별 */}
            <div>
              <label style={labelStyle}>성별 *</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {['여', '남'].map(g => (
                  <button key={g} onClick={() => set('gender', g)} style={{ flex: 1, padding: '11px', borderRadius: 10, fontSize: 14, fontWeight: 700, border: `1.5px solid ${form.gender === g ? '#e05a7a' : '#f0dce6'}`, background: form.gender === g ? '#fdf0f4' : '#fff', color: form.gender === g ? '#e05a7a' : '#b08898', cursor: 'pointer' }}>
                    {g === '여' ? '♀ 여성' : '♂ 남성'}
                  </button>
                ))}
              </div>
            </div>

            {/* 출생연도 + 나이 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={labelStyle}>출생연도 *</label>
                <select style={{ ...selectStyle, borderColor: errors.birthYear ? '#e05a7a' : '#f0dce6' }} value={form.birthYear} onChange={e => set('birthYear', e.target.value)}>
                  <option value="">연도 선택</option>
                  {BIRTH_YEARS.map(y => <option key={y} value={y}>{y}년</option>)}
                </select>
                {errors.birthYear && <div style={{ fontSize: 11, color: '#e05a7a', marginTop: 3 }}>{errors.birthYear}</div>}
              </div>
              <div>
                <label style={labelStyle}>만 나이</label>
                <div style={{ ...inputStyle, background: '#faf7f8', color: age ? '#c94070' : '#b08898', fontWeight: age ? 700 : 400, display: 'flex', alignItems: 'center' }}>
                  {age ? `만 ${age}세` : '자동입력'}
                </div>
              </div>
            </div>

            {/* 키 범위 */}
            <div>
              <label style={labelStyle}>키 범위</label>
              <select style={selectStyle} value={form.heightRange} onChange={e => set('heightRange', e.target.value)}>
                {HEIGHT_VALUES.map(h => <option key={h} value={h}>{h}cm</option>)}
              </select>
            </div>

            {/* 지역 + 상세 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={labelStyle}>거주 지역</label>
                <select style={selectStyle} value={form.region} onChange={e => set('region', e.target.value)}>
                  {REGIONS.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>사는 곳 (상세)</label>
                <input style={inputStyle} value={form.city} onChange={e => set('city', e.target.value)} placeholder="창원시, 강남구 등" maxLength={20} />
              </div>
            </div>

            {/* 직업 + 직장명 */}
            <div>
              <label style={labelStyle}>직업</label>
              <select style={selectStyle} value={form.job} onChange={e => set('job', e.target.value)}>
                {JOBS.map(j => <option key={j}>{j}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>직장명 (선택)</label>
              <input style={inputStyle} value={form.workplace} onChange={e => set('workplace', e.target.value)} placeholder="삼성전자, 경남테크노파크 등" maxLength={50} />
            </div>

            {/* 학력 */}
            <div>
              <label style={labelStyle}>학력</label>
              <select style={selectStyle} value={form.education} onChange={e => set('education', e.target.value)}>
                {EDUCATIONS.map(e => <option key={e}>{e}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={labelStyle}>종교</label>
                <select style={selectStyle} value={form.religion} onChange={e => set('religion', e.target.value)}>
                  {RELIGIONS.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>MBTI</label>
                <select style={selectStyle} value={form.mbti} onChange={e => set('mbti', e.target.value)}>
                  <option value="">선택 안 함</option>
                  {MBTI_LIST.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>음주</label>
                <select style={selectStyle} value={form.drink} onChange={e => set('drink', e.target.value)}>
                  {DRINKS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>흡연</label>
                <select style={selectStyle} value={form.smoke} onChange={e => set('smoke', e.target.value)}>
                  {SMOKES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* 인스타그램 */}
            <div>
              <label style={labelStyle}>인스타그램 (선택)</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#b08898', fontSize: 14, fontWeight: 600 }}>@</span>
                <input style={{ ...inputStyle, paddingLeft: 28 }} value={form.instagram} onChange={e => set('instagram', e.target.value.replace('@',''))} placeholder="instagram_id" maxLength={50} />
              </div>
            </div>

            {/* 자기소개 */}
            <div>
              <label style={labelStyle}>자기소개</label>
              <textarea
                style={{ ...inputStyle, height: 120, resize: 'vertical', lineHeight: 1.65 }}
                value={form.intro} onChange={e => set('intro', e.target.value)}
                placeholder="나를 한마디로 표현하자면..." maxLength={500}
              />
              <div style={{ fontSize: 11, color: '#b08898', textAlign: 'right', marginTop: 3 }}>{form.intro.length}/500</div>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={labelStyle}>선호 나이대</label>
                <select style={selectStyle} value={form.idealAge} onChange={e => set('idealAge', e.target.value)}>
                  {AGE_RANGES.map(a => <option key={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>선호 키</label>
                <select style={selectStyle} value={form.idealHeight} onChange={e => set('idealHeight', e.target.value)}>
                  {HEIGHT_RANGES.map(h => <option key={h}>{h}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label style={labelStyle}>직업 관련 선호</label>
              <input style={inputStyle} value={form.idealJob} onChange={e => set('idealJob', e.target.value)} placeholder="예: 안정적인 직업이면 좋겠어요" maxLength={100} />
            </div>
            <div>
              <label style={labelStyle}>이상형 소개</label>
              <textarea
                style={{ ...inputStyle, height: 100, resize: 'vertical', lineHeight: 1.65 }}
                value={form.idealDesc} onChange={e => set('idealDesc', e.target.value)}
                placeholder="예: 유머 감각 있고 가족을 소중히 여기는 분" maxLength={300}
              />
              <div style={{ fontSize: 11, color: '#b08898', textAlign: 'right', marginTop: 3 }}>{form.idealDesc.length}/300</div>
            </div>

            {/* 주선자 이름 표시 */}
            {matchmakerName && (
              <div style={{ background: '#fdf6f9', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#9c6278' }}>
                💕 주선자: <strong>{matchmakerName}</strong>
              </div>
            )}
          </div>
        )}

        {/* 버튼 */}
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button onClick={step === 1 ? onCancel : () => setStep(s => s - 1)} style={{ flex: 1, padding: '13px', borderRadius: 12, border: '1.5px solid #f0dce6', background: '#fff', color: '#b08898', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            {step === 1 ? '취소' : '← 이전'}
          </button>
          {step < 3
            ? <button onClick={handleNext} style={{ flex: 2, padding: '13px', borderRadius: 12, border: 'none', background: '#e05a7a', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>다음 →</button>
            : <button onClick={handleSubmit} disabled={loading} style={{ flex: 2, padding: '13px', borderRadius: 12, border: 'none', background: loading ? '#f0dce6' : '#e05a7a', color: '#fff', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}>
                {loading ? '⏳ 저장 중...' : isEdit ? '✓ 수정 완료' : '✓ 프로필 등록'}
              </button>
          }
        </div>
      </div>
    </div>
  )
}
