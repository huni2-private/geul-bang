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

export function useReader(novelId, initialScroll) {
  const user = useAuth()
  const initialized = useRef(false)

  // 저장된 위치로 이동
  useEffect(() => {
    if (!initialized.current && initialScroll > 0) {
      window.scrollTo({ top: initialScroll, behavior: 'instant' })
      initialized.current = true
    }
  }, [initialScroll])

  // debounce 1초로 스크롤 위치 자동 저장
  useEffect(() => {
    if (!user || !novelId) return

    const save = debounce(() => {
      const scrollY = window.scrollY
      const maxScroll = document.body.scrollHeight - window.innerHeight
      const ratio = maxScroll > 0 ? scrollY / maxScroll : 0
      updateProgress(user.uid, novelId, {
        scrollPosition: scrollY,
        progressRatio: Math.min(ratio, 1),
      })
    }, 1000)

    window.addEventListener('scroll', save, { passive: true })
    return () => window.removeEventListener('scroll', save)
  }, [user, novelId])
}
