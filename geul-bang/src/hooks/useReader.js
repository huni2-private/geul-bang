import { useEffect, useRef } from 'react'
import { updateProgress } from '../services/novel.service'
import { useAuth } from '../contexts/AuthContext'

function debounce(fn, delay) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

export function useReader(novelId, initialScroll, disabled = false) {
  const user = useAuth()
  const initialized = useRef(false)

  // 저장된 위치로 이동
  useEffect(() => {
    if (disabled) return
    if (!initialized.current && initialScroll > 0) {
      window.scrollTo({ top: initialScroll, behavior: 'instant' })
      initialized.current = true
    }
  }, [initialScroll, disabled])

  // debounce 1초로 스크롤 위치 자동 저장
  useEffect(() => {
    if (disabled || !user || !novelId) return

    function getProgress() {
      const scrollY = window.scrollY
      const maxScroll = document.body.scrollHeight - window.innerHeight
      const ratio = maxScroll > 0 ? scrollY / maxScroll : 0
      return { scrollPosition: scrollY, progressRatio: Math.min(ratio, 1) }
    }

    const save = debounce(() => {
      updateProgress(user.uid, novelId, getProgress())
    }, 1000)

    // 페이지 이탈 시 즉시 저장 (debounce 미발동 방지)
    function saveNow() {
      updateProgress(user.uid, novelId, getProgress())
    }

    window.addEventListener('scroll', save, { passive: true })
    document.addEventListener('visibilitychange', saveNow)
    window.addEventListener('pagehide', saveNow)

    return () => {
      window.removeEventListener('scroll', save)
      document.removeEventListener('visibilitychange', saveNow)
      window.removeEventListener('pagehide', saveNow)
    }
  }, [user, novelId, disabled])
}
