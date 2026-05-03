import { createContext, useContext, useEffect, useState } from 'react'
import { subscribeAuth, loginAnonymously } from '../services/auth.service'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined)

  useEffect(() => {
    const unsubscribe = subscribeAuth(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
      } else {
        try {
          const newUser = await loginAnonymously()
          setUser(newUser)
        } catch (e) {
          console.error('익명 로그인 실패:', e)
          alert('서비스에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.')
        }
      }
    })
    return unsubscribe
  }, [])

  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
