// Acceso a datos de la tabla "proyectos".
// Destino: src/services/proyectos.service.ts
// RLS decide qué filas se ven: el instalador solo recibe las suyas, el admin todas.
import { supabase } from './supabase/client'
import type {
  EstadoProyecto,
  NuevoProyecto,
  Proyecto,
} from '../types/database.types'

export async function listarProyectos(): Promise<Proyecto[]> {
  const { data, error } = await supabase
    .from('proyectos')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

// Solo un admin puede insertar (política proyectos_insert_admin)
export async function crearProyecto(input: NuevoProyecto): Promise<Proyecto> {
  const { data, error } = await supabase
    .from('proyectos')
    .insert(input)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

// Es la única columna que el cliente puede actualizar (privilegio por columna)
export async function actualizarEstado(
  id: string,
  estado: EstadoProyecto,
): Promise<Proyecto> {
  const { data, error } = await supabase
    .from('proyectos')
    .update({ estado })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}
