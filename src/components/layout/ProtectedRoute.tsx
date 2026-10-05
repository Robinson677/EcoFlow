import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) return <p aria-busy="true" className="p-6">Cargando…</p>
  if (!user) return <Navigate to="/login" replace />

  return <>{children}</>
}
