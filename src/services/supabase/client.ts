// Cliente único de Supabase.
// Destino: src/services/supabase/client.ts
// Solo los servicios importan este archivo; los componentes nunca.
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../../types/database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY en el archivo .env',
  )
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey)
