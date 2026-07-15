import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { authApi, type LoginRequest, type RegisterRequest, type UsuarioResponse } from '../api/auth'
import { clearToken, getToken, setToken } from '../api/client'

interface AuthContextValue {
  usuario: UsuarioResponse | null
  loading: boolean
  isAdmin: boolean
  isDocente: boolean
  login: (data: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => void
  actualizarUsuario: (usuario: UsuarioResponse) => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!getToken()) {
      setLoading(false)
      return
    }
    authApi
      .me()
      .then(setUsuario)
      .catch(() => clearToken())
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (data: LoginRequest) => {
    const response = await authApi.login(data)
    setToken(response.token)
    setUsuario(response.usuario)
  }, [])

  const register = useCallback(async (data: RegisterRequest) => {
    const response = await authApi.register(data)
    setToken(response.token)
    setUsuario(response.usuario)
  }, [])

  const logout = useCallback(() => {
    clearToken()
    setUsuario(null)
  }, [])

  const actualizarUsuario = useCallback((nuevo: UsuarioResponse) => {
    setUsuario(nuevo)
  }, [])

  const isAdmin = usuario?.nivel === 'Administrador'
  const isDocente = usuario?.nivel === 'Docente'

  return (
    <AuthContext.Provider
      value={{ usuario, loading, isAdmin, isDocente, login, register, logout, actualizarUsuario }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}
