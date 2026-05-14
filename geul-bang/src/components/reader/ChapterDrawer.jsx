// 독자 화면 우측에서 슬라이드 인하는 챕터 목차 드로어
import { css } from 'styled-system/css'
import { BookOpen, X } from 'lucide-react'
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

const backdrop = css({
  position: 'fixed',
  inset: 0,
  zIndex: 199,
})

const drawer = css({
  position: 'fixed',
  top: 0,
  right: 0,
  bottom: 0,
  width: { base: '80vw', sm: '320px' },
  zIndex: 200,
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
  background: 'token(colors.bg.card)',
  color: 'token(colors.text)',
})

const drawerHeader = css({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px 20px',
  borderBottom: '1px solid token(colors.border)',
  fontSize: '14px',
  fontWeight: '600',
  color: 'token(colors.text)',
  flexShrink: 0,
})

const list = css({
  flex: 1,
  overflowY: 'auto',
  padding: '8px 0',
})

const item = css({
  display: 'block',
  width: '100%',
  textAlign: 'left',
  background: 'none',
  border: 'none',
  padding: '10px 20px',
  fontSize: '14px',
  color: 'token(colors.text)',
  cursor: 'pointer',
  lineHeight: '1.4',
  borderLeft: '3px solid transparent',
  _hover: { background: 'token(colors.bg.subtle)' },
})

const itemActive = css({
  borderLeftColor: 'token(colors.accent)',
  color: 'token(colors.accent)',
  fontWeight: '600',
  background: 'token(colors.bg.subtle)',
})

const emptyMsg = css({
  padding: '32px 20px',
  fontSize: '13px',
  color: 'token(colors.text.muted)',
  textAlign: 'center',
  lineHeight: '1.6',
})

export default function ChapterDrawer({ chapters, currentCharOffset, onJump }) {
  const [open, setOpen] = useState(false)

  if (!chapters || chapters.length === 0) return null

  // 현재 읽고 있는 챕터 인덱스
  const activeIdx = chapters.reduce((acc, ch, i) => {
    return ch.charOffset <= currentCharOffset ? i : acc
  }, 0)

  function handleJump(ch) {
    onJump(ch)
    setOpen(false)
  }

  return (
    <>
      <button className={toggleBtn} onClick={() => setOpen(true)} title="목차">
        <BookOpen size={20} />
      </button>

      {open && (
        <>
          <div className={backdrop} onClick={() => setOpen(false)} />
          <div className={drawer}>
            <div className={drawerHeader} style={{ borderColor: 'rgba(128,128,128,0.2)' }}>
              목차 ({chapters.length}화)
              <button className={toggleBtn} onClick={() => setOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <div className={list}>
              {chapters.length === 0 ? (
                <p className={emptyMsg}>챕터를 감지하지 못했습니다.<br />소설 형식에 따라 목차가 지원되지 않을 수 있습니다.</p>
              ) : (
                chapters.map((ch, i) => (
                  <button
                    key={i}
                    className={`${item} ${i === activeIdx ? itemActive : ''}`}
                    onClick={() => handleJump(ch)}
                  >
                    {ch.title}
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </>
  )
}
