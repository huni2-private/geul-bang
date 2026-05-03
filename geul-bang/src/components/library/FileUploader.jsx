import { useRef } from 'react'
import { css } from 'styled-system/css'
import { Upload } from 'lucide-react'

const btn = css({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '10px 20px',
  borderRadius: '8px',
  background: 'token(colors.accent.DEFAULT)',
  color: '#fff',
  fontSize: '14px',
  fontWeight: '600',
  border: 'none',
  cursor: 'pointer',
  transition: 'opacity 0.15s',
  _hover: { opacity: 0.85 },
  _disabled: { opacity: 0.5, cursor: 'not-allowed' },
})

export default function FileUploader({ onUpload, uploading }) {
  const inputRef = useRef(null)

  function handleChange(e) {
    const file = e.target.files?.[0]
    if (file) {
      onUpload(file)
      e.target.value = ''
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".txt"
        style={{ display: 'none' }}
        onChange={handleChange}
      />
      <button
        className={btn}
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        <Upload size={16} />
        {uploading ? '업로드 중...' : '소설 추가'}
      </button>
    </>
  )
}
