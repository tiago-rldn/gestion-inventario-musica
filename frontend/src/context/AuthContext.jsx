import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { login as loginRequest } from '../api/api'
import { TOKEN_KEY } from '../api/http'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [loading, setLoading] = useState(false)

  const isAuthenticated = Boolean(token)

  const login = useCallback(async (username, password) => {
    setLoading(true)
    try {
      const data = await loginRequest(username, password)
      localStorage.setItem(TOKEN_KEY, data.token)
      setToken(data.token)
      return data.token
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
  }, [])

  const value = useMemo(
    () => ({ token, isAuthenticated, loading, login, logout }),
    [token, isAuthenticated, loading, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider')
  }
  return context
}