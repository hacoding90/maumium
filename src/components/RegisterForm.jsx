import { useState } from 'react'
import ImageUploader from './ImageUploader.jsx'

const REGIONS = ['서울','경기','인천','부산','대구','광주','대전','울산','세종','강원','충북','충남','전북','전남','경북','경남','제주']
const JOBS = ['회사원','공무원','교사/교수','의사/한의사','간호사','약사','치과의사','변호사/법조인','회계사/세무사','건축사/엔지니어','IT/개발자','금융/증권','경영/컨설팅','연구원','자영업','프리랜서','예술/창작','기타']
const EDUCATIONS = ['고졸','전문대졸','4년제 대학교','대학원(석사)','대학원(박사)']
const RELIGIONS = ['무교','기독교','천주교','불교','기타']
const DRINKS = ['전혀 안 함','가끔','즐겨 함']
const SMOKES = ['비흡연','흡연','금연 중']
const MBTI_LIST = ['INTJ','INTP','ENTJ','ENTP','INFJ','INFP','ENFJ','ENFP','ISTJ','ISFJ','ESTJ','ESFJ','ISTP','ISFP','ESTP','ESFP']
const AGE_RANGES = ['나이 무관','20-25세','26-30세','31-35세','36-40세','41세 이상']
const HEIGHT_RANGES = ['키 무관','150cm 이하','150~155cm','155~160cm','160~165cm','165~170cm','170~175cm','175~180cm','180~185cm','185cm 이상']
const HEIGHT_VALUES = ['150 이하','150~155','155~160','160~165','165~170','170~175','175~180','180~185','185 이상']

