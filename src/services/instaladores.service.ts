import { supabase } from './supabase/client'
import type { Instalador } from '../types/database.types'

// Solo el admin ve a todos (política instaladores_select)
export async function listarInstaladores(): Promise<Instalador[]> {
  const { data, error } = await supabase
    .from('instaladores')
    .select('*')
    .order('nombre', { ascending: true })

  if (error) throw new Error(error.message)
  return data
}
