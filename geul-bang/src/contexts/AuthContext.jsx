import { createContext, useContext, useEffect, useState } from 'react'
import { subscribeAuth, loginAnonymously } from '../services/auth.service'
import { useToast } from './ToastContext'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // undefined = 로딩 중 / null = 인증 실패 / User = 로그인됨
  const [user, setUser] = useState(undefined)
  const showToast = useToast()

  useEffect(() => {
    let active = true

    // onAuthStateChanged가 12초 내에 응답 없으면 null로 전환 (무한로딩 방지)
    const timeoutId = setTimeout(() => {
      if (active) {
        console.error('Auth timeout: Firebase 인증 서버 응답 없음')
        setUser(u => u === undefined ? null : u)
      }
    }, 12000)

    const unsubscribe = subscribeAuth(async (firebaseUser) => {
      clearTimeout(timeoutId)
      if (!active) return
      if (firebaseUser) {
        setUser(firebaseUser)
      } else {
        try {
          const newUser = await loginAnonymously()
          if (active) setUser(newUser)
        } catch (e) {
          console.error('익명 로그인 실패:', e.code, e.message)
          if (active) {
            setUser(null)
            showToast(`서비스에 연결할 수 없습니다. (${e.code || e.message})`, 'error', 8000)
          }
        }
      }
    })

    return () => {
      active = false
      clearTimeout(timeoutId)
      unsubscribe()
    }
  }, [showToast])

  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