const currentYear = new Date().getFullYear()
const BIRTH_YEARS = Array.from({ length: 46 }, (_, i) => 2005 - i)
const calcAge = (y) => y ? currentYear - Number(y) : null
const sanitize = str => String(str || '').replace(/[<>"']/g, '').trim().slice(0, 500)

// 애플 스타일 공통
const card = { background: '#fff', borderRadius: 16, padding: '16px', marginBottom: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }
const label = { fontSize: 12, fontWeight: 600, color: '#8e8e93', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: 0.3 }
const input = { width: '100%', padding: '12px 14px', borderRadius: 12, border: '1.5px solid #e5e5ea', fontSize: 15, color: '#1c1c1e', background: '#f9f9f9', boxSizing: 'border-box' }
const select = { ...input, cursor: 'pointer' }

function Field({ label: lbl, children, hint }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={label}>{lbl}</label>
      {children}
      {hint && <div style={{ fontSize: 12, color: '#aeaeb2', marginTop: 4 }}>{hint}</div>}
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

  const validate1 = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = '이름을 입력해주세요'
    if (!form.birthYear) errs.birthYear = '출생연도를 선택해주세요'
    setErrors(errs)
    return !Object.keys(errs).length
  }

  const handleNext = () => { if (step === 1 && !validate1()) return; setStep(s => s + 1) }

  const handleSubmit = () => {
    onSubmit({
      name: sanitize(form.name), gender: form.gender,
      birthYear: Number(form.birthYear), age,
      heightRange: form.heightRange,
      region: form.region, city: sanitize(form.city),
      job: form.job, workplace: sanitize(form.workplace), education: form.education,
      religion: form.religion, drink: form.drink, smoke: form.smoke, mbti: form.mbti,
      instagram: sanitize(form.instagram).replace('@',''),
      intro: sanitize(form.intro),
      idealAge: form.idealAge, idealHeight: form.idealHeight,
      idealJob: sanitize(form.idealJob), idealDesc: sanitize(form.idealDesc),
      photos, matchmakerName: matchmakerName || '',
    })
  }

  const STEPS = ['기본 정보', '생활 & 소개', '이상형']

  return (
    <div>
      {/* 진행 바 */}
      <div style={{ ...card, padding: '14px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          {STEPS.map((s, i) => (
            <span key={i} style={{ fontSize: 12, fontWeight: i+1 === step ? 600 : 400, color: i+1 === step ? '#FF3B7A' : '#aeaeb2' }}>
              {i+1}. {s}
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {[1,2,3].map(s => <div key={s} style={{ flex: 1, height: 3, borderRadius: 2, background: s <= step ? '#FF3B7A' : '#e5e5ea', transition: 'background 0.3s' }} />)}
        </div>
      </div>

      {/* STEP 1 */}
      {step === 1 && (
        <>
          <div style={card}>
            <label style={label}>사진 (최대 5장)</label>
            <ImageUploader photos={photos} onChange={setPhotos} />
          </div>

          <div style={card}>
            <Field label="이름 *">
              <input style={{ ...input, borderColor: errors.name ? '#FF3B7A' : '#e5e5ea' }} value={form.name} onChange={e => set('name', e.target.value)} placeholder="홍길동" maxLength={20} />
              {errors.name && <div style={{ fontSize: 12, color: '#FF3B7A', marginTop: 4 }}>{errors.name}</div>}
            </Field>

            <Field label="성별 *">
              <div style={{ display: 'flex', gap: 8 }}>
                {['여', '남'].map(g => (
                  <button key={g} onClick={() => set('gender', g)} style={{ flex: 1, padding: '12px', borderRadius: 12, fontSize: 15, fontWeight: 600, border: 'none', background: form.gender === g ? '#FF3B7A' : '#f2f2f7', color: form.gender === g ? '#fff' : '#8e8e93', cursor: 'pointer' }}>
                    {g === '여' ? '♀ 여성' : '♂ 남성'}
                  </button>
                ))}
              </div>
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
              <div>
                <label style={label}>출생연도 *</label>
                <select style={{ ...select, borderColor: errors.birthYear ? '#FF3B7A' : '#e5e5ea' }} value={form.birthYear} onChange={e => set('birthYear', e.target.value)}>
                  <option value="">선택</option>
                  {BIRTH_YEARS.map(y => <option key={y} value={y}>{y}년</option>)}
                </select>
                {errors.birthYear && <div style={{ fontSize: 12, color: '#FF3B7A', marginTop: 4 }}>{errors.birthYear}</div>}
              </div>
              <div>
                <label style={label}>만 나이</label>
                <div style={{ ...input, background: '#f2f2f7', color: age ? '#FF3B7A' : '#aeaeb2', fontWeight: age ? 700 : 400, display: 'flex', alignItems: 'center' }}>
                  {age ? `만 ${age}세` : '자동입력'}
                </div>
              </div>
            </div>

            <Field label="키 범위">
              <select style={select} value={form.heightRange} onChange={e => set('heightRange', e.target.value)}>
                {HEIGHT_VALUES.map(h => <option key={h} value={h}>{h}cm</option>)}
              </select>
            </Field>
          </div>

          <div style={card}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
              <div>
                <label style={label}>거주 지역</label>
                <select style={select} value={form.region} onChange={e => set('region', e.target.value)}>
                  {REGIONS.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label style={label}>상세 주소</label>
                <input style={input} value={form.city} onChange={e => set('city', e.target.value)} placeholder="창원시, 강남구" maxLength={20} />
              </div>
            </div>

            <Field label="직업">
              <select style={select} value={form.job} onChange={e => set('job', e.target.value)}>
                {JOBS.map(j => <option key={j}>{j}</option>)}
              </select>
            </Field>
            <Field label="직장명 (선택)">
              <input style={input} value={form.workplace} onChange={e => set('workplace', e.target.value)} placeholder="회사명 (선택사항)" maxLength={50} />
            </Field>
            <Field label="학력">
              <select style={select} value={form.education} onChange={e => set('education', e.target.value)}>
                {EDUCATIONS.map(e => <option key={e}>{e}</option>)}
              </select>
            </Field>
          </div>
        </>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <>
          <div style={card}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { label: '종교', key: 'religion', opts: RELIGIONS },
                { label: 'MBTI', key: 'mbti', opts: MBTI_LIST, placeholder: '선택 안 함' },
                { label: '음주', key: 'drink', opts: DRINKS },
                { label: '흡연', key: 'smoke', opts: SMOKES },
              ].map(f => (
                <div key={f.key}>
                  <label style={label}>{f.label}</label>
                  <select style={select} value={form[f.key]} onChange={e => set(f.key, e.target.value)}>
                    {f.placeholder && <option value="">{f.placeholder}</option>}
                    {f.opts.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div style={card}>
            <Field label="인스타그램 (선택)">
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#aeaeb2', fontSize: 15 }}>@</span>
                <input style={{ ...input, paddingLeft: 30 }} value={form.instagram} onChange={e => set('instagram', e.target.value.replace('@',''))} placeholder="instagram_id" maxLength={50} />
              </div>
            </Field>

            <Field label="자기소개">
              <textarea
                style={{ ...input, height: 120, resize: 'vertical', lineHeight: 1.6 }}
                value={form.intro} onChange={e => set('intro', e.target.value)}
                placeholder="나를 소개해주세요..." maxLength={500}
              />
              <div style={{ fontSize: 12, color: '#aeaeb2', textAlign: 'right', marginTop: 4 }}>{form.intro.length}/500</div>
            </Field>
          </div>
        </>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <>
          <div style={card}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
              <div>
                <label style={label}>선호 나이대</label>
                <select style={select} value={form.idealAge} onChange={e => set('idealAge', e.target.value)}>
                  {AGE_RANGES.map(a => <option key={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label style={label}>선호 키</label>
                <select style={select} value={form.idealHeight} onChange={e => set('idealHeight', e.target.value)}>
                  {HEIGHT_RANGES.map(h => <option key={h}>{h}</option>)}
                </select>
              </div>
            </div>
            <Field label="직업 선호">
              <input style={input} value={form.idealJob} onChange={e => set('idealJob', e.target.value)} placeholder="예: 안정적인 직업이면 좋겠어요" maxLength={100} />
            </Field>
            <Field label="이상형 소개">
              <textarea style={{ ...input, height: 100, resize: 'vertical', lineHeight: 1.6 }} value={form.idealDesc} onChange={e => set('idealDesc', e.target.value)} placeholder="어떤 분을 원하시나요?" maxLength={300} />
              <div style={{ fontSize: 12, color: '#aeaeb2', textAlign: 'right', marginTop: 4 }}>{form.idealDesc.length}/300</div>
            </Field>

            {matchmakerName && (
              <div style={{ background: '#FFF0F5', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#FF3B7A', fontWeight: 500 }}>
                💕 주선자: {matchmakerName}
              </div>
            )}
          </div>
        </>
      )}

      {/* 버튼 */}
      <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
        <button onClick={step === 1 ? onCancel : () => setStep(s => s - 1)} style={{ flex: 1, padding: '14px', borderRadius: 14, border: 'none', background: '#f2f2f7', color: '#1c1c1e', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
          {step === 1 ? '취소' : '이전'}
        </button>
        {step < 3
          ? <button onClick={handleNext} style={{ flex: 2, padding: '14px', borderRadius: 14, border: 'none', background: '#FF3B7A', color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>다음</button>
          : <button onClick={handleSubmit} disabled={loading} style={{ flex: 2, padding: '14px', borderRadius: 14, border: 'none', background: loading ? '#e5e5ea' : '#FF3B7A', color: loading ? '#aeaeb2' : '#fff', fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? '저장 중...' : isEdit ? '수정 완료' : '등록 완료'}
            </button>
        }
      </div>
    </div>
  )
}
