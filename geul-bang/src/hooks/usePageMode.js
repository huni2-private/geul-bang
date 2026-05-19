import { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react'

const SWIPE_THRESHOLD = 50

export function usePageMode({ enabled, text, fontSize, initialProgress = 0, hPad = 48 }) {
  const wrapperRef = useRef(null)
  const columnRef = useRef(null)
  const initialized = useRef(false)
  const touchStartX = useRef(null)

  const [state, setState] = useState(() => ({
    currentPage: 0,
    totalPages: 1,
    colWidth: typeof window !== 'undefined' ? Math.max(200, window.innerWidth - hPad) : 300,
  }))

  const measure = useCallback(() => {
    const wrapper = wrapperRef.current
    const col = columnRef.current
    if (!wrapper || !col) return
    const outerW = wrapper.clientWidth
    if (!outerW) return
    const colW = outerW - hPad
    const scrollW = col.scrollWidth
    const total = Math.max(1, Math.round((scrollW - hPad) / colW))
    setState(prev => {
      const page = !initialized.current && initialProgress > 0
        ? Math.min(Math.round(initialProgress * (total - 1)), total - 1)
        : Math.min(prev.currentPage, total - 1)
      if (!initialized.current) initialized.current = true
      return { currentPage: page, totalPages: total, colWidth: colW }
    })
  }, [initialProgress, hPad])

  // Re-measure when text, fontSize, or enabled changes
  useLayoutEffect(() => {
    if (!enabled || !text) return
    initialized.current = false
    let raf1, raf2
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(measure)
    })
    return () => { cancelAnimationFrame(raf1); cancelAnimationFrame(raf2) }
  }, [enabled, text, fontSize, hPad, measure])

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

  const goToPage = useCallback((page) =>
    setState(s => ({ ...s, currentPage: Math.min(Math.max(page, 0), s.totalPages - 1) })), [])

  // 터치 스와이프 — 좌: 다음, 우: 이전
  useEffect(() => {
    if (!enabled) return
    const el = wrapperRef.current
    if (!el) return

    function onTouchStart(e) {
      touchStartX.current = e.touches[0].clientX
    }
    function onTouchEnd(e) {
      if (touchStartX.current === null) return
      const delta = touchStartX.current - e.changedTouches[0].clientX
      if (Math.abs(delta) >= SWIPE_THRESHOLD) {
        delta > 0 ? goNext() : goPrev()
      }
      touchStartX.current = null
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchend', onTouchEnd)
    }
  }, [enabled, goNext, goPrev])

  const progressRatio = state.totalPages > 1 ? state.currentPage / (state.totalPages - 1) : 0

  return { ...state, goNext, goPrev, goToPage, progressRatio, wrapperRef, columnRef }
}
