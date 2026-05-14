import { css } from 'styled-system/css'
import { Settings, X } from 'lucide-react'
import { useState } from 'react'

const toggleBtn = css({
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: 'token(colors.text.muted)',
  padding: '4px',
  borderRadius: '6px',
  _hover: { background: 'token(colors.bg.subtle)' },
})

const panel = css({
  position: 'fixed',
  bottom: { base: '0', sm: '24px' },
  right: { base: '0', sm: '24px' },
  left: { base: '0', sm: 'auto' },
  background: 'token(colors.bg.card)',
  border: '1px solid token(colors.border)',
  borderRadius: { base: '12px 12px 0 0', sm: '12px' },
  padding: '20px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
  zIndex: 200,
  minWidth: { base: 'auto', sm: '240px' },
})

const panelHeader = css({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '16px',
  fontSize: '14px',
  fontWeight: '600',
  color: 'token(colors.text)',
})

const section = css({ marginBottom: '16px' })
const label = css({ fontSize: '12px', color: 'token(colors.text.muted)', marginBottom: '8px' })

const sizeRow = css({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
})

const sizeBtn = css({
  width: '32px',
  height: '32px',
  borderRadius: '6px',
  border: '1px solid token(colors.border)',
  background: 'token(colors.bg.subtle)',
  cursor: 'pointer',
  fontSize: '16px',
  color: 'token(colors.text)',
  _hover: { background: 'token(colors.border)' },
})

const sizeVal = css({ fontSize: '14px', color: 'token(colors.text)', minWidth: '32px', textAlign: 'center' })

const btnRow = css({ display: 'flex', gap: '8px' })

const optBtn = css({
  flex: 1,
  padding: '6px',
  borderRadius: '6px',
  border: '1px solid token(colors.border)',
  cursor: 'pointer',
  fontSize: '12px',
  transition: 'border-color 0.15s',
  background: 'token(colors.bg.subtle)',
  color: 'token(colors.text)',
})

const THEMES = [
  { key: 'light', label: '라이트', bg: '#ffffff', text: '#1a1a1a' },
  { key: 'dark', label: '다크', bg: '#1a1a1a', text: '#e0e0e0' },
  { key: 'sepia', label: '세피아', bg: '#f4ecd8', text: '#3b2f2f' },
]

export default function ReaderSettings({ settings, onChange }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button className={toggleBtn} onClick={() => setOpen((v) => !v)} title="설정">
        <Settings size={20} />
      </button>

      {open && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 199 }}
            onClick={() => setOpen(false)}
          />
          <div className={panel}>
            <div className={panelHeader}>
              뷰어 설정
              <button className={toggleBtn} onClick={() => setOpen(false)}><X size={16} /></button>
            </div>

            <div className={section}>
              <p className={label}>글자 크기</p>
              <div className={sizeRow}>
                <button className={sizeBtn} onClick={() => onChange({ fontSize: Math.max(12, settings.fontSize - 2) })}>−</button>
                <span className={sizeVal}>{settings.fontSize}px</span>
                <button className={sizeBtn} onClick={() => onChange({ fontSize: Math.min(28, settings.fontSize + 2) })}>+</button>
              </div>
            </div>

            <div className={section}>
              <p className={label}>테마</p>
              <div className={btnRow}>
                {THEMES.map((t) => (
                  <button
                    key={t.key}
                    className={optBtn}
                    style={{
                      background: t.bg,
                      color: t.text,
                      borderColor: settings.theme === t.key ? 'var(--colors-accent)' : undefined,
                      borderWidth: settings.theme === t.key ? '2px' : undefined,
                    }}
                    onClick={() => onChange({ theme: t.key })}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className={section}>
              <p className={label}>서체</p>
              <div className={btnRow}>
                {[
                  { key: 'serif', label: '명조체', style: { fontFamily: 'var(--fonts-reader)' } },
                  { key: 'sans', label: '고딕체', style: { fontFamily: 'var(--fonts-ui)' } },
                ].map((f) => (
                  <button
                    key={f.key}
                    className={optBtn}
                    style={{
                      ...f.style,
                      borderColor: settings.font === f.key ? 'var(--colors-accent)' : undefined,
                      borderWidth: settings.font === f.key ? '2px' : undefined,
                      fontWeight: settings.font === f.key ? '600' : undefined,
                    }}
                    onClick={() => onChange({ font: f.key })}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className={section}>
              <p className={label}>읽기 방식</p>
              <div className={btnRow}>
                {[{ key: 'scroll', label: '스크롤' }, { key: 'page', label: '페이지' }].map((m) => (
                  <button
                    key={m.key}
                    className={optBtn}
                    style={{
                      borderColor: settings.mode === m.key ? 'var(--colors-accent)' : undefined,
                      borderWidth: settings.mode === m.key ? '2px' : undefined,
                      fontWeight: settings.mode === m.key ? '600' : undefined,
                    }}
                    onClick={() => onChange({ mode: m.key })}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
