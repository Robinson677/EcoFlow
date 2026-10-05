import { createContext } from 'react'
import type { User } from '@supabase/supabase-js'
import type { Instalador } from '../types/database.types'

export interface AuthContextValue {
  user: User | null
  perfil: Instalador | null
  esAdmin: boolean
  loading: boolean
  iniciarSesion: (email: string, password: string) => Promise<void>
  cerrarSesion: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
