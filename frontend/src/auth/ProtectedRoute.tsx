import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { usuario, loading } = useAuth()

  if (loading) {
    return <p>Cargando...</p>
  }

  if (!usuario) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export function AdminRoute({ children }: { children: ReactNode }) {
  const { usuario, isAdmin, loading } = useAuth()

  if (loading) {
    return <p>Cargando...</p>
  }

  if (!usuario) {
    return <Navigate to="/login" replace />
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

export function DocenteRoute({ children }: { children: ReactNode }) {
  const { usuario, isAdmin, isDocente, loading } = useAuth()

  if (loading) {
    return <p>Cargando...</p>
  }

  if (!usuario) {
    return <Navigate to="/login" replace />
  }

  if (!isAdmin && !isDocente) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
