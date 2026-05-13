import { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react'

const H_PAD = 48 // 24px * 2

function getInitialColWidth() {
  return typeof window !== 'undefined' ? Math.max(200, window.innerWidth - H_PAD) : 300
}

export function usePageMode({ enabled, text, fontSize, initialProgress = 0 }) {
  const wrapperRef = useRef(null)
  const columnRef = useRef(null)
  const initialized = useRef(false)

  const [state, setState] = useState(() => ({
    currentPage: 0,
    totalPages: 1,
    colWidth: getInitialColWidth(),
  }))

  const measure = useCallback(() => {
    const wrapper = wrapperRef.current
    const col = columnRef.current
    if (!wrapper || !col) return
    const outerW = wrapper.clientWidth
    if (!outerW) return
    const colW = outerW - H_PAD
    const scrollW = col.scrollWidth
    const total = Math.max(1, Math.round((scrollW - H_PAD) / colW))
    setState(prev => {
      const page = !initialized.current && initialProgress > 0
        ? Math.min(Math.round(initialProgress * (total - 1)), total - 1)
        : Math.min(prev.currentPage, total - 1)
      if (!initialized.current) initialized.current = true
      return { currentPage: page, totalPages: total, colWidth: colW }
    })
  }, [initialProgress])

  // Re-measure when text, fontSize, or enabled changes
  useLayoutEffect(() => {
    if (!enabled || !text) return
    initialized.current = false
    let raf1, raf2
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(measure)
    })
    return () => { cancelAnimationFrame(raf1); cancelAnimationFrame(raf2) }
  }, [enabled, text, fontSize, measure])

  // Re-measure on resize
  useEffect(() => {
    if (!enabled || !wrapperRef.current) return
    const ro = new ResizeObserver(() => {
      requestAnimationFrame(measure)
    })
    ro.observe(wrapperRef.current)
    return () => ro.disconnect()
  }, [enabled, measure])

  const goNext = useCallback(() =>
    setState(s => ({ ...s, currentPage: Math.min(s.currentPage + 1, s.totalPages - 1) })), [])

  const goPrev = useCallback(() =>
    setState(s => ({ ...s, currentPage: Math.max(s.currentPage - 1, 0) })), [])

  const progressRatio = state.totalPages > 1 ? state.currentPage / (state.totalPages - 1) : 0

  return { ...state, goNext, goPrev, progressRatio, wrapperRef, columnRef }
}
