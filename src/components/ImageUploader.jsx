import { useRef } from 'react'

const MAX_PHOTOS = 5
const MAX_SIZE_KB = 200 // 각 이미지 최대 200KB로 압축

function compressImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let { width, height } = img

        // 최대 800px
        const maxDim = 800
        if (width > maxDim || height > maxDim) {
          if (width > height) { height = (height / width) * maxDim; width = maxDim }
          else { width = (width / height) * maxDim; height = maxDim }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        // 품질 조정해서 목표 크기 맞추기
        let quality = 0.8
        let result = canvas.toDataURL('image/jpeg', quality)

        while (result.length > MAX_SIZE_KB * 1024 * 1.37 && quality > 0.3) {
          quality -= 0.1
          result = canvas.toDataURL('image/jpeg', quality)
        }

        resolve(result)
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

export default function ImageUploader({ photos = [], onChange }) {
  const inputRef = useRef()

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files)
    const remaining = MAX_PHOTOS - photos.length
    const toProcess = files.slice(0, remaining)

    const compressed = await Promise.all(toProcess.map(compressImage))
    onChange([...photos, ...compressed])
    e.target.value = ''
  }

  const removePhoto = (idx) => {
    onChange(photos.filter((_, i) => i !== idx))
  }

  return (
    <div>
      {/* 사진 미리보기 */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
        {photos.map((src, i) => (
          <div key={i} style={{ position: 'relative', width: 80, height: 80 }}>
            <img
              src={src} alt={`사진 ${i+1}`}
              style={{ width: 80, height: 80, borderRadius: 12, objectFit: 'cover', border: '2px solid #f5e0e8' }}
            />
            {/* 삭제 버튼 */}
            <button
              onClick={() => removePhoto(i)}
              style={{
                position: 'absolute', top: -6, right: -6,
                width: 22, height: 22, borderRadius: '50%',
                background: '#e05a7a', border: '2px solid #fff',
                color: '#fff', fontSize: 12, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, lineHeight: 1,
              }}
            >×</button>
            {i === 0 && (
              <div style={{ position: 'absolute', bottom: 4, left: 4, background: 'rgba(224,90,122,0.85)', color: '#fff', fontSize: 9, fontWeight: 700, borderRadius: 4, padding: '1px 4px' }}>
                대표
              </div>
            )}
          </div>
        ))}

        {/* 추가 버튼 */}
        {photos.length < MAX_PHOTOS && (
          <button
            onClick={() => inputRef.current.click()}
            style={{
              width: 80, height: 80, borderRadius: 12,
              border: '2px dashed #f0dce6', background: '#fdf6f9',
              cursor: 'pointer', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 4,
              color: '#c97090',
            }}
          >
            <span style={{ fontSize: 22 }}>+</span>
            <span style={{ fontSize: 10, fontWeight: 600 }}>{photos.length}/{MAX_PHOTOS}</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFiles}
        style={{ display: 'none' }}
      />

      <div style={{ fontSize: 11, color: '#b08898' }}>
        📷 최대 {MAX_PHOTOS}장 · 첫 번째 사진이 대표 사진으로 표시됩니다
      </div>
    </div>
  )
}
