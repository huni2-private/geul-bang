import { css } from 'styled-system/css'
import { useNavigate } from 'react-router-dom'
import { Trash2 } from 'lucide-react'

const card = css({
  background: 'token(colors.bg.card)',
  border: '1px solid token(colors.border)',
  borderRadius: '10px',
  padding: '16px',
  cursor: 'pointer',
  transition: 'box-shadow 0.15s',
  _hover: { boxShadow: '0 4px 12px rgba(0,0,0,0.08)' },
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

function formatDate(ts) {
  if (!ts) return ''
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function NovelCard({ novel, onDelete }) {
  const navigate = useNavigate()
  const pctVal = Math.round((novel.progressRatio || 0) * 100)

  function handleDelete(e) {
    e.stopPropagation()
    if (confirm(`"${novel.title}"을(를) 삭제하면 복구할 수 없습니다. 계속하시겠어요?`)) {
      onDelete(novel)
    }
  }

  return (
    <div className={card} onClick={() => navigate(`/reader/${novel.id}`)}>
      <div className={titleRow}>
        <span className={title}>📖 {novel.title}</span>
        <button className={deleteBtn} onClick={handleDelete} title="삭제">
          <Trash2 size={15} />
        </button>
      </div>
      <p className={meta}>마지막: {formatDate(novel.lastReadAt)}</p>
      <div className={barWrap}>
        <div className={bar} style={{ width: `${pctVal}%` }} />
      </div>
      <p className={pct}>{pctVal}%</p>
    </div>
  )
}
