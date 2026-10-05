// Tipos del esquema de Supabase (EcoFlow).
// Destino: src/types/database.types.ts
// Reflejan schema.sql; si cambia el esquema, se actualizan aquí.

export type EstadoProyecto = 'Pendiente' | 'En Progreso' | 'Completado'
export type RolInstalador = 'instalador' | 'admin'

export interface Database {
  public: {
    Tables: {
      instaladores: {
        Row: {
          id: string
          nombre: string
          telefono: string | null
          rol: RolInstalador
          created_at: string
        }
        Insert: {
          id: string
          nombre: string
          telefono?: string | null
          rol?: RolInstalador
          created_at?: string
        }
        Update: {
          nombre?: string
          telefono?: string | null
        }
        Relationships: []
      }
      proyectos: {
        Row: {
          id: string
          nombre: string
          cliente: string
          direccion: string
          potencia_kw: number
          estado: EstadoProyecto
          instalador_id: string | null
          fecha_inicio: string | null
          created_at: string
        }
        Insert: {
          id?: string
          nombre: string
          cliente: string
          direccion: string
          potencia_kw: number
          estado?: EstadoProyecto
          instalador_id?: string | null
          fecha_inicio?: string | null
          created_at?: string
        }
        // Por privilegios de columna, el cliente solo puede actualizar "estado"
        Update: {
          estado?: EstadoProyecto
        }
        Relationships: [
          {
            foreignKeyName: 'proyectos_instalador_id_fkey'
            columns: ['instalador_id']
            isOneToOne: false
            referencedRelation: 'instaladores'
            referencedColumns: ['id']
          },
        ]
      }
      materiales: {
        Row: {
          id: string
          proyecto_id: string
          nombre: string
          cantidad: number
          costo_unitario: number
          created_at: string
        }
        Insert: {
          id?: string
          proyecto_id: string
          nombre: string
          cantidad: number
          costo_unitario?: number
          created_at?: string
        }
        Update: Record<string, never>
        Relationships: [
          {
            foreignKeyName: 'materiales_proyecto_id_fkey'
            columns: ['proyecto_id']
            isOneToOne: false
            referencedRelation: 'proyectos'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

// Tipos de dominio: lo que usan hooks y componentes
export type Instalador = Database['public']['Tables']['instaladores']['Row']
export type Proyecto = Database['public']['Tables']['proyectos']['Row']
export type NuevoProyecto = Database['public']['Tables']['proyectos']['Insert']
export type Material = Database['public']['Tables']['materiales']['Row']
