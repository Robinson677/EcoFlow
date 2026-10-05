import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase/client'
import type { Instalador } from '../types/database.types'

export async function iniciarSesion(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  // Mensaje genérico: evita enumeración de usuarios
  if (error) throw new Error('Correo o contraseña incorrectos.')
}

export async function cerrarSesion(): Promise<void> {
  const { error } = await supabase.auth.signOut()
  if (error) throw new Error(error.message)
}

export async function obtenerSesion(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw new Error(error.message)
  return data.session
}

// Devuelve la función para cancelar la suscripción
export function suscribirseASesion(
  callback: (session: Session | null) => void,
): () => void {
  const { data } = supabase.auth.onAuthStateChange((_evento, session) => {
    callback(session)
  })
  return () => data.subscription.unsubscribe()
}

// RLS: cada usuario solo puede leer su propia fila (el admin, todas)
export async function obtenerPerfil(userId: string): Promise<Instalador | null> {
  const { data, error } = await supabase
    .from('instaladores')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data
}
