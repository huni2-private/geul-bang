// 앱 전역 Toast 알림 컨텍스트
import { createContext, useContext, useState, useCallback } from 'react'
import { css, cx } from 'styled-system/css'

const ToastContext = createContext(null)

const toastWrap = css({
  position: 'fixed',
  bottom: '24px',
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 9999,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '8px',
  pointerEvents: 'none',
})

const toastItem = css({
  padding: '10px 18px',
  borderRadius: '10px',
  fontSize: '14px',
  fontWeight: '500',
  boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
  pointerEvents: 'auto',
  maxWidth: '320px',
  textAlign: 'center',
  animation: 'fadeIn 0.2s ease',
})

const variants = {
  error: css({ background: '#ef4444', color: '#fff' }),
  warn:  css({ background: '#f59e0b', color: '#fff' }),
  info:  css({ background: 'var(--colors-bg-card)', color: 'var(--colors-text)', border: '1px solid var(--colors-border)' }),
}

let idCounter = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = ++idCounter
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, duration)
  }, [])

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className={toastWrap}>
        {toasts.map((t) => (
          <div key={t.id} className={cx(toastItem, variants[t.type] || variants.info)}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
