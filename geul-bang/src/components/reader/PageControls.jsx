import { css } from 'styled-system/css'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const wrap = css({
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 4px',
})

const btn = css({
  pointerEvents: 'all',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '16px 8px',
  opacity: 0.2,
  color: 'inherit',
  transition: 'opacity 0.15s',
  _hover: { opacity: 0.6 },
  _disabled: { opacity: 0.05, cursor: 'default' },
})

const pageNum = css({
  position: 'absolute',
  bottom: '12px',
  left: '50%',
  transform: 'translateX(-50%)',
  fontSize: '11px',
  opacity: 0.35,
  pointerEvents: 'none',
  color: 'inherit',
  userSelect: 'none',
  whiteSpace: 'nowrap',
})

export default function PageControls({ currentPage, totalPages, onPrev, onNext }) {
  return (
    <>
      <div className={wrap}>
        <button className={btn} onClick={onPrev} disabled={currentPage === 0}>
          <ChevronLeft size={32} />
        </button>
        <button className={btn} onClick={onNext} disabled={currentPage >= totalPages - 1}>
          <ChevronRight size={32} />
        </button>
      </div>
      <p className={pageNum}>{currentPage + 1} / {totalPages}</p>
    </>
  )
}
