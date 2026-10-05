import { useEffect, useState, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { AuthContext } from './AuthContext'
import {
  cerrarSesion,
  iniciarSesion,
  obtenerPerfil,
  obtenerSesion,
  suscribirseASesion,
} from '../services/auth.service'
import type { Instalador } from '../types/database.types'

interface PerfilResuelto {
  id: string
  perfil: Instalador | null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [sesionLista, setSesionLista] = useState(false)
  const [perfilResuelto, setPerfilResuelto] = useState<PerfilResuelto | null>(null)

  // 1. Sesión actual y cambios (login / logout)
  useEffect(() => {
    let activo = true
    obtenerSesion()
      .then((s) => {
        if (activo) setUser(s?.user ?? null)
      })
      .catch(() => {
        if (activo) setUser(null)
      })
      .finally(() => {
        if (activo) setSesionLista(true)
      })
    const cancelar = suscribirseASesion((s) => setUser(s?.user ?? null))
    return () => {
      activo = false
      cancelar()
    }
  }, [])

  // 2. Perfil (nombre y rol) del usuario autenticado
  const userId = user?.id
  useEffect(() => {
    if (!userId) return
    let activo = true
    obtenerPerfil(userId)
      .then((perfil) => {
        if (activo) setPerfilResuelto({ id: userId, perfil })
      })
      .catch(() => {
        if (activo) setPerfilResuelto({ id: userId, perfil: null })
      })
    return () => {
      activo = false
    }
  }, [userId])

  // Se ignora un perfil que pertenezca a otro usuario (p. ej. tras cerrar sesión)
  const resuelto = user && perfilResuelto?.id === user.id ? perfilResuelto : null
  const perfil = resuelto?.perfil ?? null
  const loading = !sesionLista || (user !== null && resuelto === null)

  return (
    <AuthContext.Provider
      value={{
        user,
        perfil,
        esAdmin: perfil?.rol === 'admin',
        loading,
        iniciarSesion,
        cerrarSesion,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
