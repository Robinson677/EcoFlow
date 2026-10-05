// Hook que consume la capa de servicios. Los componentes usan este hook, no Supabase.
// Destino: src/hooks/useProyectos.ts
import { useCallback, useEffect, useState } from 'react'
import {
  actualizarEstado,
  crearProyecto,
  listarProyectos,
} from '../services/proyectos.service'
import type {
  EstadoProyecto,
  NuevoProyecto,
  Proyecto,
} from '../types/database.types'

function mensaje(e: unknown): string {
  return e instanceof Error ? e.message : 'Error desconocido'
}

export function useProyectos() {
  const [proyectos, setProyectos] = useState<Proyecto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [version, setVersion] = useState(0)

  useEffect(() => {
    let activo = true
    listarProyectos()
      .then((data) => {
        if (activo) setProyectos(data)
      })
      .catch((e: unknown) => {
        if (activo) setError(mensaje(e))
      })
      .finally(() => {
        if (activo) setLoading(false)
      })
    return () => {
      activo = false
    }
  }, [version])

  const recargar = useCallback(() => {
    setLoading(true)
    setError(null)
    setVersion((v) => v + 1)
  }, [])

  const crear = useCallback(
    async (input: NuevoProyecto) => {
      const nuevo = await crearProyecto(input)
      setProyectos((prev) => [nuevo, ...prev])
      return nuevo
    },
    [],
  )

  const cambiarEstado = useCallback(
    async (id: string, estado: EstadoProyecto) => {
      const actualizado = await actualizarEstado(id, estado)
      setProyectos((prev) => prev.map((p) => (p.id === id ? actualizado : p)))
    },
    [],
  )

  return { proyectos, loading, error, recargar, crear, cambiarEstado }
}
