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
        const newUser = await loginAnonymously()
        setUser(newUser)
      }
    })
    return unsubscribe
  }, [])

  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
