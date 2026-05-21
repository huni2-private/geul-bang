// 서재 소설 카드 — 커버 이니셜 블록 + 진행률 바
import { useState } from 'react'
import { css } from 'styled-system/css'
import { useNavigate } from 'react-router-dom'
import { Trash2 } from 'lucide-react'

function titleColors(str) {
  const hue = [...str].reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) & 0xffff, 0) % 360
  return {
    gradient: `linear-gradient(135deg, hsl(${hue}, 55%, 60%), hsl(${hue}, 62%, 38%))`,
    solid: `hsl(${hue}, 55%, 50%)`,
  }
}

const card = css({
  background: 'token(colors.bg.card)',
  border: '1px solid token(colors.border)',
  borderRadius: '10px',
  padding: '12px 16px 12px 12px',
  cursor: 'pointer',
  transition: 'box-shadow 0.15s',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  _hover: { boxShadow: '0 4px 12px rgba(0,0,0,0.08)' },
})

const cover = css({
  width: '64px',
  height: '80px',
  borderRadius: '8px',
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '26px',
  fontWeight: '700',
  color: 'white',
})

const contentWrap = css({
  flex: 1,
  minWidth: 0,
})

const titleRow = css({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: '8px',
  marginBottom: '8px',
})

const title = css({
  fontSize: '16px',
  fontWeight: '600',
  color: 'token(colors.text)',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  flex: 1,
})

const meta = css({
  fontSize: '12px',
  color: 'token(colors.text.muted)',
  marginBottom: '10px',
})

const barWrap = css({
  background: 'token(colors.border)',
  borderRadius: '99px',
  height: '6px',
  overflow: 'hidden',
})

const bar = css({
  height: '100%',
  background: 'token(colors.accent)',
  borderRadius: '99px',
  transition: 'width 0.3s ease',
})

const pct = css({
  fontSize: '11px',
  color: 'token(colors.text.muted)',
  marginTop: '4px',
  textAlign: 'right',
})

const deleteBtn = css({
  flexShrink: 0,
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '2px',
  color: 'token(colors.text.muted)',
  borderRadius: '4px',
  _hover: { color: '#ef4444', background: '#fee2e2' },
})

const confirmRow = css({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  justifyContent: 'flex-end',
})

const confirmMsg = css({
  fontSize: '12px',
  color: 'token(colors.text.muted)',
  flex: 1,
})

const cancelBtn = css({
  fontSize: '12px',
  padding: '3px 10px',
  borderRadius: '6px',
  border: '1px solid token(colors.border)',
  background: 'token(colors.bg.card)',
  color: 'token(colors.text.muted)',
  cursor: 'pointer',
  _hover: { background: 'token(colors.bg.subtle)' },
})

const confirmBtn = css({
  fontSize: '12px',
  padding: '3px 10px',
  borderRadius: '6px',
  border: 'none',
  background: '#ef4444',
  color: '#fff',
  cursor: 'pointer',
  fontWeight: '600',
  _hover: { background: '#dc2626' },
})

function formatDate(ts) {
  if (!ts) return ''
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function NovelCard({ novel, onDelete }) {
  const navigate = useNavigate()
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const pctVal = Math.round((novel.progressRatio || 0) * 100)
  const { gradient, solid } = titleColors(novel.title || '')
  const isUploading = novel.chunksReady === false

  function handleDeleteClick(e) {
    e.stopPropagation()
    setConfirming(true)
  }

  function handleCancel(e) {
    e.stopPropagation()
    setConfirming(false)
  }

  async function handleConfirm(e) {
    e.stopPropagation()
    setDeleting(true)
    try {
      await onDelete(novel)
    } catch {
      setDeleting(false)
      setConfirming(false)
    }
  }

  return (
    <div
      className={card}
      onClick={() => !confirming && !deleting && !isUploading && navigate(`/reader/${novel.id}`)}
      style={isUploading ? { cursor: 'default', opacity: 0.75 } : undefined}
    >
      <div className={cover} style={{ background: gradient }}>
        {novel.title.charAt(0)}
      </div>
      <div className={contentWrap}>
        <div className={titleRow}>
          <span className={title}>{novel.title}</span>
          {!confirming && !deleting && !isUploading && (
            <button className={deleteBtn} onClick={handleDeleteClick} title="삭제">
              <Trash2 size={15} />
            </button>
          )}
        </div>
        {isUploading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--colors-text-muted)', fontSize: 13 }}>
            <div style={{
              width: 14, height: 14, borderRadius: '50%',
              border: '2px solid currentColor', borderTopColor: 'transparent',
              animation: 'spin 0.8s linear infinite', flexShrink: 0,
            }} />
            소설 내용 저장 중...
          </div>
        ) : deleting ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--colors-text-muted)', fontSize: 13 }}>
            <div style={{
              width: 14, height: 14, borderRadius: '50%',
              border: '2px solid currentColor', borderTopColor: 'transparent',
              animation: 'spin 0.8s linear infinite', flexShrink: 0,
            }} />
            삭제 중...
          </div>
        ) : confirming ? (
          <div className={confirmRow}>
            <span className={confirmMsg}>삭제하면 복구할 수 없어요.</span>
            <button className={cancelBtn} onClick={handleCancel}>취소</button>
            <button className={confirmBtn} onClick={handleConfirm}>삭제</button>
          </div>
        ) : (
          <>
            <p className={meta}>마지막: {formatDate(novel.lastReadAt)}</p>
            <div className={barWrap}>
              <div className={bar} style={{ width: `${pctVal}%`, background: solid }} />
            </div>
            <p className={pct}>{pctVal}%</p>
          </>
        )}
      </div>
    </div>
  )
}
